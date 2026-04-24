import pytest
from omniseed.infrastructure.cache_manager import CacheManager

def test_cache_manager(tmp_path):
    # tmp_path is a built-in pytest fixture providing a temporary directory
    cache_dir = tmp_path / ".demo_cache"
    manager = CacheManager(cache_dir=str(cache_dir))
    
    test_hash = "abcdef1234567890"
    test_sql = "INSERT INTO users (id) VALUES (1);"
    
    # Assert cache doesn't exist initially
    assert not manager.has_cache(test_hash)
    
    with pytest.raises(FileNotFoundError):
        manager.read_cache(test_hash)
        
    # Write to cache
    manager.write_cache(test_hash, test_sql)
    
    # Assert cache now exists and is readable
    assert manager.has_cache(test_hash)
    assert manager.read_cache(test_hash) == test_sql
