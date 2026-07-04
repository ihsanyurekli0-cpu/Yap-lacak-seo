# Konsolide Backlog — Öncelik Sıralı

Son güncelleme: 2026-07-04

## P1 — Yüksek etki

| # | Proje | Aksiyon | Dosya / Yer | Durum |
|---|---|---|---|---|
| 1 | Ankaradj + Hangises | DJ profil JSON-LD'ye `aggregateRating` ekle (veri mevcut) | `src/app/djs/[slugOrId]/layout.jsx` | [ ] |
| 2 | Ankaradj + Hangises | Sitemap DJ `?limit=50` kesintisini kaldır/sayfala | `src/app/sitemap.xml/route.js` | [ ] |
| 3 | Ankaradj | Servis OG'lerini markalı `/brand/ankaradjparty/og/*` görsele bağla | `src/app/servicePageMetadata.js` | [ ] |
| 4 | Nextrez | Anasayfaya semantik `<h2>/<h3>` başlıklar (şu an yok) | anasayfa şablonu | [ ] |
| 5 | Nextrez | `SoftwareApplication` şemasına `aggregateRating` | schema bloğu | [ ] |
| 6 | Burcuevent | `bkorganizasyon.com.tr/*` → `burcuevent.tr` tam 301 | DNS/sunucu/Caddy | [ ] |
| 7 | Burcuevent | `EventPlanner` şemasına `aggregateRating` + `Review` | anasayfa JSON-LD | [ ] |

## P2 — İyileştirme

| # | Proje | Aksiyon | Dosya / Yer | Durum |
|---|---|---|---|---|
| 8 | Tümü (4) | Meta description'ları ~155 karaktere kıs | ilgili metadata | [ ] |
| 9 | Ankaradj + Hangises | Blog `BlogPosting.image` = logo → gerçek cover görseli | `src/app/blog/[slug]/page.jsx:54` + `src/data/blogPosts.js` | [ ] |
| 10 | Ankaradj + Hangises | `LocalBusiness.logo` brand-aware yap | `src/app/layout.jsx` | [ ] |
| 11 | Ankaradj | `sameAs` genişlet (GBP/YouTube) | env `NEXT_PUBLIC_SOCIAL_URLS` | [ ] |
| 12 | Hangises | Blog `author` Person + `wordCount`/`inLanguage` | `src/app/blog/[slug]/page.jsx` | [ ] |
| 13 | Hangises | Şehir-kırılımlı içerik/landing stratejisi | içerik | [ ] |
| 14 | Nextrez | hreflang (`tr-TR`+`x-default`) — uluslararası plan varsa | metadata | [ ] |
| 15 | Nextrez | Sektör landing'lerine `FAQPage` + `BreadcrumbList` | sektör sayfaları | [ ] |
| 16 | Burcuevent | Servis `.html` sayfalarına `Service`+`BreadcrumbList`+benzersiz OG | servis sayfaları | [ ] |
| 17 | Burcuevent | (Ops.) `.html` uzantılı URL'leri uzantısız temiz URL'e 301 | sunucu | [ ] |

## Özet sayaç

- P1 açık: 7
- P2 açık: 10
- Toplam: 17
