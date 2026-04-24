# OmniSeed — Detaylı Proje Uygulama Planı

> **Proje:** OmniSeed – Universal AI-Driven Database State Manager  
> **Versiyon:** 1.0.0  
> **Oluşturulma Tarihi:** 2026-04-24  
> **Son Güncelleme:** 2026-04-24  

---

## Genel Bakış

Bu döküman, `spec.md` dosyasında tanımlanan OmniSeed projesinin uçtan uca uygulama planını içerir.
Proje **6 ana faz** ve toplam **~40 alt görev** olarak yapılandırılmıştır.  
Her görev tamamlandığında ilgili checkbox (`[ ]` → `[x]`) işaretlenerek ilerleme takip edilir.

---

## Faz 0 — Proje Altyapısı & Scaffolding

> **Amaç:** Geliştirme ortamını, proje iskeletini ve CI temellerini hazırlamak.

- [x] **0.1** — Git reposu oluşturma & `.gitignore` (Python, `.env`, `.demo_cache/`, `__pycache__/`)
- [x] **0.2** — Python proje yapısını oluşturma (Clean Architecture dizin yapısı)
  ```
  omniseed/
  ├── domain/          # İş kuralları, hash, modeller
  ├── application/     # Use-case'ler (Generate, Reset)
  ├── infrastructure/  # DB driver'lar, AI engine, cache
  ├── cli/             # Click/Typer CLI katmanı
  └── tests/
  ```
- [x] **0.3** — `pyproject.toml` veya `requirements.txt` ile bağımlılık yönetimi
- [x] **0.4** — `.env.example` dosyası oluşturma (spec.md §3'e uygun)
- [x] **0.5** — Linter & Formatter yapılandırma (Ruff / Black / isort)
- [x] **0.6** — Temel `README.md` yazımı

---

## Faz 1 — Config Manager & Schema Inspector

> **Amaç:** `.env` yapılandırmasını okumak ve hedef veritabanının şemasını çıkarmak.

### 1A — Config Manager (Domain/Application)
- [x] **1A.1** — `.env` dosyasını yükleyen `ConfigManager` sınıfı (`python-dotenv`)
- [x] **1A.2** — Gerekli alanların (`DB_CONNECTION_STRING`, `LLM_API_KEY` vb.) doğrulanması
- [x] **1A.3** — Desteklenmeyen veritabanı tipi için `NotImplementedError` fırlatma
- [x] **1A.4** — Config modeli (Pydantic `BaseSettings` veya dataclass)
- [x] **1A.5** — Unit testler (`tests/test_config_manager.py`)

### 1B — Schema Inspector (Infrastructure)
- [x] **1B.1** — Ortak `SchemaInspector` arayüzü (ABC / Protocol)
- [x] **1B.2** — **PostgreSQL** inspector implementasyonu (`information_schema` sorguları)
- [x] **1B.3** — **SQLite** inspector implementasyonu
- [x] **1B.4** — **MySQL** inspector implementasyonu
- [x] **1B.5** — Unified JSON schema çıktısı (tablolar, kolonlar, tipler, FK ilişkileri)
- [x] **1B.6** — Integration testler (Docker ile test DB'leri veya SQLite in-memory)

---

## Faz 2 — State Hasher & Cache Manager

> **Amaç:** Şema değişikliklerini tespit etmek ve AI çıktısını önbelleğe almak.

### 2A — State Hasher (Domain)
- [x] **2A.1** — Schema JSON'dan deterministik SHA-256 hash üreten `StateHasher` sınıfı
- [x] **2A.2** — JSON anahtarlarının sıralı serileştirilmesi (determinizm garantisi)
- [x] **2A.3** — Unit testler (aynı girdiler → aynı hash, farklı girdiler → farklı hash)

### 2B — Cache Manager (Infrastructure)
- [x] **2B.1** — `.demo_cache/` dizinini yöneten `CacheManager` sınıfı
- [x] **2B.2** — `has_cache(hash) -> bool` — hash'e karşılık gelen `.sql` dosyasının varlığını kontrol
- [x] **2B.3** — `read_cache(hash) -> str` — önbellekten SQL okuma
- [x] **2B.4** — `write_cache(hash, sql) -> None` — SQL çıktısını `.demo_cache/[HASH].sql` olarak kaydetme
- [x] **2B.5** — Unit testler

---

## Faz 3 — AI Engine (LLM Entegrasyonu)

> **Amaç:** Schema + bağlamı LLM'e gönderip geçerli SQL INSERT ifadeleri ürettirmek.

- [x] **3.1** — Ortak `AIEngine` arayüzü (ABC / Protocol)
- [x] **3.2** — `spec.md` §5'teki System Prompt Template'ini oluşturan prompt builder
- [x] **3.3** — **OpenAI** provider implementasyonu (`openai` SDK)
- [x] **3.4** — **Anthropic** provider implementasyonu (`anthropic` SDK)
- [x] **3.5** — **Google Gemini** provider implementasyonu (`google-generativeai` SDK)
- [x] **3.6** — LLM Provider Factory (`LLM_PROVIDER` config değerine göre seçim)
- [x] **3.7** — LLM çıktısının temel SQL doğrulaması (markdown temizleme, boş yanıt kontrolü)
- [x] **3.8** — Retry mekanizması (rate limit / geçici hatalar için)
- [x] **3.9** — Unit testler (mock LLM yanıtları ile)

---

## Faz 4 — Database Executor & Use-Case Orkestratörü

> **Amaç:** Veritabanını temizleyip seed data'yı güvenli şekilde yüklemek ve `generate` / `reset` akışlarını birleştirmek.

### 4A — Database Executor (Infrastructure)
- [x] **4A.1** — Ortak `DatabaseExecutor` arayüzü
- [x] **4A.2** — FK constraint devre dışı bırakma / etkinleştirme (PostgreSQL: `SET CONSTRAINTS ALL DEFERRED`, MySQL: `SET FOREIGN_KEY_CHECKS=0`, SQLite: `PRAGMA foreign_keys = OFF`)
- [x] **4A.3** — `TRUNCATE TABLE ... CASCADE` / `DELETE FROM` operasyonları
- [x] **4A.4** — SQL dosyası çalıştırma (transaction içinde, hata durumunda rollback)
- [x] **4A.5** — Başarı metrikleri çıktısı (süre, etkilenen satır sayısı)
- [x] **4A.6** — Integration testler

### 4B — Use-Case Orkestratörleri (Application)
- [x] **4B.1** — `GenerateUseCase` — spec.md §4.1 akışının tam implementasyonu
- [x] **4B.2** — `ResetUseCase` — spec.md §4.2 akışının tam implementasyonu
- [x] **4B.3** — Hata senaryoları: LLM hallucination (invalid SQL) → rollback & log
- [x] **4B.4** — End-to-end integration testler

---

## Faz 5 — CLI Arayüzü & Son Entegrasyon
> **Amaç:** Kullanıcıya dönük CLI komutlarını oluşturmak ve uçtan uca çalışır hale getirmek.

- [x] **5.1** — CLI framework seçimi ve kurulumu (`Typer` veya `Click`)
- [x] **5.2** — `omniseed generate` komutu
- [x] **5.3** — `omniseed reset` komutu
- [x] **5.4** — Renkli terminal çıktıları & progress bar (`rich` kütüphanesi)
- [x] **5.5** — `--help` dökümantasyonu
- [x] **5.6** — Entry point yapılandırması (`pyproject.toml` → `[project.scripts]`)
- [x] **5.7** — Uçtan uca (E2E) test senaryosu (gerçek bir SQLite DB ile generate → reset döngüsü)

---

## Faz 6 — Dokümantasyon & Yayınlama

> **Amaç:** Projeyi belgeleyip dağıtıma hazır hale getirmek.

- [x] **6.1** — Kapsamlı `README.md` (kurulum, kullanım, konfigürasyon, örnekler)
- [x] **6.2** — `CHANGELOG.md` oluşturma
- [x] **6.3** — `LICENSE` dosyası ekleme
- [x] **6.4** — PyPI yayınlama yapılandırması (`pyproject.toml` metadata)
- [x] **6.5** — GitHub Actions CI pipeline (lint + test)
- [x] **6.6** — Demo GIF / Asciinema kaydı oluşturma

---

## Gelecek Fazlar (Roadmap — spec.md §7)

> Bu fazlar v1.0 kapsamı dışındadır, gelecek sürümler için planlanmıştır.

- [ ] **Faz 7** — MCP Server wrapper (IDE entegrasyonu)
- [ ] **Faz 8** — Docker sidecar container (`docker-compose` entegrasyonu)

---

## Bağımlılık Grafiği

```
Faz 0 (Altyapı)
  └── Faz 1A (Config) ──┐
  └── Faz 1B (Schema) ──┤
                         ├── Faz 2A (Hasher) ──┐
                         ├── Faz 2B (Cache)  ──┤
                         │                     ├── Faz 4B (Use-Cases) ── Faz 5 (CLI) ── Faz 6 (Docs)
                         ├── Faz 3 (AI Engine)─┘
                         └── Faz 4A (Executor)─┘
```

> **Not:** Her fazın tamamlanma durumu `state.md` dosyasında güncel olarak takip edilmektedir.
