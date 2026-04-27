from abc import ABC, abstractmethod
from typing import Dict, Any
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import Engine

class SchemaInspector(ABC):
    @abstractmethod
    def inspect(self) -> Dict[str, Any]:
        """Returns a unified JSON-serializable schema representation."""
        pass

class SQLAlchemyBaseInspector(SchemaInspector):
    """
    Base inspector leveraging SQLAlchemy's inspection module.
    For PostgreSQL, this automatically runs robust information_schema queries.
    For SQLite and MySQL, it queries their respective metadata tables.
    """
    def __init__(self, connection_string: str):
        self.engine: Engine = create_engine(connection_string)

    def inspect(self) -> Dict[str, Any]:
        inspector = inspect(self.engine)
        schema_dict = {"tables": []}
        
        for table_name in inspector.get_table_names():
            table_info = {
                "name": table_name,
                "columns": [],
                "foreign_keys": []
            }
            
            for col in inspector.get_columns(table_name):
                table_info["columns"].append({
                    "name": col["name"],
                    "type": str(col["type"])
                })
            
            pk_constraint = inspector.get_pk_constraint(table_name)
            pk_cols = pk_constraint.get("constrained_columns", [])
            for c in table_info["columns"]:
                c["primary_key"] = c["name"] in pk_cols

            for fk in inspector.get_foreign_keys(table_name):
                for constrained_col, referred_col in zip(fk["constrained_columns"], fk["referred_columns"]):
                    table_info["foreign_keys"].append({
                        "column": constrained_col,
                        "references_table": fk["referred_table"],
                        "references_column": referred_col
                    })

            schema_dict["tables"].append(table_info)

        return schema_dict

class PostgreSQLInspector(SQLAlchemyBaseInspector):
    """PostgreSQL specific inspector."""
    pass

class SQLiteInspector(SQLAlchemyBaseInspector):
    """SQLite specific inspector."""
    def inspect(self) -> Dict[str, Any]:
        schema_dict = super().inspect()
        # Filter out internal SQLite tables
        schema_dict["tables"] = [t for t in schema_dict["tables"] if t["name"] != "sqlite_sequence"]
        return schema_dict

class MySQLInspector(SQLAlchemyBaseInspector):
    """MySQL specific inspector."""
    pass

def get_inspector(connection_string: str, db_type: str) -> SchemaInspector:
    if db_type == "postgresql":
        return PostgreSQLInspector(connection_string)
    elif db_type == "sqlite":
        return SQLiteInspector(connection_string)
    elif db_type == "mysql":
        return MySQLInspector(connection_string)
    else:
        raise NotImplementedError(f"Inspector for {db_type} is not implemented.")
