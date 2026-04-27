import pytest
import sqlite3
from sqlalchemy import create_engine, text
from omniseed.infrastructure.database_executor import SQLiteExecutor, get_executor

@pytest.fixture
def sqlite_test_db(tmp_path):
    db_path = tmp_path / "executor_test.db"
    conn_str = f"sqlite:///{db_path}"
    engine = create_engine(conn_str)
    
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL
            )
        """))
        conn.execute(text("""
            CREATE TABLE posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title VARCHAR(255) NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """))
        
        # Insert initial data
        conn.execute(text("INSERT INTO users (name) VALUES ('Old User')"))
        conn.execute(text("INSERT INTO posts (user_id, title) VALUES (1, 'Old Post')"))
        
    return conn_str, engine

def test_sqlite_executor_success(sqlite_test_db):
    conn_str, engine = sqlite_test_db
    executor = SQLiteExecutor(conn_str)
    
    schema_dict = {
        "tables": [
            {"name": "users"},
            {"name": "posts"}
        ]
    }
    
    sql_script = """
    INSERT INTO users (id, name) VALUES (10, 'New AI User');
    INSERT INTO posts (id, user_id, title) VALUES (100, 10, 'New AI Post');
    """
    
    metrics = executor.reset_database(schema_dict, sql_script)
    
    assert metrics["affected_rows"] == 2
    assert metrics["duration_seconds"] >= 0
    
    with engine.connect() as conn:
        users_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        posts_count = conn.execute(text("SELECT COUNT(*) FROM posts")).scalar()
        
        assert users_count == 1
        assert posts_count == 1
        
        user_name = conn.execute(text("SELECT name FROM users")).scalar()
        assert user_name == "New AI User"

def test_sqlite_executor_transaction_rollback(sqlite_test_db):
    conn_str, engine = sqlite_test_db
    executor = SQLiteExecutor(conn_str)
    
    schema_dict = {"tables": [{"name": "users"}, {"name": "posts"}]}
    
    # Invalid SQL will cause a failure partway through
    sql_script = """
    INSERT INTO users (id, name) VALUES (10, 'New AI User');
    INVALID_SQL_STATEMENT;
    """
    
    with pytest.raises(Exception):
        executor.reset_database(schema_dict, sql_script)
        
    # Verify rollback: old data should remain intact since the DELETE FROM was rolled back
    with engine.connect() as conn:
        users_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        assert users_count == 1
        user_name = conn.execute(text("SELECT name FROM users")).scalar()
        assert user_name == "Old User"

def test_get_executor_factory():
    assert isinstance(get_executor("sqlite:///:memory:", "sqlite"), SQLiteExecutor)
    with pytest.raises(NotImplementedError):
        get_executor("mongodb://localhost:27017", "mongodb")
