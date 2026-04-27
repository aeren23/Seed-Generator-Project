import os
import pytest
from typer.testing import CliRunner
import sqlite3
from sqlalchemy import create_engine, text

from omniseed.cli.main import app
from omniseed.infrastructure.ai_engine import AIEngine, get_ai_engine

runner = CliRunner()

@pytest.fixture
def e2e_env(tmp_path, monkeypatch):
    """Setup E2E environment with SQLite and Mock AI Engine"""
    db_path = tmp_path / "e2e_db.sqlite"
    cache_dir = tmp_path / ".demo_cache"
    
    # Init DB
    conn_str = f"sqlite:///{db_path}"
    engine = create_engine(conn_str)
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, name VARCHAR(50))"))
        
    # Setup environment variables
    monkeypatch.setenv("DB_CONNECTION_STRING", conn_str)
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    monkeypatch.setenv("LLM_API_KEY", "dummy")
    monkeypatch.setenv("SYSTEM_CONTEXT", "test")
    monkeypatch.chdir(tmp_path)
    
    # Mock AIEngine to return valid SQL without hitting network
    class DummyE2EEngine(AIEngine):
        def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
            return "INSERT INTO users (id, name) VALUES (1, 'Alice E2E');"

    # Patch the factory to return our mock
    monkeypatch.setattr("omniseed.cli.main.get_ai_engine", lambda config: DummyE2EEngine(config))
    
    return engine

def test_e2e_flow(e2e_env, monkeypatch):
    """
    Test the full cycle: generate -> check cache -> regenerate -> verify db.
    """
    engine = e2e_env
    
    # Run Generate
    result = runner.invoke(app, ["generate"])
    assert result.exit_code == 0
    assert "Generation & Application Complete" in result.stdout
    assert "Affected Rows" in result.stdout
    
    # Verify DB state directly after generate
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        assert count == 1
        name = conn.execute(text("SELECT name FROM users")).scalar()
        assert name == "Alice E2E"
    
    # Run Generate Again (Cache Hit)
    result2 = runner.invoke(app, ["generate"])
    assert result2.exit_code == 0
    assert "Cache Hit & Applied" in result2.stdout
    
    # Change the mock to return different data for regenerate
    class DummyE2ERegenerateEngine(AIEngine):
        def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
            return "INSERT INTO users (id, name) VALUES (2, 'Bob Regenerated');"
            
    monkeypatch.setattr("omniseed.cli.main.get_ai_engine", lambda config: DummyE2ERegenerateEngine(config))
    
    # Run Regenerate
    result3 = runner.invoke(app, ["regenerate"])
    assert result3.exit_code == 0
    assert "Regeneration Complete" in result3.stdout
    assert "Affected Rows" in result3.stdout
    
    # Verify DB state changed after regenerate
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        assert count == 1  # Should still be 1 because old table is deleted
        name = conn.execute(text("SELECT name FROM users")).scalar()
        assert name == "Bob Regenerated"
