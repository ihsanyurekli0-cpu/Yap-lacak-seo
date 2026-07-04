# BK Organizasyon — burcuevent.tr

Marka: Burcuevent / BK Organizasyon® — Ankara organizasyon şirketi (düğün, kına, DJ, ses-ışık)
Altyapı: Statik site / Caddy · Repo: **harici** (bu oturumda yok)
Genel durum: 🟡 **Sağlam küçük kurumsal site**, alias & şema boşlukları.

## Canlı doğrulama (2026-07-04)
- title: "Ankara Organizasyon Şirketi: Düğün, Kına, DJ | Burcuevent" · canonical self (`https://burcuevent.tr/`)
- JSON-LD: **EventPlanner + FAQPage + OpeningHours + PostalAddress** (yerel işletme için doğru)
- OG var · H1:1 + H2:6 (iyi yapı) · img alt tam
- robots.txt + sitemap (9 URL: dugun/kina/dj-kiralama/bekarliga-veda/hizmetler/hakkimizda/iletisim)
- **Alias:** `bkorganizasyon.com.tr` — www→301 burcuevent.tr, robots/sitemap 301; ama kök `/` **200 duplicate** dönüyor, canonical burcuevent.tr

---

## P1-B1 · `bkorganizasyon.com.tr` alias 200 duplicate dönüyor
- **Kanıt:** `bkorganizasyon.com.tr/` = HTTP 200, içerik burcuevent ile aynı, canonical cross-domain `burcuevent.tr`. Sadece www + robots/sitemap 301'leniyor.
- **Düzeltme:** Tüm `bkorganizasyon.com.tr/*` (kök dahil) → `https://burcuevent.tr/$1` **301** (sunucu/Caddy veya Cloudflare redirect rule). Alias yalnız yönlendirici olsun, içerik sunmasın.
- **Kabul kriteri:** `curl -I https://bkorganizasyon.com.tr/` → 301 → burcuevent.tr.
- **Durum:** [ ]

## P1-B2 · `EventPlanner` şemasında `aggregateRating`/`Review` yok
- **Düzeltme:** Gerçek müşteri yorumları varsa `aggregateRating` (+ `Review`) ekle → yerel paket + yıldız.
- **Kabul kriteri:** Rich Results Test'te LocalBusiness/EventPlanner rating valid; puanlar sayfada görünür.
- **Durum:** [ ]

## P2-B3 · Meta description ~171 karakter
- **Düzeltme:** ~155'e kıs.
- **Durum:** [ ]

## P2-B4 · Servis sayfalarında şema derinliği
- **Düzeltme:** `dj-kiralama.html`, `dugun-organizasyonu.html`, `kina-organizasyonu.html` vb.'ye tekil `Service` + `BreadcrumbList` ve benzersiz `og:image` ekle.
- **Durum:** [ ]

## P2-B5 · (Opsiyonel) `.html` uzantılı URL'ler
- SEO'ya zararsız; uzun vadede uzantısız temiz URL'e 301'lenebilir.
- **Durum:** [ ]

## P2-B6 · robots.txt minimal
- Sadece `Allow: /` + `Sitemap`. Admin/özel yol yoksa sorun yok; varsa `Disallow` ekle.
- **Durum:** [ ]

> Not: Bu maddeler canlı HTML denetiminden. Uygulamak için Burcuevent repo/sunucu erişimi gerekli.
