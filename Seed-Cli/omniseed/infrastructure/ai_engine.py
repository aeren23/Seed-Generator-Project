import json
import re
import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

from omniseed.domain.config import ConfigManager

logger = logging.getLogger(__name__)

class LLMOutputError(Exception):
    pass

class AIEngine(ABC):
    """
    Abstract interface for AI Engines.
    Generates INSERT statements based on the provided JSON schema and Config parameters.
    """
    def __init__(self, config: ConfigManager):
        self.config = config

    def build_system_prompt(self) -> str:
        """Constructs a universal system prompt for any database schema."""
        return f"""You are a database seeding expert. Generate SQL INSERT statements.
LANGUAGE: {self.config.seed_language}
CONTEXT: {self.config.system_context}

CRITICAL RULES:
1. Quoting: ALWAYS use double quotes for table and column names (e.g., INSERT INTO "TableName" ("Col") VALUES ...).
2. Format: Individual INSERT statements, one per line, ending with ';'.
3. Consistency: Ensure all Foreign Key relationships are respected.
4. Output ONLY raw SQL starting with INSERT. No markdown, no explanations."""

    def clean_sql_output(self, raw_output: str) -> str:
        """Cleans markdown syntax and handles truncated outputs."""
        cleaned = raw_output.strip()
        # Remove markdown code block markers
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE)
        cleaned = cleaned.strip()

        if not cleaned:
            raise LLMOutputError("LLM returned empty output after cleaning.")

        # --- COMMENT & HEADER STRIPPER ---
        # Find the first occurrence of 'INSERT INTO' (case insensitive) and discard everything before it.
        first_insert = cleaned.lower().find("insert into")
        if first_insert != -1:
            cleaned = cleaned[first_insert:]
        
        # Filter: Keep ONLY lines that start with INSERT INTO or are empty
        lines = cleaned.split("\n")
        cleaned = "\n".join([line for line in lines if line.strip().lower().startswith("insert into") or line.strip() == ""])
        # ---------------------------------

        # --- TRUNCATION REPAIR ---
        # If the LLM was truncated, the last line might be incomplete.
        lines = cleaned.split("\n")
        if lines and lines[-1].strip() and not lines[-1].strip().endswith(";"):
            logger.warning(f"Truncated line detected and removed: {lines[-1]}")
            lines = lines[:-1]
        cleaned = "\n".join(lines)

        # --- SMART UUID REPAIR STEP ---
        def repair_uuid(match):
            val = match.group(0).strip("'")
            parts = val.split('-')
            if len(parts) == 5:
                first = re.sub(r'[^0-9a-fA-F]', '0', parts[0])
                if len(first) > 8: first = first[-8:] 
                parts[0] = first.zfill(8)             
                for i in range(1, 5):
                    parts[i] = re.sub(r'[^0-9a-fA-F]', '0', parts[i])
                return f"'{'-'.join(parts)}'"
            return match.group(0)

        cleaned = re.sub(r"'[^']+\-[^']+\-[^']+\-[^']+\-[^']+'", repair_uuid, cleaned)
        # ------------------------

        if not cleaned.lower().strip().startswith("insert"):
            logger.warning("Generated SQL does not strictly start with 'INSERT'.")
        
        return cleaned

    @abstractmethod
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Subclass implementation to actually ping the specific LLM API."""
        pass

    def generate_sql(self, schema_dict: Dict[str, Any], max_retries: int = 3) -> str:
        """
        Main orchestration method with built-in retry mechanism.
        """
        system_prompt = self.build_system_prompt()
        user_prompt = json.dumps(schema_dict, indent=2)

        last_exception = None
        for attempt in range(max_retries):
            try:
                raw_output = self._call_llm(system_prompt, user_prompt)
                return self.clean_sql_output(raw_output)
            except Exception as e:
                last_exception = e
                logger.error(f"LLM Generation attempt {attempt + 1} failed: {str(e)}")
                time.sleep(2 ** attempt) # Exponential backoff: 1s, 2s, 4s

        raise LLMOutputError(f"Failed to generate valid SQL after {max_retries} attempts. Last error: {str(last_exception)}")


class OpenAIEngine(AIEngine):
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        from openai import OpenAI
        client = OpenAI(api_key=self.config.llm_api_key)
        response = client.chat.completions.create(
            model=self.config.llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content


class AnthropicEngine(AIEngine):
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        from anthropic import Anthropic
        client = Anthropic(api_key=self.config.llm_api_key)
        response = client.messages.create(
            model=self.config.llm_model,
            max_tokens=8192,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )
        # Anthropic response.content is a list of blocks
        return response.content[0].text


class GeminiEngine(AIEngine):
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        import google.generativeai as genai
        genai.configure(api_key=self.config.llm_api_key)
        model = genai.GenerativeModel(self.config.llm_model, system_instruction=system_prompt)
        response = model.generate_content(user_prompt)
        return response.text


def get_ai_engine(config: ConfigManager) -> AIEngine:
    """Factory method to get the correct AIEngine based on configuration."""
    provider = config.llm_provider.lower()
    if provider == "openai":
        return OpenAIEngine(config)
    elif provider == "anthropic":
        return AnthropicEngine(config)
    elif provider == "gemini":
        return GeminiEngine(config)
    else:
        raise NotImplementedError(f"LLM Provider '{provider}' is not supported.")
