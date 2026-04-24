import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

class DatabaseExecutor(ABC):
    """
    Abstract Base Class for executing SQL scripts safely.
    Handles disabling FKs, truncating/deleting data, executing payload, and re-enabling FKs.
    """
    def __init__(self, connection_string: str):
        self.engine: Engine = create_engine(connection_string)

    @abstractmethod
    def _disable_fks(self, connection) -> None:
        pass

    @abstractmethod
    def _enable_fks(self, connection) -> None:
        pass

    @abstractmethod
    def _clean_database(self, connection, tables: List[str]) -> None:
        pass

    def reset_database(self, schema_dict: Dict[str, Any], sql_script: str) -> Dict[str, Any]:
        """
        Executes the reset flow transactionally.
        Returns performance metrics.
        """
        tables = [t["name"] for t in schema_dict.get("tables", [])]
        start_time = time.time()
        total_affected_rows = 0

        # Create statements, ignoring empty ones
        statements = [s.strip() for s in sql_script.split(";") if s.strip()]

        with self.engine.begin() as conn:
            try:
                self._disable_fks(conn)
                self._clean_database(conn, tables)

                for stmt in statements:
                    result = conn.execute(text(stmt))
                    total_affected_rows += result.rowcount

            except Exception as e:
                logger.error(f"Transaction failed, rolling back. Error: {str(e)}")
                raise
            finally:
                # Always attempt to re-enable FKs even if it failed, though engine.begin() rollback drops connection state safely
                try:
                    self._enable_fks(conn)
                except Exception as e2:
                    logger.warning(f"Failed to cleanly re-enable FK constraints: {str(e2)}")

        duration = time.time() - start_time
        return {
            "duration_seconds": round(duration, 4),
            "affected_rows": total_affected_rows
        }

class PostgreSQLExecutor(DatabaseExecutor):
    def _disable_fks(self, connection) -> None:
        # Standard way to defer foreign keys inside a transaction
        connection.execute(text("SET CONSTRAINTS ALL DEFERRED;"))

    def _enable_fks(self, connection) -> None:
        connection.execute(text("SET CONSTRAINTS ALL IMMEDIATE;"))

    def _clean_database(self, connection, tables: List[str]) -> None:
        if not tables:
            return
        # TRUNCATE is transaction safe in PostgreSQL
        tables_str = ", ".join([f'"{t}"' for t in tables])
        connection.execute(text(f"TRUNCATE TABLE {tables_str} CASCADE;"))

class MySQLExecutor(DatabaseExecutor):
    def _disable_fks(self, connection) -> None:
        connection.execute(text("SET FOREIGN_KEY_CHECKS=0;"))

    def _enable_fks(self, connection) -> None:
        connection.execute(text("SET FOREIGN_KEY_CHECKS=1;"))

    def _clean_database(self, connection, tables: List[str]) -> None:
        # TRUNCATE implicitly commits in MySQL, breaking transaction rollback.
        # We use DELETE FROM instead to keep it fully transactional.
        for table in tables:
            connection.execute(text(f"DELETE FROM `{table}`;"))

class SQLiteExecutor(DatabaseExecutor):
    def _disable_fks(self, connection) -> None:
        connection.execute(text("PRAGMA foreign_keys = OFF;"))

    def _enable_fks(self, connection) -> None:
        connection.execute(text("PRAGMA foreign_keys = ON;"))

    def _clean_database(self, connection, tables: List[str]) -> None:
        for table in tables:
            # Filter internal sqlite tables
            if table != "sqlite_sequence":
                connection.execute(text(f"DELETE FROM \"{table}\";"))


def get_executor(connection_string: str, db_type: str) -> DatabaseExecutor:
    if db_type == "postgresql":
        return PostgreSQLExecutor(connection_string)
    elif db_type == "mysql":
        return MySQLExecutor(connection_string)
    elif db_type == "sqlite":
        return SQLiteExecutor(connection_string)
    else:
        raise NotImplementedError(f"DatabaseExecutor for {db_type} is not implemented.")
