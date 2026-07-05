# SEO Yapılacaklar — Backlog

Dört proje için canlı (curl/HTTP) + kod denetiminden çıkan SEO ve teknik bulguların takip deposu. Her proje kendi ayrıntılı backlog dosyasına sahiptir; tüm maddeler önceliğe göre `BACKLOG.md` içinde konsolide edilir.

## Projeler

| Proje | Domain | Altyapı | Repo | Dosya |
|-------|--------|---------|------|-------|
| Ankaradj | ankaradjparty.com | Next.js 16 + Cloudflare (edge: Caddy) | `ankaradjparty-frontend-v2` (marka: ankaradjparty) | `projects/ankaradj.md` |
| Hangises | hangises.com | Next.js 16 + Cloudflare | `ankaradjparty-frontend-v2` (aynı codebase, çift marka: hangises) | `projects/hangises.md` |
| Nextrez | nextrez.com.tr | Next.js + Cloudflare (edge: Caddy) | Harici (repo oturumda yok; bulgular canlı denetimle) | `projects/nextrez.md` |
| BK Organizasyon | burcuevent.tr | Statik HTML / Caddy | `ihsanyurekli0-cpu/burcuevent` (GitHub PRIVATE, uzak yedekli, default `master`) | `projects/burcuevent.md` |

**Notlar:**
- `bkorganizasyon.com.tr` → `burcuevent.tr` alias'ıdır (aynı site).
- `nextrez.com` satılık park domain'idir; canlı ürün `nextrez.com.tr` üzerindedir.
- Ankaradj ve Hangises tek codebase'i (`ankaradjparty-frontend-v2`) marka-koşullu (`isAnkaradj` / `brand.*`) olarak paylaşır; ortak backend `api.hangises.com`, görseller `api.ankaradjparty.com`.

## Kullanım

1. `BACKLOG.md` — tüm projelerin maddelerini P0 → P1 → P2 sırasıyla tek tabloda birleştiren konsolide görünüm. Sprint planlaması ve önceliklendirme buradan yapılır.
2. `projects/<slug>.md` — proje bazlı ayrıntı: her madde için **Kanıt** (canlı curl + kod satırı), **Düzeltme**, **Kabul kriteri**, **Doğrulama** komutu ve **Durum** kutusu içerir.
3. Bir maddeye başlarken ilgili proje dosyasındaki `- **Durum:** [ ]` kutusunu güncelleyin; iş bitince ilgili **Doğrulama** komutunu canlıda çalıştırıp kabul kriterini teyit edin.
4. Konum sütunundaki dosya:satır referansları ilgili repoya görelidir (Nextrez hariç — o canlı-yalnız denetlenmiştir).

## Öncelik Ölçeği

- **P0 — Kritik / engelleyici:** indekslemeyi kıran, yanlış içerik servis eden veya güvenlik açığı olan; derhal ele alınır. (Şu an dört projede de sıfır.)
- **P1 — Yüksek:** ranking/marka sinyallerini bozan gerçek hatalar (yanlış-marka logosu, cross-brand coğrafi çelişki, şema sızması); genelde tek dosya değişimiyle çözülür, öncelikli.
- **P2 — Orta / düşük:** hijyen, olgunluk ve içerik-büyüme fırsatları (meta uzunlukları, JSON-LD entity birleştirme, görsel optimizasyonu, cache header'ları, redirect hop'ları, şehir/ilçe hub sayfaları).

## Altın Kural

**`aggregateRating` / `Review` yapısal verisi YALNIZCA sitede görünür, gerçek ve doğrulanabilir puanla eklenir.** ratingValue/reviewCount değerleri sayfadaki görünür yıldız/puan ile birebir eşleşmelidir. Sayfada karşılığı olmayan uydurma, tahmini veya kendi-koyduğun puan Google'ın "spammy structured markup" politikasını ihlal eder ve manuel işlem + rich-result kaybı riski taşır. Gerçek görünür puan yoksa bu alan hiç eklenmez.
