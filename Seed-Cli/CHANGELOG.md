# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-24

### Added
- **Core Engine:** Pydantic-based configuration management.
- **SQLAlchemy Inspector:** Universal schema extraction supporting PostgreSQL, MySQL, and SQLite.
- **AI Integrations:** Abstract factory supporting OpenAI, Anthropic, and Google Gemini with exponential backoff retry mechanisms.
- **Idempotent Caching:** SHA-256 deterministic state hasher ensuring AI constraints are cached effectively.
- **Transactional Executor:** Safe schema resetting via `TRUNCATE TABLE ... CASCADE` or `DELETE FROM` with safe `PRAGMA` / constraint disabling routines.
- **Typer CLI:** `omniseed generate` and `omniseed reset` workflows with rich terminal rendering.
- **GitHub Actions:** CI pipeline configured for linting and PyTest execution.
