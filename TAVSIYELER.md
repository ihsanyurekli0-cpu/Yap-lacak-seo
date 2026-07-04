# Tavsiyeler + Hazır Kod (Fonksiyonel)

Backlog maddelerine **kopyala-yapıştır** uygulanabilir çözümler + proje başına strateji tavsiyeleri.
Kod snippet'leri gerçek dosyalar okunarak yazıldı (uydurma alan yok).

---

## A) HAZIR KOD — P1 düzeltmeleri

### A1 · DJ profil `aggregateRating` (Ankaradj + Hangises, ortak kod)
**Dosya:** `src/app/djs/[slugOrId]/layout.jsx` — `serviceSchema` içine.
Gerçek alanlar: `dj.averageRating`, `dj.totalReviews` (DJCard.jsx bunları zaten gösteriyor → "sayfada görünür puan" şartı sağlanır).

```js
// generateMetadata/DJDetailLayout içinde, dj yüklendikten sonra:
const ratingValue = Number(dj?.averageRating || 0);
const reviewCount = Number(dj?.totalReviews || 0);

serviceSchema = {
  // ...mevcut alanlar...
  // SEO: SERP yıldızı — YALNIZ gerçek, sayfada görünür puanla (spam cezası riski).
  ...(ratingValue > 0 && reviewCount > 0
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratingValue.toFixed(1),
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : {}),
};
```

### A2 · Sitemap DJ `limit=50` kaldır (ortak kod)
**Dosya:** `src/app/sitemap.xml/route.js`

```js
// ÖNCE:  const allDjs = await fetchList(apiUrl, '/djs?limit=50');
// SONRA (basit): backend max'ına göre yükselt
const allDjs = await fetchList(apiUrl, '/djs?limit=1000');

// VEYA (sağlam): sayfalı çek — backend limit'i sessizce kırpsa bile tümü gelir
async function fetchAllDjs(apiUrl) {
  const out = [];
  for (let page = 1; page <= 20; page++) {           // 20×100 = 2000 emniyet tavanı
    const batch = await fetchList(apiUrl, `/djs?limit=100&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}
```

### A3 · Ankaradj markalı OG swap
**Dosya:** `src/app/servicePageMetadata.js` — `path = canonicalPathForBrand(...)` satırından SONRA.
Mevcut 9 markalı OG (public/brand/ankaradjparty/og/): whitelist ile eşle, yoksa `brand.ogImage`e düş.

```js
// Markalı OG whitelist — public/brand/ankaradjparty/og/ içinde GERÇEKTEN var olan 9 dosya.
// (canlı müzik servisleri için markalı OG henüz render edilmedi → brand.ogImage fallback)
const ANKARADJ_OG = new Set([
  '/ankara-dj-hizmeti', '/ankara-dj-kiralama', '/dugun-dj-ankara', '/kina-dj-ankara',
  '/parti-dj-ankara', '/etkinlik-dj-ankara', '/kurumsal-etkinlik-dj-ankara',
  '/ses-sistemi-kiralama-ankara', '/dj-setup-kiralama-ankara',
]);

if (brand.id === 'ankaradjparty') {
  image = ANKARADJ_OG.has(path)
    ? `/brand/ankaradjparty/og${path}.png`   // örn. /brand/ankaradjparty/og/kina-dj-ankara.png
    : brand.ogImage;                          // default markalı görsel
}
```

### A4 · `LocalBusiness.logo` brand-aware
**Dosya:** `src/app/layout.jsx`

```js
// ÖNCE:  logo: `${siteUrl}/logo.png`,
// SONRA:
logo: `${siteUrl}${brand.logoUrl}`,   // hangises: /logo-mark.svg · ankaradj: /brand/ankaradjparty/logo.png
```
> Not: Google logo için raster tercih eder; hangises `logoUrl` SVG ise `public/`e 512×512 PNG ekleyip config'te onu göster.

### A5 · Meta description ~155 (hazır metinler)

| Proje | Önerilen (≤155ch) |
|---|---|
| Ankaradj | `Ankara DJ kiralama: düğün, kına, nişan ve partiler için profesyonel DJ, ses ve ışık sistemi. Onaylı profillerden hızlı teklif al.` |
| Hangises | `Düğün, kına, parti ve kurumsal etkinlikler için DJ, müzisyen ve ekipman kiralama. Onaylı profiller, tek noktadan teklif ve rezervasyon.` |
| Nextrez | `Ücretsiz randevu ve rezervasyon programı: personel çağırma, müşteri daveti, takvim senkronu ve WhatsApp bildirimleri tek panelde.` |
| Burcuevent | `Ankara organizasyon şirketi Burcuevent: düğün, nişan, kına, bekarlığa veda; DJ ve ses-ışık. 2014'ten beri BK Organizasyon güvencesi.` |

Ankaradj/Hangises: `src/lib/brand/config.js` → `description`. Nextrez/Burcuevent: kendi metadata/HTML'i.

### A6 · Nextrez anasayfa semantik başlık iskeleti
Sorun: `h1=1, h2=0, h3=0`. Bölüm div başlıklarını `<h2>`/`<h3>` yap:

```html
<h1>Ücretsiz randevu, rezervasyon ve personel planlamayı tek panelden yönetin.</h1>
  <h2>Neden Nextrez? Ücretsiz randevu programı</h2>
  <h2>Özellikler</h2>
    <h3>Personel çağırma</h3>
    <h3>Müşteri daveti ve hatırlatma</h3>
    <h3>iCloud / Google Takvim senkronu</h3>
    <h3>WhatsApp bildirimleri</h3>
  <h2>Sektörünüze özel randevu sistemi</h2>
    <h3>Kuaför randevu programı</h3>
    <h3>Güzellik salonu randevu sistemi</h3>
    <h3>Klinik ve diş kliniği randevu sistemi</h3>
  <h2>Nasıl çalışır?</h2>
  <h2>Sıkça sorulan sorular</h2>
```
> Görsel stili bozmamak için mevcut div'lerin tag'ini değiştir, class'ları koru.

### A7 · Burcuevent: `bkorganizasyon.com.tr` tam 301 (Caddy)

```caddyfile
# Caddyfile — alias yalnız yönlendirsin, içerik sunmasın:
bkorganizasyon.com.tr, www.bkorganizasyon.com.tr {
	redir https://burcuevent.tr{uri} permanent
}
```
Doğrulama: `curl -sI https://bkorganizasyon.com.tr/ | head -3` → `301` + `location: https://burcuevent.tr/`.

### A8 · Burcuevent: `aggregateRating` + `Review` şablonu
Mevcut EventPlanner JSON-LD'ye ek (YALNIZ sitede görünür gerçek yorumlarla):

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": 87,
  "bestRating": 5
},
"review": [{
  "@type": "Review",
  "author": { "@type": "Person", "name": "Gerçek Müşteri Adı" },
  "reviewRating": { "@type": "Rating", "ratingValue": 5 },
  "reviewBody": "Sitede görünen gerçek yorum metni..."
}]
```
> Değerleri GBP'deki gerçek sayılarla doldur ve aynı yorumları sayfada görünür bölümde listele.

### A9 · Burcuevent servis sayfası şeması (ör. dj-kiralama.html `<head>`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "name": "Ankara DJ Kiralama",
      "serviceType": "DJ Kiralama",
      "provider": { "@type": "LocalBusiness", "name": "Burcuevent", "url": "https://burcuevent.tr" },
      "areaServed": { "@type": "City", "name": "Ankara" },
      "url": "https://burcuevent.tr/dj-kiralama.html"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://burcuevent.tr/" },
        { "@type": "ListItem", "position": 2, "name": "Hizmetlerimiz", "item": "https://burcuevent.tr/hizmetlerimiz.html" },
        { "@type": "ListItem", "position": 3, "name": "DJ Kiralama", "item": "https://burcuevent.tr/dj-kiralama.html" }
      ]
    }
  ]
}
</script>
```
Aynı kalıbı `dugun-organizasyonu.html`, `kina-organizasyonu.html`, `bekarliga-veda-organizasyonu.html` için isim değiştirerek uygula + her sayfaya kendine özel `og:image`.

---

## B) STRATEJİ TAVSİYELERİ — proje başına (denetim ötesi büyüme)

### Ankaradj 🎧
1. **Yorum çarkı**: `/yorum` kısa linki zaten var — her etkinlik sonrası WhatsApp'tan QR/link gönder → GBP puanı büyüsün → A1 yıldızları beslenir.
2. **İlçe landing'leri**: `dugun-dj-cankaya`, `kina-dj-kecioren` gibi 3-5 yüksek hacimli ilçe sayfası (şablon: mevcut ServiceLandingPage + ilçe metni). areaServed zaten 10 ilçe sayıyor — içerik karşılığı yok.
3. **Video sinyali**: Etkinlik reels'lerini sayfaya göm (`VideoObject` şemasıyla) — DJ sektöründe dönüşümü en çok artıran içerik.
4. **Blog → servis içi-link**: relatedPosts var; tersini de yap (servis sayfasından ilgili blog'a 2-3 link).

### Hangises 🎶
1. **Şehir hub'ları** (en büyük fırsat): `/istanbul-dj-kiralama`, `/izmir-dj-kiralama`… Ulusal marka ama tüm geo Ankara markasında — rakipler şehir aramalarını alıyor.
2. **Programatik profil SEO**: DJ profillerinde tür×şehir başlık zenginleştirme ("İstanbul Techno DJ"), sitemap A2 ile birleşince uzun kuyruk trafiği.
3. **Kategori sayfası içerik**: `/djs`, `/equipment` listelerine 150-300 kelime açıklama + FAQ (thin-content önlemi).
4. **Marketplace review altyapısı**: puan/yorum zaten modelde — profillerde görünür yorum listesi = A1 şartı + güven.

### Nextrez 📅
1. **Sektör genişletme**: mevcut 4 sektör landing'i çalışıyor → berber, spa, pilates, veteriner, psikolog, diyetisyen ekle (aynı şablon). Her biri ayrı uzun kuyruk.
2. **Karşılaştırma içerikleri**: "X alternatifi ücretsiz randevu programı" tarzı 2-3 sayfa — SaaS'ta en yüksek niyetli trafik.
3. **FAQPage şeması**: "ücretsiz mi, kredi kartı gerekir mi, kaç personel" — SSS bölümü + şema → SERP alan kaplama.
4. **Gerçek kullanıcı puanı**: uygulama içi "bizi puanla" akışı → sitede görünür duvar → SoftwareApplication aggregateRating yasal olarak eklenebilir.

### Burcuevent 🎪
1. **GBP odak**: Yerel işletmede sıralamanın ~%40'ı GBP. Foto yükle (haftalık), yorum yanıtla, Q&A doldur; sitedeki NAP birebir aynı olsun.
2. **Galeri + image SEO**: etkinlik fotoğrafları sayfası (`ImageObject` + açıklayıcı alt) — "ankara kına organizasyonu" görsel aramasını alır.
3. **Yorum bölümü**: gerçek müşteri yorumlarını siteye koy → A8 şeması meşrulaşır.
4. **İlçe cümleleri**: servis metinlerine doğal ilçe geçişleri (Çankaya, Yenimahalle…) — ayrı sayfa açmadan yerel eşleşme.

---

## C) Uygulama sırası (önerilen sprint)

| Sprint | İş | Etki/Emek |
|---|---|---|
| 1 | A1+A2+A3+A4 (bu repo, tek PR) | Yüksek/Düşük ⚡ |
| 1 | A7 (Caddy 301, 5 dk) | Orta/Çok düşük ⚡ |
| 2 | A5 (4 desc) + A6 (Nextrez H2) | Orta/Düşük |
| 2 | A9 (Burcuevent servis şemaları) | Orta/Orta |
| 3 | A8 + B-tavsiyeleri (yorum çarkları, şehir/sektör landing'leri) | Yüksek/Orta-Yüksek |
