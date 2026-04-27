# Specification Document: Clean Bookstore Demo
**Version:** 1.0.0
**Context:** E-Commerce Mock Application targeting OmniSeed Integration

## 1. Project Objective
Bu proje, dışarıdan bağımsız olarak çalışan `OmniSeed CLI` (AI-Driven Database State Manager) aracının test edilebilmesi ve yeteneklerinin sergilenebilmesi için geliştirilmiş, kasti olarak verisi manipüle edilebilir ("bozulabilir") bir e-ticaret demo ortamıdır. 

## 2. Technology Stack
* **Backend:** .NET 8 (Web API)
* **Architecture:** Clean Architecture & N-Tier
* **ORM:** Entity Framework Core (Code-First)
* **Database:** PostgreSQL
* **Frontend:** React + Vite + TailwindCSS
* **Deployment:** Docker & Docker Compose

---

## 3. Architecture Guidelines (.NET Backend)
Backend, birbirine sıkı sıkıya bağlı olmayan (Loosely Coupled) 4 temel katmandan oluşmalıdır:

1.  **Domain Layer (`Bookstore.Domain`):** * Entity sınıfları, Enum'lar ve temel iş kuralları (Business Rules). Dış bağımlılığı (paket vb.) SIFIR olmalıdır.
2.  **Application Layer (`Bookstore.Application`):**
    * DTO'lar, Interface'ler (IRepository, IService) ve Use-Case işleyicileri.
3.  **Infrastructure Layer (`Bookstore.Infrastructure`):**
    * `AppDbContext`, Entity konfigürasyonları (Fluent API) ve PostgreSQL bağlantısı.
    * `OmniSeedTriggerService` (Sistemi sıfırlayan dış betiği çağıran servis).
4.  **API Layer (`Bookstore.API`):**
    * Controller'lar ve Dependency Injection (DI) kayıtları.

---

## 4. Domain Entities & Database Schema
AI Agent, Entity Framework Core yapılandırmasını aşağıdaki Entity'lere ve ilişkilere (Relations) göre kurmalıdır.

### 4.1. User (Kullanıcılar)
* `Id` (Guid) - PK
* `FullName` (string)
* `Email` (string)
* `Role` (Enum: Customer, Seller, Admin)

### 4.2. Category (Kategoriler)
* `Id` (Guid) - PK
* `Name` (string, max 100)
* *Navigation:* `ICollection<Book> Books`

### 4.3. Book (Kitaplar & Envanter)
* `Id` (Guid) - PK
* `SellerId` (Guid) - FK -> User (Sadece Role = Seller olanlar)
* `CategoryId` (Guid) - FK -> Category
* `Title` (string, max 200)
* `AuthorName` (string, max 100)
* `Price` (decimal 18,2)
* `StockCount` (int)
* `CoverImageUrl` (string)
* *Navigation:* `Category Category`, `User Seller`

### 4.4. Basket & BasketItem (Sepet Yönetimi)
**Basket:**
* `Id` (Guid) - PK
* `UserId` (Guid) - FK -> User
* `IsCompleted` (bool) - Sipariş tamamlandıysa true olur.
* *Navigation:* `ICollection<BasketItem> Items`

**BasketItem:**
* `Id` (Guid) - PK
* `BasketId` (Guid) - FK -> Basket
* `BookId` (Guid) - FK -> Book
* `Quantity` (int)

### 4.5. Sale & SaleItem (Satış ve Analitik Verisi)
**Sale (Ana Sipariş Fişi):**
* `Id` (Guid) - PK
* `CustomerId` (Guid) - FK -> User (Satın alan müşteri)
* `TotalAmount` (decimal 18,2)
* `SaleDate` (DateTime, default: DateTime.UtcNow)

**SaleItem (Satıcıların Grafiklerini Besleyen Alt Tablo):**
* `Id` (Guid) - PK
* `SaleId` (Guid) - FK -> Sale
* `BookId` (Guid) - FK -> Book
* `SellerId` (Guid) - FK -> User (Kitabın sahibi olan satıcı)
* `UnitPrice` (decimal 18,2)
* `Quantity` (int)
* *Note:* Satıcı (Seller) Dashboard'a girdiğinde, AI Agent `SaleItem` tablosunda `SellerId == currentUser.Id` sorgusunu atarak o satıcıya özel zaman/gelir grafiğini çizecektir.

---

## 5. API Endpoints (Core Requirements)

Ajan, minimum düzeyde aşağıdaki RESTful uç noktalarını (Endpoints) hazırlamalıdır:

* **Catalog:**
  * `GET /api/books` (Kategori ve Stok bilgisiyle listeler)
  * `POST /api/books` (Satıcının çöp veri ekleme testi için)
  * `DELETE /api/books/{id}` (Satıcının sistemi bozma testi için)
* **Checkout:**
  * `POST /api/basket/checkout` (Stok düşer, `Sale` tablosuna kayıt atar)
* **Analytics:**
  * `GET /api/sales/chart-data` (Satışları tarihe göre gruplayarak döner)

### 5.1. The OmniSeed Trigger Endpoint
* `POST /api/admin/reset`
* **İşlem:** Bu endpoint çağrıldığında, backend altyapısı bir dış işlemi (Process) tetikleyerek `OmniSeed` betiğini çalıştırır. (Docker ortamında çalışacağı için diğer container'a HTTP isteği veya paylaşılan volume üzerinden bash script tetiklemesi yapılabilir).

---

## 6. Frontend Requirements (React)
Frontend karmaşık bir state yönetimine ihtiyaç duymaz, sadece API'yi tüketir.

* **Views:**
  1.  **Storefront:** Kitapların listelendiği, filtreleme yapılabilen ve sepete eklenebilen müşteri ekranı.
  2.  **Seller Dashboard:** `Sale` tablosundan gelen verilerle "Zaman/Gelir" grafiği (Recharts veya Chart.js kullanılabilir) çizen sayfa.
* **The Golden Button (Kritik Element):**
  * Uygulamanın her sayfasında sağ alt köşede sabit duran (Fixed FAB) bir "Reset Demo State" butonu bulunmalıdır. Bu buton `POST /api/admin/reset` isteğini atar ve başarılı yanıt gelince sayfayı yeniler (`window.location.reload()`).