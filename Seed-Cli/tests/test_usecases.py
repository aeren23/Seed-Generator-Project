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
    config, inspector, cache_manager, ai_engine, executor = mock_dependencies
    cache_manager.has_cache.return_value = True
    cache_manager.read_cache.return_value = "SQL"
    executor.reset_database.return_value = {"affected_rows": 1, "duration_seconds": 0.5}
    
    usecase = GenerateUseCase(config, inspector, cache_manager, ai_engine, executor)
    result = usecase.execute()
    
    assert result["status"] == "cached"
    assert result["metrics"]["affected_rows"] == 1
    ai_engine.generate_sql.assert_not_called()
    cache_manager.write_cache.assert_not_called()
    executor.reset_database.assert_called_once()

def test_generate_usecase_not_cached(mock_dependencies):
    config, inspector, cache_manager, ai_engine, executor = mock_dependencies
    cache_manager.has_cache.return_value = False
    ai_engine.generate_sql.return_value = "INSERT INTO test_table VALUES (1);"
    executor.reset_database.return_value = {"affected_rows": 2, "duration_seconds": 0.5}
    
    usecase = GenerateUseCase(config, inspector, cache_manager, ai_engine, executor)
    result = usecase.execute()
    
    assert result["status"] == "generated"
    assert result["metrics"]["affected_rows"] == 2
    ai_engine.generate_sql.assert_called_once()
    cache_manager.write_cache.assert_called_once()
    executor.reset_database.assert_called_once()

def test_generate_usecase_force_regenerate(mock_dependencies):
    config, inspector, cache_manager, ai_engine, executor = mock_dependencies
    # Even if cache returns true initially, force_regenerate should call delete_cache
    cache_manager.has_cache.side_effect = [False] # it checks has_cache after force logic
    ai_engine.generate_sql.return_value = "INSERT INTO test_table VALUES (2);"
    executor.reset_database.return_value = {"affected_rows": 3, "duration_seconds": 0.5}
    
    usecase = GenerateUseCase(config, inspector, cache_manager, ai_engine, executor)
    result = usecase.execute(force_regenerate=True)
    
    assert result["status"] == "generated"
    cache_manager.delete_cache.assert_called_once()
    ai_engine.generate_sql.assert_called_once()
    executor.reset_database.assert_called_once()

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
