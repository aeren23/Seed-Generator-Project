import pytest
import json
from omniseed.infrastructure.ai_engine import AIEngine, OpenAIEngine, AnthropicEngine, GeminiEngine, get_ai_engine, LLMOutputError
from omniseed.domain.config import ConfigManager

class MockDummyEngine(AIEngine):
    def __init__(self, config, mock_response: str, should_fail_times: int = 0):
        super().__init__(config)
        self.mock_response = mock_response
        self.should_fail_times = should_fail_times
        self.call_count = 0

    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        self.call_count += 1
        if self.call_count <= self.should_fail_times:
            raise ConnectionError("Mock network failure")
        return self.mock_response

@pytest.fixture
def test_config(monkeypatch):
    monkeypatch.setenv("DB_CONNECTION_STRING", "sqlite:///test.db")
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    monkeypatch.setenv("SYSTEM_CONTEXT", "test application")
    monkeypatch.setenv("DATA_SCALE", "medium")
    monkeypatch.setenv("SEED_LANGUAGE", "en")
    return ConfigManager()

def test_build_system_prompt(test_config):
    engine = MockDummyEngine(test_config, "INSERT INTO tables;")
    prompt = engine.build_system_prompt()
    assert "Generate a 'medium' amount" in prompt
    assert "in en" in prompt
    assert "Context: test application" in prompt

def test_clean_sql_output(test_config):
    engine = MockDummyEngine(test_config, "")
    
    # Needs cleaning
    raw = "```sql\nINSERT INTO users (id) VALUES (1);\n```"
    cleaned = engine.clean_sql_output(raw)
    assert cleaned == "INSERT INTO users (id) VALUES (1);"
    
    # Already clean
    raw_clean = "INSERT INTO test (a) VALUES (2);"
    cleaned_clean = engine.clean_sql_output(raw_clean)
    assert cleaned_clean == "INSERT INTO test (a) VALUES (2);"
    
    # Empty after clean throws error
    with pytest.raises(LLMOutputError):
        engine.clean_sql_output("```sql\n\n```")

def test_retry_mechanism(test_config):
    # Fails 2 times, succeeds on 3rd
    engine = MockDummyEngine(test_config, "INSERT INTO success;", should_fail_times=2)
    result = engine.generate_sql({"tables": []})
    assert result == "INSERT INTO success;"
    assert engine.call_count == 3
    
    # Fails 3 times = failure
    engine_fail = MockDummyEngine(test_config, "fail", should_fail_times=3)
    with pytest.raises(LLMOutputError):
        engine_fail.generate_sql({"tables": []}, max_retries=2)

def test_factory_method(test_config, monkeypatch):
    monkeypatch.setattr(test_config, "llm_provider", "openai")
    assert isinstance(get_ai_engine(test_config), OpenAIEngine)
    
    monkeypatch.setattr(test_config, "llm_provider", "anthropic")
    assert isinstance(get_ai_engine(test_config), AnthropicEngine)
    
    monkeypatch.setattr(test_config, "llm_provider", "gemini")
    assert isinstance(get_ai_engine(test_config), GeminiEngine)
    
    monkeypatch.setattr(test_config, "llm_provider", "unknown")
    with pytest.raises(NotImplementedError):
        get_ai_engine(test_config)
