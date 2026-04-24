import pytest
from unittest.mock import MagicMock

from omniseed.application.usecases import GenerateUseCase, ResetUseCase
from omniseed.domain.config import ConfigManager

@pytest.fixture
def mock_dependencies():
    config = MagicMock(spec=ConfigManager)
    inspector = MagicMock()
    inspector.inspect.return_value = {"tables": [{"name": "test_table"}]}
    cache_manager = MagicMock()
    ai_engine = MagicMock()
    executor = MagicMock()
    
    return config, inspector, cache_manager, ai_engine, executor

def test_generate_usecase_cached(mock_dependencies):
    config, inspector, cache_manager, ai_engine, _ = mock_dependencies
    cache_manager.has_cache.return_value = True
    
    usecase = GenerateUseCase(config, inspector, cache_manager, ai_engine)
    result = usecase.execute()
    
    assert result["status"] == "cached"
    ai_engine.generate_sql.assert_not_called()
    cache_manager.write_cache.assert_not_called()

def test_generate_usecase_not_cached(mock_dependencies):
    config, inspector, cache_manager, ai_engine, _ = mock_dependencies
    cache_manager.has_cache.return_value = False
    ai_engine.generate_sql.return_value = "INSERT INTO test_table VALUES (1);"
    
    usecase = GenerateUseCase(config, inspector, cache_manager, ai_engine)
    result = usecase.execute()
    
    assert result["status"] == "generated"
    ai_engine.generate_sql.assert_called_once()
    cache_manager.write_cache.assert_called_once()

def test_reset_usecase_missing_cache(mock_dependencies):
    config, inspector, cache_manager, _, executor = mock_dependencies
    cache_manager.has_cache.return_value = False
    
    usecase = ResetUseCase(config, inspector, cache_manager, executor)
    with pytest.raises(FileNotFoundError, match="Please run 'generate' first"):
        usecase.execute()

def test_reset_usecase_success(mock_dependencies):
    config, inspector, cache_manager, _, executor = mock_dependencies
    cache_manager.has_cache.return_value = True
    cache_manager.read_cache.return_value = "INSERT INTO test_table VALUES (1);"
    executor.reset_database.return_value = {"affected_rows": 1, "duration_seconds": 0.5}
    
    usecase = ResetUseCase(config, inspector, cache_manager, executor)
    result = usecase.execute()
    
    assert result["status"] == "success"
    assert result["metrics"]["affected_rows"] == 1
    executor.reset_database.assert_called_once()
