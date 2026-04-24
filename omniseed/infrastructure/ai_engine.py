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
        """Constructs the strict system prompt directly from spec.md §5."""
        return (
            f"You are an expert SQL Database Administrator. I will provide you with a database schema in JSON format. "
            f"Your task is to generate {self.config.row_count_per_table} rows of realistic data for these tables in {self.config.seed_language}.\n"
            f"Context: {self.config.system_context}.\n\n"
            f"CRITICAL RULES:\n"
            f"1. Respect Foreign Key dependencies. Insert parent tables before child tables.\n"
            f"2. Output ONLY pure SQL `INSERT` statements. Do not include markdown formatting like ```sql or explanations.\n"
            f"3. Ensure data types match the schema."
        )

    def clean_sql_output(self, raw_output: str) -> str:
        """Cleans markdown syntax like ```sql ... ``` from the LLM output."""
        cleaned = raw_output.strip()
        # Remove markdown code block markers
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE)
        cleaned = cleaned.strip()

        if not cleaned:
            raise LLMOutputError("LLM returned empty output after cleaning.")
        if not cleaned.lower().startswith("insert"):
            # It might start with comments. We just allow it but log a warning
            logger.warning("Generated SQL does not strictly start with 'INSERT'. It might contain unexpected text.")
        
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
            max_tokens=4096,
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
