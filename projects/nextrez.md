# Nextrez — nextrez.com.tr

Ürün: Ücretsiz randevu/rezervasyon & personel planlama SaaS · Altyapı: Next.js + Cloudflare
Repo: **harici** (bu oturumda yok — uygulamak için repo eklenmeli)
Genel durum: 🟡 **İyi temel**, içerik/şema boşlukları.

## Canlı doğrulama (2026-07-04)
- title: "Nextrez — Ücretsiz Randevu ve Rezervasyon Programı" · canonical self · robots `index,follow`
- JSON-LD: **SoftwareApplication + Offer + Organization + WebSite + ContactPoint** (SaaS için doğru tip)
- OG (Next dinamik) var · robots.txt + sitemap (25 URL: kuaför/güzellik/klinik/diş randevu landing'leri)
- www + http düzgün 301 · hreflang: yok

---

## P1-N1 · Anasayfada semantik başlık yok (`h2=0, h3=0`)
- **Kanıt:** Canlı DOM'da `h1=1, h2=0, h3=0`. Landing tamamen H1 + div metin.
- **Düzeltme:** Bölümleri (özellikler, sektörler, "nasıl çalışır", fiyat/ücretsiz, SSS) semantik `<h2>`/`<h3>` yap; anahtar kelimeleri başlıklara taşı ("ücretsiz randevu programı", "personel çağırma", "iCloud/Google Takvim senkronu").
- **Kabul kriteri:** Anasayfada anlamlı H2 hiyerarşisi; erişilebilirlik denetimi (axe) başlık uyarısı vermez.
- **Doğrulama:** `curl https://nextrez.com.tr/ | grep -c '<h2'` > 0.
- **Durum:** [ ]

## P1-N2 · `SoftwareApplication` şemasında `aggregateRating` yok
- **Düzeltme:** Gerçek kullanıcı puanı/yorum varsa `aggregateRating` (+ istenirse `Review`) ekle. "Ücretsiz/kredi kartsız" mesajıyla yıldız güçlü CTR verir.
- **Kabul kriteri:** Rich Results Test'te Software App `AggregateRating` valid; puan sayfada görünür.
- **Durum:** [ ]

## P2-N3 · Meta description 183 karakter (SERP'te kesiliyor)
- **Düzeltme:** ~155 karaktere kıs, en önemli faydayı öne al.
- **Durum:** [ ]

## P2-N4 · hreflang yok
- Yalnız TR hedefse sorun değil. Uluslararası plan varsa `tr-TR` + `x-default` (ve gelecekte `en`) ekle.
- **Durum:** [ ]

## P2-N5 · Sektör landing'lerine şema derinliği
- **Düzeltme:** kuaför/klinik/güzellik/diş randevu sayfalarına `FAQPage` + `BreadcrumbList` (uygunsa sayfaya özel `SoftwareApplication`/`Service`). Sektörel long-tail için rich result.
- **Durum:** [ ]

> Not: Bu maddeler canlı HTML denetiminden. Uygulamak için Nextrez repo'su eklenmeli.
