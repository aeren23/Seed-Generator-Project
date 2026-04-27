import os
from pathlib import Path

class CacheManager:
    """
    Manages `.sql` payload caching for a specific schema hash.
    Saves and retrieve files from `.demo_cache/`
    """
    def __init__(self, cache_dir: str = ".demo_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_path(self, schema_hash: str) -> Path:
        return self.cache_dir / f"{schema_hash}.sql"

    def has_cache(self, schema_hash: str) -> bool:
        """Check if a cached sql file exists for the given hash."""
        return self._get_file_path(schema_hash).is_file()

    def read_cache(self, schema_hash: str) -> str:
        """Read the SQL string cached for the given schema hash."""
        file_path = self._get_file_path(schema_hash)
        if not file_path.exists():
            raise FileNotFoundError(f"Cache file {file_path} not found.")
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def write_cache(self, schema_hash: str, sql_content: str) -> None:
        """Write the generated SQL string to the local cache directory."""
        file_path = self._get_file_path(schema_hash)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(sql_content)

    def delete_cache(self, schema_hash: str) -> bool:
        """Delete the cached sql file if it exists. Returns True if deleted, False if not found."""
        file_path = self._get_file_path(schema_hash)
        if file_path.exists():
            file_path.unlink()
            return True
        return False
