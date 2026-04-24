import logging
from typing import Dict, Any

from omniseed.domain.config import ConfigManager
from omniseed.infrastructure.schema_inspector import SchemaInspector
from omniseed.domain.state_hasher import StateHasher
from omniseed.infrastructure.cache_manager import CacheManager
from omniseed.infrastructure.ai_engine import AIEngine
from omniseed.infrastructure.database_executor import DatabaseExecutor

logger = logging.getLogger(__name__)

class GenerateUseCase:
    def __init__(self, 
                 config: ConfigManager, 
                 inspector: SchemaInspector, 
                 cache_manager: CacheManager, 
                 ai_engine: AIEngine):
        self.config = config
        self.inspector = inspector
        self.cache_manager = cache_manager
        self.ai_engine = ai_engine

    def execute(self) -> Dict[str, Any]:
        """
        Executes the 'generate' flow described in specs.
        """
        logger.info("Starting schema extraction...")
        schema_dict = self.inspector.inspect()
        
        schema_hash = StateHasher.generate_hash(schema_dict)
        logger.info(f"Schema hash generated: {schema_hash}")

        if self.cache_manager.has_cache(schema_hash):
            msg = "Golden state already cached."
            logger.info(msg)
            return {"status": "cached", "message": msg, "hash": schema_hash}

        logger.info("Cache missed. Requesting generation from AI Engine...")
        sql_output = self.ai_engine.generate_sql(schema_dict)
        
        logger.info("AI generation successful. Saving to cache...")
        self.cache_manager.write_cache(schema_hash, sql_output)
        
        return {"status": "generated", "message": "New seed data generated and cached successfully.", "hash": schema_hash}

class ResetUseCase:
    def __init__(self, 
                 config: ConfigManager, 
                 inspector: SchemaInspector, 
                 cache_manager: CacheManager, 
                 executor: DatabaseExecutor):
        self.config = config
        self.inspector = inspector
        self.cache_manager = cache_manager
        self.executor = executor

    def execute(self) -> Dict[str, Any]:
        """
        Executes the 'reset' flow described in specs.
        """
        logger.info("Starting schema extraction for reset...")
        schema_dict = self.inspector.inspect()
        
        schema_hash = StateHasher.generate_hash(schema_dict)
        
        if not self.cache_manager.has_cache(schema_hash):
            raise FileNotFoundError(f"Missing cache for current schema state ({schema_hash}). Please run 'generate' first.")

        logger.info(f"Cache found for hash {schema_hash}. Reading SQL script...")
        sql_script = self.cache_manager.read_cache(schema_hash)

        logger.info("Executing safe database reset transaction...")
        metrics = self.executor.reset_database(schema_dict, sql_script)
        
        logger.info(f"Reset successful. Restored {metrics['affected_rows']} rows in {metrics['duration_seconds']}s")
        return {
            "status": "success",
            "metrics": metrics
        }
