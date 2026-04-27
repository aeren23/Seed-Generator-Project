# 📚 Clean Bookstore Demo

**Sürüm:** 1.0.0  
**Türü:** Full-Stack Web Application (Demo Environment)

## 🎯 Proje Amacı
Clean Bookstore, modern yazılım mimarileri kullanılarak geliştirilmiş örnek bir e-ticaret uygulamasıdır. Bu projenin temel varlık amacı; dışarıdan sisteme entegre edilen **OmniSeed (Universal AI-Driven Database State Manager)** aracının, karmaşık ve ilişkisel bir veritabanını nasıl otonom bir şekilde "Pazarlamaya Hazır (Golden State)" duruma getirebildiğini kanıtlamaktır.

---

## 🛠 Teknoloji Yığını (Tech Stack)

Uygulama, bağımsız ölçeklenebilirlik (scalability) ve kolay bakım (maintainability) sağlamak amacıyla Frontend ve Backend olarak tamamen ayrıştırılmıştır.

### 1. Backend (API Layer)
* **Framework:** .NET 8 (Web API)
* **Dil:** C# 12
* **Mimari Yaklaşım:** N-Tier / Clean Architecture Prensipleri
* **ORM:** Entity Framework Core (Code-First Migration)
* **Veritabanı:** PostgreSQL (Docker üzerinden izole çalışır)

### 2. Frontend (Client Layer)
* **Kütüphane:** React (Vite ile oluşturulmuş, yüksek performanslı yapı)
* **Dil:** JavaScript / ES6+
* **Stil & UI:** Tailwind CSS (Hızlı ve modern arayüz tasarımı için)
* **State Management:** React Context API / Custom Hooks

### 3. Altyapı & Dağıtım (Infrastructure & Deployment)
* **Konteynerleştirme:** Docker
* **Orkestrasyon:** Docker Compose (Tüm bağımlılıkları tek tuşla ayağa kaldırmak için)

---

## 📂 Klasör Yapısı

Proje, "Gevşek Bağlılık" (Loose Coupling) kuralına sadık kalarak şu şekilde organize edilmiştir:

```text
/Bookstore_Demo
│
├── /Backend                 # .NET 8 Web API projesi
│   ├── /Controllers
│   ├── /Models
│   ├── /Data                # EF Core DbContext ve Migration dosyaları
│   ├── Dockerfile
│   └── appsettings.json
│
├── /Frontend                # React SPA projesi
│   ├── /src
│   ├── /public
│   ├── Dockerfile
│   └── .env
│
└── docker-compose.yml       # Tüm sistemi orkestre eden dosya
```

---

## 🚀 Kurulum ve Çalıştırma

Projenin ayağa kalkması için lokal makinenizde herhangi bir .NET SDK veya Node.js kurulu olmasına gerek yoktur. Sadece Docker Engine yeterlidir.

1. Proje dizinine gidin:
   ```bash
   cd Bookstore_Demo
   ```
2. Docker Compose ile tüm servisleri (Frontend, Backend, DB) başlatın:
   ```bash
   docker-compose up -d --build
   ```
3. Uygulamaya tarayıcıdan erişin:
   * **Frontend:** `http://localhost:3000`
   * **Backend API (Swagger):** `http://localhost:5000/swagger`

---

## 🪄 OmniSeed Entegrasyonu ve "Admin Reset"

Uygulama arayüzünün sağ alt köşesinde bulunan **"Reset Demo State"** butonu, bu projenin en can alıcı noktasıdır. 

Kullanıcılar demo ortamını bozduğunda, verileri sildiğinde veya anlamsız test verileri girdiğinde; bu butona basılır. Buton, Backend üzerinden doğrudan **OmniSeed CLI** aracını tetikler. OmniSeed, uygulamanın kullandığı PostgreSQL veritabanı şemasını saniyeler içinde analiz eder, yapay zeka tarafından daha önce üretilmiş kusursuz verileri (Golden State Cache) veritabanına basar ve sistemi anında ilk günkü sunum haline döndürür.
