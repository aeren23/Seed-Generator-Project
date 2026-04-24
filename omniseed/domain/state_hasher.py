import hashlib
import json
from typing import Dict, Any

class StateHasher:
    """
    Generates a deterministic SHA-256 hash based on the extracted schema representation.
    """
    @staticmethod
    def generate_hash(schema_dict: Dict[str, Any]) -> str:
        """
        Generate a predictable hash for the given schema by sorting JSON keys.
        This guarantees that idempotency is maintained even if the dictionary keys are unordered.
        """
        # Ensure the schema is serialized perfectly and predictably
        serialized_schema = json.dumps(schema_dict, sort_keys=True, separators=(',', ':'))
        
        # Calculate SHA-256 hash
        sha_signature = hashlib.sha256(serialized_schema.encode('utf-8')).hexdigest()
        return sha_signature
