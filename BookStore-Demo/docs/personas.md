# 👥 Kullanıcı Personaları ve Rolleri (User Personas)

**Proje:** Clean Bookstore Demo  
**Amaç:** Sistemin farklı yetki seviyelerindeki kullanıcılar tarafından nasıl tüketildiğini, verinin nasıl manipüle edildiğini ve "Golden State" (Altın Durum) ihtiyacının nasıl doğduğunu tanımlamak.

---

## 1. Müşteri (The Customer)
Sistemin son tüketicisi ve okuyucusudur. E-ticaret akışının temelini oluşturur.

* **Temel Amacı:** Kitap kataloğunu incelemek, ilgisini çeken kitapları bulmak ve pürüzsüz bir şekilde satın alma işlemini gerçekleştirmek.
* **Sistemdeki Yetkileri:**
  * `GET` Kitap listesini ve detaylarını görüntüleme.
  * Sepete ürün ekleme / çıkarma.
  * (Demo amaçlı) Fake bir ödeme adımıyla siparişi tamamlama ve stok düşürme.
* **Demo Senaryosundaki Rolü:** Müşterinin sürekli kitap satın alması stokları tüketir veya veritabanındaki "Golden State" dengesini bozar. Bu durum, bir sonraki sunum için veritabanının sıfırlanması ihtiyacını doğurur.

---

## 2. Satıcı (The Seller / Store Manager)
Mağazanın envanterini ve ticari performansını yöneten operasyonel kullanıcıdır.

* **Temel Amacı:** Mağazadaki ürün çeşitliliğini güncel tutmak ve satış performansını analiz ederek strateji belirlemek.
* **Sistemdeki Yetkileri:**
  * `POST / PUT / DELETE` Kitap ve Yazar ekleme, güncelleme ve silme (CRUD operasyonları).
  * **Performans Dashboard'u:** Satış verilerini görselleştirme. (Örn: X ekseninde Tarih/Aylar, Y ekseninde Gelir/Satış Adedi gösteren çizgi veya çubuk grafikler).
* **Demo Senaryosundaki Rolü (Kritik):** Satıcı, sistemi test ederken fiyatları yanlış girebilir, rastgele harflerden oluşan (örn: "asdfg") deneme kitapları ekleyebilir veya popüler kitapları silebilir. Satıcının bu "veriyi kirletme" eylemleri, OmniSeed'in temizlik gücünü göstermek için mükemmel bir zemin hazırlar.

---

## 3. Sistem Yöneticisi (The Admin / System Architect)
Sistemin mimari bütünlüğünden ve demo ortamının sunuma hazır olmasından sorumlu olan en üst düzey yetkilidir.

* **Temel Amacı:** Sistemin her an "satışa/sunuma hazır" (Sales-Ready) kusursuz verilerle çalıştığından emin olmak.
* **Sistemdeki Yetkileri:**
  * Müşteri ve Satıcı rolünün sahip olduğu tüm yetkilere (Okuma, Yazma, Analiz) sınırsız erişim.
  * **The "Golden Button" (Admin Reset):** Sadece Admin yetkisine sahip kullanıcıların görebildiği, sistemi dışarıdan yöneten OmniSeed CLI aracını tetikleyen kurtarma modülü.
* **Demo Senaryosundaki Rolü:** Satıcı veya Müşteri tarafından veritabanı "çöp veriyle" doldurulduğunda (Bad/Junk Data State), Admin tek bir butona basarak veritabanı şemasını taratır, mevcut veriyi temizler ve AI destekli Golden State önbelleğini sisteme enjekte ederek mağazayı ilk günkü kusursuz haline döndürür.