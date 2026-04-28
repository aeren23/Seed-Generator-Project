from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class ConfigManager(BaseSettings):
    db_connection_string: str = Field(..., alias="DB_CONNECTION_STRING")
    llm_provider: str = Field("openai", alias="LLM_PROVIDER")
    llm_api_key: str = Field(..., alias="LLM_API_KEY")
    llm_model: str = Field("gpt-4o", alias="LLM_MODEL")
    seed_language: str = Field("tr", alias="SEED_LANGUAGE")
    system_context: str = Field(..., alias="SYSTEM_CONTEXT")
    data_scale: str = Field("small", alias="DATA_SCALE")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True
    )

    @field_validator("db_connection_string")
    @classmethod
    def validate_db_scheme(cls, v: str) -> str:
        supported_schemes = ["postgresql", "postgres", "sqlite", "mysql"]
        scheme = v.split(":")[0].lower()
        base_scheme = scheme.split("+")[0]
        if base_scheme not in supported_schemes:
            raise NotImplementedError(f"Database scheme '{base_scheme}' is not supported.")
        return v
    
    @property
    def db_type(self) -> str:
        scheme = self.db_connection_string.split(":")[0].lower()
        base_scheme = scheme.split("+")[0]
        if base_scheme == "postgres":
            return "postgresql"
        return base_scheme

def get_config() -> ConfigManager:
    return ConfigManager()
