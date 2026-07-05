# Konsolide Backlog — Öncelik Sıralı

Son güncelleme: 2026-07-04

4 projenin (Ankaradj, Hangises, Nextrez, BK Organizasyon) canlı + kod denetiminden çıkan tüm SEO/teknik bulguları öncelik sırasına göre birleştirir. Detay, kanıt ve doğrulama komutları için proje bazlı dosyalara bakın (`projects/<slug>.md`). Kaynaklardaki tüm maddeler `open` durumundadır.

## P0

Hiçbir projede P0 (kritik/engelleyici) bulgu yok.

| # | Proje | Aksiyon | Konum | Durum |
|---|-------|---------|-------|-------|
| — | — | Kayıt yok | — | — |

## P1

| # | Proje | Aksiyon | Konum | Durum |
|---|-------|---------|-------|-------|
| 1 | Ankaradj | Sitewide Organization/publisher logosu yanlış markayı (Hangises wordmark, `/logo.png`) gösteriyor; `brand.logoUrl` kullan | src/app/layout.jsx:225 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 2 | Hangises | /equipment görünür H1 + Service şeması ulusal markada 'Ankara' hardcoded (title/meta ile çelişki) | src/app/equipment/page.jsx:262; src/lib/seo/equipment-schema.js:34,36 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 3 | Hangises | DJ liste (CollectionPage) @graph'ı profil sayfalarına sızıyor (2x BreadcrumbList + 2x FAQPage) | src/app/djs/layout.jsx:137-152 → page.jsx | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |

## P2

| # | Proje | Aksiyon | Konum | Durum |
|---|-------|---------|-------|-------|
| 1 | Ankaradj | Var olmayan DJ profili 404 yerine 200 (noindex) dönüyor — soft-404 + crawl israfı | src/app/djs/[slugOrId]/layout.jsx:87-95 | Açık |
| 2 | Ankaradj | DJ sitemap `/djs?limit=50` cap + limit-öncesi client-side şehir filtresi (latent kapsama açığı) | src/app/sitemap.xml/route.js:122,127-129 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 3 | Ankaradj | DJ profil meta description'ları anahtar-kelimesiz/şablon (ham bio) | src/app/djs/[slugOrId]/layout.jsx:39-45,100 | Açık |
| 4 | Ankaradj | Blog meta description'ları >155 karakter (SERP'te kesiliyor) | src/data/blogPosts.js:29,118 | Açık |
| 5 | Ankaradj | Blog `<title>`'ları >60 karakter; `\| Ankara DJ Party` son eki kesiliyor | src/data/blogPosts.js:28/117/212; src/lib/brand/config.js:104 | Açık |
| 6 | Ankaradj | Servis landing sayfaları bireysel DJ profillerine iç link vermiyor | src/components/shared/ServiceLandingPage.jsx:306 | Açık |
| 7 | Ankaradj | Başlık hiyerarşisi atlamaları (H1→H3; DJ profilinde SSR'da H2/H3 yok) | src/app/djs/[slugOrId]/layout.jsx:296-298 (home, /djs, profil) | Açık |
| 8 | Ankaradj | BlogPosting image + og:image + publisher.logo hepsi `/logo.png` | src/app/blog/[slug]/page.jsx:38,51,54 | Açık |
| 9 | Ankaradj | DJ profil sayfaları /djs liste şemasını miras alıyor (2x Breadcrumb/FAQ + CollectionPage sızması) | src/app/djs/layout.jsx:137-152; [slugOrId]/layout.jsx:228,238 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 10 | Ankaradj | Servis landing #organization'ı @id'siz ikinci ProfessionalService ile tekrarlıyor | src/components/shared/ServiceLandingPage.jsx:159-184 | Açık |
| 11 | Ankaradj | DJ Service/Offer'da aggregateRating yok — YALNIZ gerçek görünür puanla eklenmeli | src/app/djs/[slugOrId]/layout.jsx:186-226 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 12 | Ankaradj | Hash'li immutable statik varlıklar yalnız `max-age=60` ile serve ediliyor | next.config.mjs:77-82 (+ edge/Caddy) | Açık |
| 13 | Ankaradj | Servis landing jenerik ~460KB OG kullanıyor; markalı OG'ler atıl | src/lib/seo/servicePageMetadata.js:39-43 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 14 | Ankaradj | Preconnect yanlış origin'e; `api.ankaradjparty.com` (görsel origin'i) preconnect'siz | src/app/layout.jsx:363-366 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 15 | Ankaradj | Image optimizasyonu kapalı (passthrough loader) — webp/avif + resize yok | src/lib/imageLoader.js:13-23; next.config.mjs:19-23 | Açık |
| 16 | Ankaradj | COEP credentialless var ama COOP/CORP yok (fiili P3, defense-in-depth) | next.config.mjs:67 | Açık |
| 17 | Ankaradj | Ana LocalBusiness logosu `/logo.png` (node'lar arası tutarsız) | src/app/layout.jsx:225; ServiceLandingPage.jsx:141,165 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 18 | Ankaradj | Servis provider @id'siz ikinci işletme entity'si yaratıyor | src/components/shared/ServiceLandingPage.jsx:137-158 | Açık |
| 19 | Ankaradj | sameAs zayıf: yalnız kurucu IG'si; GBP/marka sosyal profili yok | src/app/layout.jsx:192-195,231-238 (NEXT_PUBLIC_SOCIAL_URLS) | Açık |
| 20 | Ankaradj | İlçe/şehir-hub landing sayfaları yok (areaServed 9 ilçe hedefliyor) | src/app/sitemap.xml/route.js:20-45 (STATIC_ROUTES) | Açık |
| 21 | Ankaradj | PostalAddress'te postalCode eksik (GBP/NAP tamlığı) | src/app/layout.jsx:253-261; ServiceLandingPage.jsx:143-148 | Açık |
| 22 | Hangises | DJ profilleri sitemap'te `limit=50` ile sert kesiliyor, sayfalama yok | src/app/sitemap.xml/route.js:122,69-82 | [Kapandı](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) |
| 23 | Hangises | Statik lastmod = dosya mtime; her deploy 'şimdi'ye sıfırlanıyor | src/app/sitemap.xml/route.js:54 | Açık |
| 24 | Hangises | http+www girişte 2 zincirli redirect | Edge (Cloudflare Redirect Rule / Caddy) | Açık |
| 25 | Hangises | İki meta description SERP sınırını aşıyor (equipment 204, muzisyen-kiralama 187) | src/app/equipment/layout.jsx:17; src/app/muzisyen-kiralama/page.jsx:9 | Açık |
| 26 | Hangises | Blog BlogPosting.image (+og/twitter) marka logosunu kullanıyor | src/app/blog/[slug]/page.jsx:38,54-55 | Açık |
| 27 | Hangises | Blog author @type Organization — Person değil (E-E-A-T) | src/app/blog/[slug]/page.jsx:47 | Açık |
| 28 | Hangises | İndekslenen DJ profilleri zayıf/test bio'yu meta description basıyor | src/app/djs/[slugOrId]/layout.jsx:42,100,107 | Açık |
| 29 | Hangises | #organization node'unda marka sameAs (sosyal profil) yok | src/app/layout.jsx:231-238 (NEXT_PUBLIC_SOCIAL_URLS) | Açık |
| 30 | Hangises | Ulusal markada LocalBusiness + sabit Ankara adresi (areaServed=Country ile uyumsuz) | src/app/layout.jsx:201-261; config.js:45 | Açık |
| 31 | Hangises | LocalBusiness'ta geo koordinatı ve openingHoursSpecification yok | src/app/layout.jsx:263,282 | Açık |
| 32 | Hangises | Görsel optimizasyonu devre dışı (passthrough loader) — AVIF/WebP + resize yok | src/lib/imageLoader.js:13-23; next.config.mjs:19-23 | Açık |
| 33 | Hangises | DJ profil og:image ham foto — 1200x630 markalı kart değil, width/height yok, cross-origin | src/app/djs/[slugOrId]/layout.jsx:116,118-119 | Açık |
| 34 | Hangises | Strict-Transport-Security header'ı iki kez (duplike) gönderiliyor | next.config.mjs:60 + edge | Açık |
| 35 | Hangises | Fold-altı footer logosu (logo.svg) her rotada preload ediliyor (yalnız edge config) | Edge/early-hints Link header (repoda yok) | Açık |
| 36 | Hangises | Kök statik public varlıklar kısa cache'leniyor (max-age=60) | next.config.mjs headers() (og-image.png, manifest) | Açık |
| 37 | Hangises | Ulusal marka için şehir-hub landing sayfaları yok | sitemap + src/lib/serviceLocalization.js (ANKARADJ_PATH_MAP) | Açık |
| 38 | Nextrez | http://www için 2 adımlı yönlendirme zinciri | Edge (Cloudflare Redirect Rule / Caddy) | Açık |
| 39 | Nextrez | Sitemap düşük değerli utility sayfaları içeriyor (/login, /signup index,follow) | sitemap.xml; /login meta robots | Açık |
| 40 | Nextrez | Anasayfada hiç H2/H3 yok — semantik başlık hiyerarşisi eksik | / (anasayfa şablonu; `<p>` yerine `<h2>`) | Açık |
| 41 | Nextrez | Meta description'lar >155ch — SERP'te kesiliyor (8/9 sayfa) | ilgili sayfa metadata | Açık |
| 42 | Nextrez | Sektör landing'lerinde anahtar kelime yamyamlığı (klinik↔diş, güzellik↔spa) | /klinik-randevu-sistemi, /guzellik-salonu-randevu-sistemi title/H1 | Açık |
| 43 | Nextrez | Bazı `<title>`'lar >60ch (dis-klinigi 68, karsilastirma 66, fiyatlandirma 62) | ilgili sayfa metadata | Açık |
| 44 | Nextrez | SoftwareApplication'da aggregateRating/review yok — YALNIZ gerçek görünür puanla | #software JSON-LD (tüm sayfalar) | Açık |
| 45 | Nextrez | Organization şemasında telephone ve PostalAddress yok | #organization JSON-LD | Açık |
| 46 | Nextrez | CSP script-src'te 'unsafe-inline' — nonce/hash yok, XSS koruması zayıf | response header / middleware CSP | Açık |
| 47 | Nextrez | x-powered-by: Next.js header'ı framework'ü ifşa ediyor | next.config.js poweredByHeader / edge strip | Açık |
| 48 | Nextrez | OG/Twitter sosyal görselleri cache'lenmiyor (max-age=0, must-revalidate) | /opengraph-image.png, /twitter-image.png route | Açık |
| 49 | Nextrez | Hiç hreflang yok (self tr-TR + x-default) ve og:locale yok | alternates.languages (app router) | Açık |
| 50 | Nextrez | NAP eksik: şemada/iletişimde telefon ve adres yok (yalnız e-posta) | #organization JSON-LD + /iletisim | Açık |
| 51 | Nextrez | Şehir hedefleme sıfır — sektör landing'lerinde şehir/ilçe içeriği yok (hub fırsatı) | sitemap + sektör sayfaları | Açık |
| 52 | BK Organizasyon | /index.html kök ile byte-byte özdeş 200 kopyası (sunucuda 301 yok) | Caddy (`redir /index.html /`) | Açık |
| 53 | BK Organizasyon | Sitemap lastmod tüm 9 URL'de aynı ve deploy tarihine eşit | sitemap.xml üreticisi | Açık |
| 54 | BK Organizasyon | http://www 2 atlamalık zincirle çözülüyor | Caddy redirect | Açık |
| 55 | BK Organizasyon | Ana sayfa H1'i yalnızca marka; hedef anahtar kelime H1'de yok | index.html `<h1>` | Açık |
| 56 | BK Organizasyon | Meta description çok uzun (kina-gecesi 201, hizmetlerimiz 175) — kesiliyor | kina-gecesi.html, hizmetlerimiz.html | Açık |
| 57 | BK Organizasyon | kina-gecesi.html `<title>`'ında marka + Ankara yok; og:title ile tutarsız | kina-gecesi.html `<title>` | Açık |
| 58 | BK Organizasyon | EventPlanner/LocalBusiness'te aggregateRating/Review yok — YALNIZ gerçek puanla | JSON-LD (9/9 sayfa) | Açık |
| 59 | BK Organizasyon | EventPlanner'da geo koordinatı ve hasMap yok | JSON-LD (9/9 sayfa) | Açık |
| 60 | BK Organizasyon | kina-gecesi.html Article'da datePublished/dateModified yok | kina-gecesi.html Article JSON-LD | Açık |
| 61 | BK Organizasyon | Varlık grafiği @id ile birleştirilmemiş (provider/author/publisher parçalı) | JSON-LD (9/9 sayfa) | Açık |
| 62 | BK Organizasyon | Content-Security-Policy response header eksik | Caddy header bloğu | Açık |
| 63 | BK Organizasyon | og:image/twitter:image sosyal kart oranı hatalı (1200x630 değil) | index.html, dugun-organizasyonu.html og meta | Açık |
| 64 | BK Organizasyon | Görseller yalnız JPEG/JPG — WebP/AVIF yok (LCP hero modern formatta değil) | assets/images/*.jpeg; `<picture>` | Açık |
| 65 | BK Organizasyon | /assets/pwa.js ve /assets/wa-form.js Cache-Control header'sız | Caddy cache kuralı | Açık |
| 66 | BK Organizasyon | theme-color tutarsız: HTML meta (#2a0f1a) ≠ manifest (#1a1512) | HTML head + assets/manifest.json | Açık |
| 67 | BK Organizasyon | LocalBusiness şemasında geo/hasMap/GBP sameAs eksik; harita embed doğrulanmış Place değil | JSON-LD + iletisim.html | Açık |
| 68 | BK Organizasyon | İlçe/şehir hub landing sayfaları yok (areaServed ilçeleri için fırsat) | sitemap.xml (9 URL) | Açık |
| 69 | BK Organizasyon | kina-gecesi.html başlığında şehir/marka yok + yerel işletme şeması eksik | kina-gecesi.html title + schema | Açık |

---

## Özet Sayaç

| Proje | Domain | P0 | P1 (kapandı) | P2 (kapandı) | Toplam |
|-------|--------|----|----|----|--------|
| Ankaradj | ankaradjparty.com | 0 | 1 (1) | 21 (6) | 22 |
| Hangises | hangises.com | 0 | 2 (2) | 16 (1) | 18 |
| Nextrez | nextrez.com.tr | 0 | 0 | 14 | 14 |
| BK Organizasyon (Burcuevent) | burcuevent.tr | 0 | 0 | 18 | 18 |
| **Toplam** | — | **0** | **3 (3)** | **69 (7)** | **72** |

- **P0:** 0 — hiçbir projede kritik/engelleyici bulgu yok.
- **P1:** 3/3 **KAPANDI** — [PR #2](https://github.com/ihsanyurekli0-cpu/ankaradjparty-frontend-v2/pull/2) (2026-07-05): marka logosu, /equipment Ankara-hardcode, DJ liste şeması sızması.
- **P2:** 69, 7'si aynı PR'da kapandı (sitemap pagination ×2, aggregateRating, OG swap, preconnect, org-logo tutarlılığı, djs şema sızması-Ankaradj tarafı). Kalan 62 madde açık — hijyen/olgunluk/fırsat (meta uzunlukları, JSON-LD entity birleştirme, görsel optimizasyonu, cache, redirect hop'ları, şehir/ilçe hub içeriği).
