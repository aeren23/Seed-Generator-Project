# OmniSeed

**OmniSeed** is a Universal AI-Driven Database State Manager. It's a language-agnostic, database-agnostic CLI developer tool designed to instantly restore application databases to a meaningful, realistic "Golden State" for demonstrations and testing. It uses LLMs to understand the target database schema automatically and generates contextually accurate seed data.

## Features

- **Zero Intrusiveness:** Runs outside the target application. No code changes needed.
- **Idempotency via Caching:** Schema hashing ensures AI generation runs only once per unique schema, heavily caching outputs.
- **Contextual Intelligence:** Uses semantic system context alongside schema JSON to generate realistic contextual records rather than "Lorem Ipsum".

## CLI Commands

The tool provides two primary flows via its Typer CLI interface.

### `omniseed generate`
1. Connects to database and extracts its schema representation.
2. Checks `.demo_cache/` if it was already processed.
3. If not, proxies to the selected LLM provider via a strict schema-to-SQL logic.
4. Validates output and caches securely.

### `omniseed reset`
1. Quickly identifies cached `.sql` payload for the current target DB schema.
2. Temporarily disables foreign key constraints.
3. Cleans up existing DB data safely via truncation.
4. Loads generated payload and re-enables constraints to hit a "Golden State".

## Installation & Setup

> Requires Python 3.10+

1. **Clone the repository.**
2. **Install via pip/pipenv/poetry:** 
   ```bash
   pip install -e .
   ```
3. **Configure Environment:** Copy `.env.example` to `.env` and configure `DB_CONNECTION_STRING`, `LLM_API_KEY`, etc.

## Documentation
Please check the `docs/` folder for architectural specification and detailed feature plans (e.g., `spec.md`, `project_plan.md`).
