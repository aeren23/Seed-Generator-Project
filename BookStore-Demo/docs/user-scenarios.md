# 🎬 Kullanıcı Senaryoları (User Scenarios)

**Proje:** Clean Bookstore Demo  
**Kapsam:** Müşteri, Satıcı ve Admin personalarının temel e-ticaret akışları ve sistemin demo durumunu manipüle etme süreçleri.

---

## 1. Müşteri Senaryoları (Customer Flows)

Müşteri senaryoları, e-ticaret uygulamasının temel okuma (read) ve sipariş oluşturma (write) işlemlerini kapsar.

### Senaryo 1.1: Kitap Keşfi ve Filtreleme
* **Aksiyon:** Müşteri anasayfaya girer.
* **Akış:** 1. Sistem, `Books` tablosundaki kayıtları kapak fotoğrafı, yazar, fiyat ve stok bilgisiyle listeler.
  2. Müşteri, `Category` filtresini kullanarak (örn: "Bilim Kurgu") listeyi daraltır.
* **Sonuç:** Müşteri aradığı kitabı bulur.

### Senaryo 1.2: Sepet Yönetimi ve Satın Alma
* **Aksiyon:** Müşteri beğendiği kitabı sepete ekler ve ödemeyi tamamlar.
* **Akış:**
  1. Kullanıcı (User), kitabın detayından "Sepete Ekle" butonuna basar (`Basket` tablosuna kayıt atılır).
  2. Sepet sayfasına gidip "Siparişi Tamamla" butonuna tıklar.
  3. Sistem, kitap stoklarını alınan adet kadar düşürür.
  4. Sipariş detayları `Sales` (Satışlar) tablosuna tarihi ve tutarıyla birlikte yazılır.
* **Sisteme Etkisi (Demo Bozulması):** Müşteriler sürekli kitap satın aldığında popüler kitapların stoku tükenir ve anasayfadaki liste zayıflar. Demo ortamının "zengin" görünümü kaybolur.

---

## 2. Satıcı Senaryoları (Seller Flows)

Satıcı senaryoları, envanter yönetimi ve mağaza analitiği üzerine kuruludur. OmniSeed'in gücünü göstereceğimiz "çöp veri" simülasyonları bu aşamada gerçekleşir.

### Senaryo 2.1: Envanter Manipülasyonu (Bozuk Veri Girişi)
* **Aksiyon:** Satıcı mağazaya yeni kitap ekler, fiyatları günceller veya kayıt siler.
* **Akış:**
  1. Satıcı envanter paneline girer.
  2. Test amacıyla Kategori: "Deneme", Kitap Adı: "asdfasdf", Fiyat: "$999999" olan anlamsız bir kayıt oluşturur (`Books` tablosuna INSERT).
  3. Mağazanın en popüler kitabını yanlışlıkla sistemden siler (`Books` tablosundan DELETE).
* **Sisteme Etkisi (Demo Bozulması):** Hoca veya müşteri demoyu izlerken ekranda anlamsız kitap isimleri ve fahiş fiyatlar görür. Satışa hazır (Sales-Ready) olan vitrin tamamen çöpe döner.

### Senaryo 2.2: Performans ve Satış Analizi
* **Aksiyon:** Satıcı, mağazasının ticari performansını görsel grafiklerle inceler.
* **Akış:**
  1. Satıcı "Dashboard" sayfasına tıklar.
  2. Sistem, `Sales` tablosundaki verileri gruplayarak çeker.
  3. Ekranda X ekseninde "Son 7 Gün", Y ekseninde "Toplam Gelir (₺)" olan bir çizgi grafik (Line Chart) render edilir.
* **Sonuç:** Müşterinin (Senaryo 1.2) yaptığı satın almalar burada grafiksel bir değere dönüşür.

---

## 3. Admin Senaryoları (Admin Flows & OmniSeed Execution)

Admin, sistemin tanrısıdır. Bozulmuş bir demoyu saniyeler içinde kurtarmakla görevlidir.

### Senaryo 3.1: "Admin Reset" ile Sistemi Golden State'e Döndürme
* **Aksiyon:** Admin, çöplüğe dönmüş veritabanını temizler ve AI tarafından üretilmiş kusursuz verileri geri yükler.
* **Ön Koşul:** Müşteriler stokları tüketmiş (Senaryo 1.2) ve Satıcı sisteme anlamsız veriler eklemiş (Senaryo 2.1) olmalıdır.
* **Akış:**
  1. Admin, sayfanın sağ alt köşesindeki gizli "Reset Demo State" butonuna tıklar.
  2. Uygulama backend'i, dışarıdaki `OmniSeed CLI` aracını tetikler.
  3. OmniSeed, PostgreSQL veritabanındaki `Books`, `Category`, `Basket` ve `Sales` tablolarını `TRUNCATE` ile tamamen temizler.
  4. OmniSeed, daha önce hashlenip kaydedilmiş `.demo_cache/golden_state.sql` dosyasındaki kusursuz verileri (Anlamlı Türkçe kitap isimleri, gerçekçi satış grafikleri için geçmiş tarihli satış verileri) tablolar arası FK ilişkilerine dikkat ederek sisteme basar.
  5. UI otomatik olarak yenilenir (veya Admin sayfayı yeniler).
* **Sonuç:** Ekranda "asdfasdf" isimli kitaplar kaybolur, tükenen stoklar geri gelir, satış grafikleri ideal bir eğriye oturur. Sistem bir sonraki sunum için **%100 hazır** hale gelir.