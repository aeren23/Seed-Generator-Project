import pytest
import sqlite3
from sqlalchemy import create_engine
from omniseed.infrastructure.schema_inspector import SQLiteInspector, get_inspector

@pytest.fixture
def sqlite_db(tmp_path):
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title VARCHAR(255) NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()
    return f"sqlite:///{db_path}"

def test_sqlite_inspector(sqlite_db):
    inspector = SQLiteInspector(sqlite_db)
    schema = inspector.inspect()
    
    assert "tables" in schema
    assert len(schema["tables"]) == 2
    
    users_table = next(t for t in schema["tables"] if t["name"] == "users")
    assert len(users_table["columns"]) == 2
    assert users_table["columns"][0]["name"] == "id"
    assert users_table["columns"][0]["primary_key"] is True
    assert len(users_table["foreign_keys"]) == 0
    
    posts_table = next(t for t in schema["tables"] if t["name"] == "posts")
    assert len(posts_table["foreign_keys"]) == 1
    fk = posts_table["foreign_keys"][0]
    assert fk["column"] == "user_id"
    assert fk["references_table"] == "users"
    assert fk["references_column"] == "id"

def test_get_inspector_factory():
    inspector = get_inspector("sqlite:///:memory:", "sqlite")
    assert isinstance(inspector, SQLiteInspector)
    
    with pytest.raises(NotImplementedError):
        get_inspector("mongodb://localhost:27017", "mongodb")
