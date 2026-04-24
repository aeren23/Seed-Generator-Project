from omniseed.domain.state_hasher import StateHasher

def test_generate_hash_determinism():
    schema1 = {
        "tables": [
            {"name": "users", "columns": [{"name": "id", "type": "INT"}]}
        ]
    }
    # Unordered but structurally identical
    schema2 = {
        "tables": [
            {"columns": [{"type": "INT", "name": "id"}], "name": "users"}
        ]
    }
    
    hash1 = StateHasher.generate_hash(schema1)
    hash2 = StateHasher.generate_hash(schema2)
    
    assert hash1 == hash2

def test_generate_hash_difference():
    schema1 = {
        "tables": [
            {"name": "users", "columns": [{"name": "id", "type": "INT"}]}
        ]
    }
    schema2 = {
        "tables": [
            {"name": "users", "columns": [{"name": "id", "type": "VARCHAR"}]}
        ]
    }
    
    hash1 = StateHasher.generate_hash(schema1)
    hash2 = StateHasher.generate_hash(schema2)
    
    assert hash1 != hash2
