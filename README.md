# SEO Yapılacaklar — Backlog

Tam kapsamlı, çok-projeli SEO aksiyon takip deposu. Kaynak: canlı HTTP denetimi + kod denetimi
(2026-07-04, `seo-webdev-designer`).

## Projeler

| Proje | Domain | Altyapı | Repo | Dosya |
|---|---|---|---|---|
| Ankaradj | ankaradjparty.com | Next.js + Cloudflare | ankaradjparty-frontend-v2 | [projects/ankaradj.md](projects/ankaradj.md) |
| Hangises | hangises.com | Next.js + Cloudflare | ankaradjparty-frontend-v2 (aynı codebase) | [projects/hangises.md](projects/hangises.md) |
| Nextrez | nextrez.com.tr | Next.js + Cloudflare | (harici) | [projects/nextrez.md](projects/nextrez.md) |
| BK Organizasyon | burcuevent.tr | Statik / Caddy | (harici) | [projects/burcuevent.md](projects/burcuevent.md) |

> Domain notu: `nextrez.com` satılık park (bizim değil) → gerçek **nextrez.com.tr**.
> `bkorganizasyon.com.tr` alias → asıl site **burcuevent.tr** (marka: Burcuevent / BK Organizasyon®).

## Nasıl kullanılır

- Konsolide öncelik tablosu: **[BACKLOG.md](BACKLOG.md)**.
- Proje detayları `projects/` altında; her madde: **kanıt → düzeltme → kabul kriteri → doğrulama → durum**.
- Birden çok projeyi etkileyen bulgular: **[shared/ortak.md](shared/ortak.md)**.
- Durum kutuları: `- [ ]` açık · `- [x]` tamam. PR açınca satıra PR linkini ekle.

## Öncelik ölçeği

| Etiket | Anlam |
|---|---|
| **P0** | Kritik — indexleme/kırık, hemen |
| **P1** | Yüksek etki — sıralama/CTR kaybı |
| **P2** | İyileştirme — kazanç var, acil değil |

## Denetim yöntemi

Canlı: HTTP durum & yönlendirme, title/description, canonical, hreflang, meta robots, OG/Twitter,
H1–H3, JSON-LD, robots.txt, sitemap.xml, güvenlik header'ları. Ankaradj + Hangises için ek repo
kod denetimi. Tüm bulgular kanıt (dosya:satır veya canlı sinyal) ile.

## Altın kural

`aggregateRating`/`Review` şeması **yalnız sayfada görünür, doğrulanabilir gerçek puanla** eklenir.
Sahte/boş rating Google yapılandırılmış-veri spam cezası doğurur.
