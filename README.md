<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Gemini%20%7C%20OpenAI%20%7C%20Claude-FF6F00?style=for-the-badge&logo=google&logoColor=white" />
</p>

# 🌱 OmniSeed — AI-Driven Database State Manager

> **"Veritabanını boz, bir butona bas, altın çağa geri dön."**

OmniSeed, herhangi bir veritabanını AI ile analiz edip anlamlı, gerçekçi test verisi üreten ve tek komutla "Golden State"e döndüren **evrensel** bir CLI aracıdır. Framework bağımsız, dil bağımsız, veritabanı bağımsız çalışır.

Bu repo, OmniSeed CLI aracını (`Seed-Cli/`) ve onu canlı ortamda test etmek için geliştirilmiş tam teşekküllü bir e-ticaret demo uygulamasını (`BookStore-Demo/`) içerir.

---

## 📐 Proje Yapısı

```
Seed-Generator-Project/
├── Seed-Cli/                    # 🌱 OmniSeed CLI Tool
│   ├── omniseed/                # Python package (Clean Architecture)
│   │   ├── cli/                 # Typer CLI interface
│   │   ├── domain/              # Config, Hasher, Business Logic
│   │   └── infrastructure/      # AI Engine, DB Executor, Schema Inspector
│   ├── .demo_cache/             # AI-generated SQL cache (Golden State)
│   ├── .env                     # Configuration (DB, LLM, Context)
│   └── docs/spec.md             # Technical specification
│
├── BookStore-Demo/              # 📚 Demo Application
│   ├── Backend/                 # .NET 8 Clean Architecture API
│   │   ├── Bookstore.Domain/    # Entities (User, Book, Sale, Basket...)
│   │   ├── Bookstore.Application/ # DTOs, Interfaces, Use-Cases
│   │   ├── Bookstore.Infrastructure/ # EF Core, Services, Repositories
│   │   └── Bookstore.API/       # Controllers, DI, Middleware
│   ├── Frontend/                # React 18 + Vite + TailwindCSS
│   ├── docker-compose.yml       # Full-stack orchestration
│   └── docs/spec.md             # Technical specification
```

---

## 🧠 OmniSeed Nasıl Çalışır?

OmniSeed'in felsefesi üç kelimede özetlenebilir: **Oku → Üret → Geri Yükle.**

```mermaid
flowchart LR
    A["🔍 Schema Inspector"] --> B["#️⃣ SHA-256 Hasher"]
    B --> C{"Cache var mı?"}
    C -->|Evet| D["⚡ Cached SQL"]
    C -->|Hayır| E["🤖 LLM API"]
    E --> F["📝 SQL Generate"]
    F --> G["💾 Cache'e Kaydet"]
    D --> H["🗄️ DB Executor"]
    G --> H
    H --> I["✅ Golden State"]
```

### Temel Özellikler

| Özellik | Açıklama |
|---------|----------|
| **🔌 Zero Intrusiveness** | Hedef uygulamada hiçbir kod değişikliği gerektirmez |
| **🧩 LLM Agnostik** | Gemini, OpenAI, Claude — istediğiniz AI ile çalışır |
| **🗄️ DB Agnostik** | PostgreSQL, SQLite, MySQL desteği |
| **⚡ Idempotent Cache** | Schema değişmedikçe AI'ı tekrar çağırmaz, cache'den döner |
| **🌍 Bağlam Duyarlı** | "Lorem Ipsum" yerine şema + bağlam odaklı gerçekçi veri |
| **🔁 Tek Komut Reset** | `python -m omniseed reset` — tüm veriyi temizle, Golden State'i geri yükle |

### CLI Komutları

```bash
# 1. AI ile Golden State verisi üret (sadece ilk seferde, sonra cache'den döner)
python -m omniseed generate

# 2. Veritabanını Golden State'e döndür (TRUNCATE + INSERT)
python -m omniseed reset
```

### Yapılandırma (`.env`)

```env
# Hedef Veritabanı
DB_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/bookstore

# AI Entegrasyonu (gemini | openai | anthropic)
LLM_PROVIDER=gemini
LLM_API_KEY=your-api-key-here
LLM_MODEL=gemini-2.5-flash

# Üretim Bağlamı
SEED_LANGUAGE=tr
SYSTEM_CONTEXT="Online Bookstore Demo. Create admin/seller/customer users..."
DATA_SCALE=small
```

> **💡 İpucu:** `SYSTEM_CONTEXT` alanına ne kadar detaylı talimat yazarsanız, AI o kadar doğru veri üretir. Kullanıcı adları, tarih aralıkları, görsel URL'leri gibi spesifik istekler burada belirtilir.

---

## 📚 BookStore-Demo — Test Uygulaması

OmniSeed'in yeteneklerini sergilemek için geliştirilmiş, kasıtlı olarak "bozulabilir" bir e-ticaret demo ortamı.

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Backend** | .NET 8 Web API (Clean Architecture) |
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Database** | PostgreSQL 15 |
| **Auth** | ASP.NET Identity + JWT |
| **Deployment** | Docker & Docker Compose |

### Demo Hesapları

| Rol | Kullanıcı Adı | Şifre |
|-----|---------------|-------|
| 🛡️ Admin | `admin` | `Admin123!` |
| 🏪 Seller | `seller` | `Seller123!` |
| 🛒 Customer | `customer` | `Customer123!` |

### Uygulama Sayfaları

- **🏠 Storefront** — Kitap kataloğu, arama, kategori filtresi, sayfalama, sepete ekleme
- **📊 Seller Dashboard** — Satış performansı grafiği (Zaman / Gelir)
- **📦 Envanter Yönetimi** — Kitap ekleme, düzenleme, silme (Seller & Admin)
- **🛡️ Admin Paneli** — Kategori yönetimi, kullanıcı CRUD, rol atama
- **⚡ Golden Button** — Admin panelinde "Reset Demo State" butonu → OmniSeed'i tetikler

---

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

- **Docker & Docker Compose** (v2+)
- **Python 3.11+** (OmniSeed CLI için)
- **Bir LLM API Anahtarı** (Gemini, OpenAI veya Anthropic)

### Adım 1: Repo'yu Klonla

```bash
git clone https://github.com/your-username/Seed-Generator-Project.git
cd Seed-Generator-Project
```

### Adım 2: OmniSeed'i Yapılandır

```bash
cd Seed-Cli
cp .env.example .env
# .env dosyasını düzenle: API anahtarını ve DB bağlantı bilgilerini gir
```

### Adım 3: Veritabanını Başlat

Golden State verisini üretmeden önce PostgreSQL container'ını ayağa kaldırmalıyız:

```bash
cd ../BookStore-Demo
docker compose up -d db
```

> ⏳ PostgreSQL'in hazır olması için birkaç saniye bekleyin.

### Adım 4: Golden State Verisini Üret

```bash
cd ../Seed-Cli
pip install -e .                    # OmniSeed'i kur (ilk seferde)
python -m omniseed generate         # AI ile Golden State SQL'i üret
python -m omniseed reset            # Veriyi veritabanına bas
```

> **📌 Kritik Not:** Bu adım `generate` komutunu Docker Compose'dan **ÖNCE** çalıştırır. Böylece `.demo_cache/` klasöründe Golden State SQL dosyası hazır olur ve ileride `reset` komutu cache'den anında döner.

### Adım 5: Tüm Sistemi Ayağa Kaldır

```bash
cd ../BookStore-Demo
docker compose up -d --build
```

### Adım 6: Kullan!

| Servis | URL |
|--------|-----|
| 🌐 Frontend | [http://localhost:3000](http://localhost:3000) |
| ⚙️ Backend API | [http://localhost:5000](http://localhost:5000) |
| 🗄️ PostgreSQL | `localhost:5432` |

Demo hesaplarından biriyle giriş yap ve sistemi keşfet!

---

## 🔄 Golden State Akışı

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. omniseed generate    →  AI, şemayı okur ve SQL üretir│
│                              (.demo_cache/[HASH].sql)    │
│                                                          │
│  2. docker compose up    →  Backend + Frontend + DB      │
│                              ayağa kalkar                │
│                                                          │
│  3. Demo Kullan          →  Kitap ekle, sil, sepete at,  │
│                              kullanıcı oluştur, veriyi   │
│                              "boz"                       │
│                                                          │
│  4. Golden Button ⚡     →  Admin panelindeki butona bas, │
│                              OmniSeed tetiklenir,        │
│                              veritabanı anında temiz      │
│                              haline döner                │
│                                                          │
│  5. omniseed reset       →  CLI'dan da aynı işlem       │
│                              yapılabilir                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Mimari Detaylar

### OmniSeed — Clean Architecture

```
omniseed/
├── domain/           # İş mantığı (Config, Hasher) — Sıfır dış bağımlılık
├── infrastructure/   # Dış dünya (AI Engine, DB Executor, Schema Inspector)
└── cli/              # Kullanıcı arayüzü (Typer CLI)
```

### BookStore-Demo — Clean Architecture (.NET)

```
Backend/
├── Bookstore.Domain/           # Entity'ler — Sıfır dış bağımlılık
├── Bookstore.Application/      # DTO'lar, Interface'ler
├── Bookstore.Infrastructure/   # EF Core, Servisler, Repository'ler
└── Bookstore.API/              # Controller'lar, Middleware, DI
```

### Docker Compose Topolojisi

```mermaid
graph TB
    subgraph Docker Network
        DB["🗄️ PostgreSQL 15<br/>Port: 5432"]
        BE["⚙️ .NET 8 Backend<br/>Port: 5000 → 8080"]
        FE["🌐 React Frontend<br/>Port: 3000 → 80"]
        SC["📂 Seed-Cli Volume<br/>(Mounted)"]
    end

    FE -->|"API Calls"| BE
    BE -->|"EF Core"| DB
    BE -->|"python -m omniseed reset"| SC
    SC -->|"SQL Execution"| DB
```

---

## 📡 API Referansı

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/auth/login` | JWT ile giriş |
| `POST` | `/api/auth/register` | Yeni hesap oluştur |

### Books
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/books?pageNumber=1&pageSize=8` | Sayfalı kitap listesi |
| `GET` | `/api/books/{id}` | Kitap detayı |
| `POST` | `/api/books` | Kitap ekle (Seller/Admin) |
| `PUT` | `/api/books/{id}` | Kitap güncelle |
| `DELETE` | `/api/books/{id}` | Kitap sil |

### Basket & Checkout
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/basket` | Aktif sepeti getir |
| `POST` | `/api/basket/items` | Sepete ürün ekle |
| `POST` | `/api/basket/checkout` | Siparişi tamamla |

### Admin (🔒 Admin Only)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/admin/reset` | **Golden State'e döndür** |
| `GET` | `/api/admin/users` | Tüm kullanıcıları listele |
| `POST` | `/api/admin/users` | Yeni kullanıcı oluştur |
| `PUT` | `/api/admin/users/{id}/role` | Rol değiştir |
| `DELETE` | `/api/admin/users/{id}` | Kullanıcı sil |

### Analytics
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/sales/chart-data` | Satış grafiği verisi |

---

## 🛠️ Geliştirme

### Yeni bir proje ile OmniSeed kullanmak

OmniSeed **herhangi** bir veritabanıyla çalışır. Sadece `.env` dosyasını değiştirin:

```env
DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/your_new_db
SYSTEM_CONTEXT="Bu bir hastane yönetim sistemi. Türkçe hasta, doktor ve randevu verisi üret..."
```

Ve çalıştırın:
```bash
python -m omniseed generate
python -m omniseed reset
```

OmniSeed şemayı otomatik keşfeder, bağlamı anlar ve o projeye özel gerçekçi veri üretir. **Hiçbir kod değişikliği gerekmez.**

---

## 📋 Yol Haritası

- [x] **Phase 1:** Core CLI tool (`generate` + `reset`)
- [x] **Phase 1.5:** BookStore Demo App (Full-stack)
- [ ] **Phase 2:** MCP Server entegrasyonu (IDE desteği)
- [ ] **Phase 3:** Docker sidecar container modu

---

## 📄 Lisans

MIT License — Detaylar için [LICENSE](Seed-Cli/LICENSE) dosyasına bakın.

---

<p align="center">
  <b>OmniSeed</b> ile veritabanınız her zaman demo'ya hazır. 🌱
</p>
