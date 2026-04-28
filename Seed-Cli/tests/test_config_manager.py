import pytest
from pydantic import ValidationError
from omniseed.domain.config import ConfigManager

def test_config_manager_valid(monkeypatch):
    monkeypatch.setenv("DB_CONNECTION_STRING", "sqlite:///test.db")
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    monkeypatch.setenv("SYSTEM_CONTEXT", "test context")
    
    config = ConfigManager()
    assert config.db_connection_string == "sqlite:///test.db"
    assert config.llm_api_key == "test-key"
    assert config.system_context == "test context"
    assert config.llm_provider == "openai"
    assert config.data_scale == "small"
    assert config.db_type == "sqlite"

def test_config_manager_invalid_db_scheme(monkeypatch):
    monkeypatch.setenv("DB_CONNECTION_STRING", "mongodb://localhost:27017")
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    monkeypatch.setenv("SYSTEM_CONTEXT", "test")
    
    with pytest.raises(ValidationError) as exc_info:
        ConfigManager()
    
    assert "is not supported" in str(exc_info.value)

def test_config_manager_postgres_alias(monkeypatch):
    monkeypatch.setenv("DB_CONNECTION_STRING", "postgres://user:pass@localhost/db")
    monkeypatch.setenv("LLM_API_KEY", "test")
    monkeypatch.setenv("SYSTEM_CONTEXT", "test")

    config = ConfigManager()
    assert config.db_type == "postgresql"
