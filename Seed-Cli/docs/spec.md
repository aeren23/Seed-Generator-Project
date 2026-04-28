# OmniSeed - Universal AI-Driven Database State Manager
**Version:** 1.0.0
**Type:** CLI Developer Tool & Environment Manager

## 1. Project Overview
OmniSeed is a language-agnostic, database-agnostic Developer Tool designed to instantly restore application databases to a meaningful, realistic "Golden State" for demonstrations and testing. It uses LLMs (Large Language Models) to understand the target database schema automatically and generates contextually accurate seed data.

### 1.1 Core Philosophy
* **Zero Intrusiveness:** OmniSeed runs entirely outside the target application. It does not require any code changes, library installations, or specific backend frameworks (works equally well with .NET, Go, Node.js, etc.).
* **Idempotency via Caching:** Schema hashing ensures that data is generated via AI only once per schema state. Subsequent resets use local cache for lightning-fast execution.
* **Contextual Intelligence:** No more "Lorem Ipsum". Data is generated based on the actual table names, column constraints, and developer-provided context.

---

## 2. System Architecture
The project follows **Clean Architecture** principles to separate core logic from external dependencies (Database Drivers, LLM APIs).

### 2.1 Core Components
1.  **Config Manager:** Loads and validates `.env` configurations.
2.  **Schema Inspector (Infrastructure):** Connects to the target DB, executes `information_schema` queries, and returns a unified JSON representation of the database structure.
3.  **State Hasher (Domain):** Generates a deterministic SHA-256 hash based on the extracted schema JSON.
4.  **AI Engine (Infrastructure):** Communicates with the LLM API to generate valid SQL `INSERT` statements based on the schema and context.
5.  **Cache Manager (Infrastructure):** Reads/Writes `.sql` files to the local `.demo_cache/` directory.
6.  **Database Executor (Infrastructure):** Handles `TRUNCATE/DROP` operations and executes the final `INSERT` scripts safely.

---

## 3. Configuration & Environment Variables
The tool is driven entirely by a `.env` file located in its root directory.

```env
# Target Database
DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/my_app_db
# Supported types initially: postgres, sqlite, mysql

# AI Integration
LLM_PROVIDER=openai  # or anthropic, gemini
LLM_API_KEY=sk-proj-...
LLM_MODEL=gpt-4o

# Generation Context
SEED_LANGUAGE=tr
SYSTEM_CONTEXT="This is an online bookstore. Generate realistic Turkish book titles, authors, and prices. Ensure cover image URLs use placeholder services like picsum.photos."
DATA_SCALE=small
```

---

## 4. User Flows & CLI Commands
The tool operates via a CLI interface with two primary commands.

### 4.1 Command: `python omniseed.py generate`
* **Step 1:** Connect to DB and extract schema (Tables, Columns, Types, Foreign Keys).
2.  **Step 2:** Generate SHA-256 hash of the schema.
3.  **Step 3:** Check if `.demo_cache/[HASH].sql` exists.
    * *If Exists:* Exit with message "Golden state already cached."
    * *If Not:* Send schema to LLM with the defined `SYSTEM_CONTEXT`.
4.  **Step 4:** Validate the LLM output (ensure it contains valid SQL).
5.  **Step 5:** Save the SQL output to `.demo_cache/[HASH].sql`.

### 4.2 Command: `python omniseed.py reset`
1.  **Step 1:** Connect to DB and extract schema -> Generate Hash.
2.  **Step 2:** Locate `.demo_cache/[HASH].sql`. (Fail if missing, prompt to run `generate`).
3.  **Step 3:** Disable Foreign Key constraints temporarily (Database specific mechanism).
4.  **Step 4:** Execute destructive clean-up (`TRUNCATE TABLE ... CASCADE` or `DELETE FROM`).
5.  **Step 5:** Execute the cached `[HASH].sql` file.
6.  **Step 6:** Re-enable Foreign Key constraints.
7.  **Step 7:** Output success metrics (execution time, rows affected).

---

## 5. LLM Prompt Strategy
The AI Engine must use a strict system prompt to guarantee parsable output.

**System Prompt Template:**
> "You are an expert SQL Database Administrator. I will provide you with a database schema in JSON format. Your task is to generate a '{DATA_SCALE}' amount of realistic data for these tables in {SEED_LANGUAGE}. Instead of generating the same number of rows for every table, intelligently vary the row count based on table relationships. (e.g. few rows for lookup tables, many rows for transaction tables).
> Context: {SYSTEM_CONTEXT}.
> 
> CRITICAL RULES:
> 1. Respect Foreign Key dependencies. Insert parent tables before child tables.
> 2. Output ONLY pure SQL `INSERT` statements. Do not include markdown formatting like ```sql or explanations.
> 3. Ensure data types match the schema."

---

## 6. Edge Cases & Error Handling
* **Foreign Key Violations:** The `Executor` must strictly disable foreign key checks before cleaning data and re-enable them after execution to prevent constraint errors.
* **LLM Hallucinations:** If the LLM returns invalid SQL, the `Database Executor` must catch the SQL Exception, rollback any partial transactions, and log the error safely.
* **Unsupported Databases:** If the connection string points to an unsupported DB (e.g., MongoDB), the `Config Manager` should throw a clear `NotImplementedError` before attempting any operations.

---

## 7. Future Roadmap (For AI Context)
* **Phase 2:** Build a Model Context Protocol (MCP) Server wrapper around OmniSeed, allowing IDEs (like Cursor) or external AI agents to trigger environment resets natively.
* **Phase 3:** Dockerize the CLI tool for seamless integration into `docker-compose` workflows as an ephemeral sidecar container.
