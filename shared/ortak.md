# Ortak Bulgular — Birden Çok Projeyi Etkileyen

## O1 · `aggregateRating` fırsatı (3 mülk)
Ankaradj/Hangises DJ profilleri, Nextrez SaaS, Burcuevent kurumsal — hepsi gerçek puan verisiyle
SERP yıldızı kazanabilir.
- **Altın kural:** Yalnız **sayfada görünür, doğrulanabilir gerçek** puanla ekle. Sahte/boş rating
  = Google yapılandırılmış-veri spam cezası.
- İlgili: [ankaradj P1-A1](../projects/ankaradj.md), [nextrez P1-N2](../projects/nextrez.md),
  [burcuevent P1-B2](../projects/burcuevent.md).

## O2 · Meta description uzunluğu (4/4 mülk)
Ölçülen: Ankaradj 176 · Hangises 167 · Nextrez 183 · Burcuevent 171 karakter. Hepsi Google'ın
~155–160 kesme eşiğinin üstünde → SERP'te kırpılıyor.
- **Düzeltme:** En değerli faydayı ilk 155 karaktere sığdır.

## O3 · Şema derinliği (landing/servis sayfaları)
`BreadcrumbList` + `FAQPage`/`Service` şemasını servis ve sektör landing'lerine yaygınlaştır.
Ankaradj/Hangises servislerinde zaten var; Nextrez sektör sayfaları ve Burcuevent servis
`.html`'lerinde eksik.

## O4 · Ortak kod (Ankaradj + Hangises, tek codebase)
İki marka aynı `ankaradjparty-frontend-v2` deposundan sunuluyor. Şu maddeler tek düzeltmeyle
iki markayı da etkiler:
- DJ profil `aggregateRating` — `src/app/djs/[slugOrId]/layout.jsx`
- Sitemap DJ `limit=50` — `src/app/sitemap.xml/route.js`
- `LocalBusiness.logo` brand-aware — `src/app/layout.jsx`
- Blog `image`/`author` — `src/app/blog/[slug]/page.jsx`

## Doğrulama araç seti
- Rich Results: `https://search.google.com/test/rich-results`
- Canlı sinyal: `curl -s https://DOMAIN/ | grep -iE 'canonical|og:image|<h2|AggregateRating'`
- Sitemap: `curl -s https://DOMAIN/sitemap.xml | grep -c '<loc>'`
- robots: `curl -s https://DOMAIN/robots.txt`
