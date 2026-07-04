# Ankaradj — ankaradjparty.com

Altyapı: Next.js 16 + Cloudflare · Repo: `ankaradjparty-frontend-v2` (brand: `ankaradjparty`)
Genel durum: ✅ **Güçlü** teknik SEO temeli. Aşağıdakiler rich-result/kapsam/marka boşlukları.

## Canlı doğrulama (2026-07-04)
- title: "Ankara DJ Kiralama, Fiyat ve Teklif | Ankara DJ Party" · canonical: `https://ankaradjparty.com`
- robots: `index,follow` · hreflang: tr-TR + x-default · OG: **markalı** (`/brand/ankaradjparty/og/…`)
- H1: 1 · JSON-LD: Organization, Person, WebSite+SearchAction, FAQPage, GeoCoordinates, OpeningHours, ContactPoint
- robots.txt + sitemap (30 URL) sağlam · img alt: tam · http→https 301, www→non-www 308

---

## P1-A1 · DJ profil JSON-LD'de `aggregateRating` yok
- **Kanıt:** `dj.averageRating` + `dj.totalReviews` kartlarda kullanılıyor (`src/components/optimized/DJCard.jsx:28,74`); profil `Person`/`Service` şemasında rating yok.
- **Dosya:** `src/app/djs/[slugOrId]/layout.jsx` (`serviceSchema`/`personSchema`).
- **Düzeltme:** `averageRating>0 && totalReviews>0` iken `aggregateRating:{ "@type":"AggregateRating", ratingValue, reviewCount }` ekle.
- **Kabul kriteri:** Rich Results Test'te DJ profilinde `AggregateRating` valid; sayfada görünür puan var.
- **Doğrulama:** `search.google.com/test/rich-results` + canlı `curl … | grep AggregateRating`.
- **Durum:** [ ]

## P1-A2 · Sitemap DJ listesi `?limit=50` kesiyor
- **Kanıt:** `fetchList(apiUrl, '/djs?limit=50')`.
- **Dosya:** `src/app/sitemap.xml/route.js`.
- **Düzeltme:** limiti yükselt (`?limit=1000`) veya sayfalı döngü; Ankaradj için `city==='Ankara'` filtresinden ÖNCE yeterli veri gelmeli.
- **Kabul kriteri:** Onaylı tüm (demo hariç) DJ'ler sitemap'te.
- **Doğrulama:** `curl https://ankaradjparty.com/sitemap.xml | grep -c '/djs/'` = onaylı DJ sayısı.
- **Durum:** [ ]

## P1-A3 · Markalı OG görselleri kullanılmıyor
- **Kanıt:** `public/brand/ankaradjparty/og/*-ankara.png` (9 adet) yalnız `config.js`'de; servis sayfaları `image:"/og/kina-dj.png"` (hangises-tarzı) geçiyor, `servicePageMetadata` brand'e göre swap etmiyor → ankaradj sosyalinde hangises görseli.
- **Dosya:** `src/app/servicePageMetadata.js` (`resolveImage`).
- **Düzeltme:** brand `ankaradjparty` ise `image`'i `/brand/ankaradjparty/og/{slug-ankara}.png`e map et (yoksa `brand.ogImage`e düş). `canonicalPathForBrand` slug map'ini yeniden kullan.
- **Kabul kriteri:** ankaradjparty.com servis sayfalarının `og:image`'i markalı görseli döner.
- **Doğrulama:** `curl https://ankaradjparty.com/dugun-dj-ankara | grep og:image`.
- **Durum:** [ ]

## P2-A4 · Meta description ~176 karakter
- **Düzeltme:** ~155 karaktere kıs (brand `description`, `config.js` + servis `descriptionAnkara`).
- **Durum:** [ ]

## P2-A5 · `LocalBusiness.logo` `/logo.png` sabit
- **Dosya:** `src/app/layout.jsx` (`localBusinessSchema.logo`).
- **Düzeltme:** `${siteUrl}${brand.logoUrl}` (ankaradj → `/brand/ankaradjparty/logo.png`).
- **Durum:** [ ]

## P2-A6 · `sameAs` yalnız founder Instagram
- **Düzeltme:** `NEXT_PUBLIC_SOCIAL_URLS` env'ine GBP + YouTube/Spotify ekle.
- **Durum:** [ ]
