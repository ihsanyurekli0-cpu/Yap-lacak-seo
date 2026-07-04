# Hangises — hangises.com

Altyapı: Next.js 16 + Cloudflare · Repo: `ankaradjparty-frontend-v2` (brand: `hangises`, aynı codebase)
Genel durum: ✅ **Güçlü** — güvenlik header'ları A-seviye.

## Canlı doğrulama (2026-07-04)
- title: "Hangi Ses | DJ, Müzisyen ve Ekipman Kiralama" · canonical self · robots `index,follow` · hreflang ×2
- JSON-LD: LocalBusiness, WebSite+SearchAction, FAQPage, **HowTo**+4 adım, ContactPoint
- robots.txt + sitemap (30 URL) · Güvenlik: HSTS preload, CSP nonce+strict-dynamic, X-Frame DENY, nosniff
- www→non-www 301, http→https 308

---

## P1-H1 · DJ profil `aggregateRating` (ortak kod — Ankaradj ile aynı)
- Bkz. [ankaradj.md#p1-a1](ankaradj.md). Aynı `djs/[slugOrId]/layout.jsx` iki markayı da besler.
- **Durum:** [ ]

## P1-H2 · Sitemap DJ `?limit=50` (ortak kod)
- Bkz. [ankaradj.md#p1-a2](ankaradj.md). Hangises `city:null` → tüm Türkiye DJ'leri, kesinti riski daha yüksek.
- **Durum:** [ ]

## P2-H3 · Blog `BlogPosting.image` = site logosu
- **Kanıt:** `image: logo` (`src/app/blog/[slug]/page.jsx:54`).
- **Düzeltme:** posta `cover` alanı ekle (`src/data/blogPosts.js`), şemada onu kullan; yoksa `brand.ogImage`, en son logo.
- **Kabul kriteri:** Article rich result gerçek 1200px+ temsili görselle valid.
- **Durum:** [ ]

## P2-H4 · Meta description ~167 karakter
- **Düzeltme:** ~155'e kıs (`config.js` brand `description`).
- **Durum:** [ ]

## P2-H5 · Blog `author` her zaman Organization
- **Düzeltme:** gerçek yazar varsa `Person`; `wordCount`, `inLanguage:"tr-TR"`, `articleSection` ekle.
- **Durum:** [ ]

## P2-H6 · Şehir-kırılımlı içerik stratejisi (ulusal marka)
- Hangises `city:null`; tüm geo sinyali Ankara markasında. İstanbul/İzmir/Ankara gibi şehir hub sayfaları ulusal aramalar için kapsamı artırır. (İçerik işi, kod değil.)
- **Durum:** [ ]
