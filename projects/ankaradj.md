# Ankaradj — ankaradjparty.com

Stack: Next.js 16 + Cloudflare (edge: Caddy). Repo: `ankaradjparty-frontend-v2` (tek codebase, marka: ankaradjparty; ortak backend `api.hangises.com`, görseller `api.ankaradjparty.com`). Genel değerlendirme: 🟡 — güvenlik/teknik taban güçlü, ancak 1 adet P1 (sitewide yanlış-marka logosu) ve çok sayıda P2 hijyen/optimizasyon kalemi açık.

## Canlı doğrulama (2026-07-04)
- **Doğru 404:** Geçersiz statik yol (`/bu-sayfa-yok-123`) HTTP 404 dönüyor — app gerçek 404 üretebiliyor (dinamik DJ route hariç, bkz. P2-1).
- **Canonical:** Sayfalarda `<link rel="canonical">` mevcut (DJ profillerinde noindex ile birlikte gelmesi P2-1 sorunu).
- **JSON-LD @type'lar:** `LocalBusiness`/`ProfessionalService` (#organization, tam adres+geo), `ProfilePage`, `Service`+`Offer`, `BreadcrumbList`, `FAQPage`, `CollectionPage`+`ItemList`, `Person`, `BlogPosting` — zengin şema kapsamı var (tekrar/entity sorunları P2 bölümünde).
- **Sitemap:** `sitemap.xml` 30 URL; 3 adet `/djs/` profil `loc` (yayınlanmış Ankara DJ sayısıyla tutarlı).
- **Güvenlik header'ları (A+):** HSTS preload+includeSubDomains 2yr, CSP nonce+strict-dynamic+`frame-ancestors 'none'`+upgrade-insecure-requests, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, `poweredByHeader` kapalı, COEP `credentialless` (COOP/CORP eksik → P2-17).
- **Cache:** API upload görselleri doğru şekilde `public, max-age=31536000`; ancak hash'li `/_next/static/*` yalnız `max-age=60` (P2-13).

---

## P1-1 · Sitewide LocalBusiness/Organization logosu yanlış markayı (HANGISES wordmark) gösteriyor
- **Kanıt:** `src/app/layout.jsx:225` `#organization` node'unu `logo: ${siteUrl}/logo.png` (HARDCODED) ile üretiyor. Canlı: `curl -s https://ankaradjparty.com/ | grep -o '"logo":"[^"]*"'` → `"logo":"https://ankaradjparty.com/logo.png"`. Bu dosya HTTP 200 image/png 1024x325 ve GÖRSEL OLARAK pembe-turuncu 'hangises' (parent/rakip marka) wordmark'ı. Doğru ankaradj logosu `/brand/ankaradjparty/logo.png` (198x120, HTTP 200) mevcut ve `ServiceLandingPage.jsx:165` zaten onu kullanıyor → aynı hizmet sayfasında iki farklı logo. Google Organization.logo'yu bilgi paneli/marka SERP'inde kullanır.
- **Düzeltme:** `layout.jsx:225` `logo` = `${siteUrl}${brand.logoUrl}` yap (ankaradj için `/brand/ankaradjparty/logo.png`). `/logo.png` (hangises) ankaradj şemasında hiçbir yerde referanslanmasın. Aynı düzeltme blog `publisher.logo` için de geçerli.
- **Kabul kriteri:** Rich Results Test Organization.logo Ankara DJ Party markını render eder; ankaradj JSON-LD'de `logo` değeri `/brand/ankaradjparty/` altını gösterir, `/logo.png` geçmez.
- **Doğrulama:** `curl -s https://ankaradjparty.com/ | grep -o '"logo":"[^"]*"'`
- **Durum:** [ ]

---

## P2-1 · Var olmayan DJ profili 404 yerine HTTP 200 (noindex) dönüyor — soft-404 + crawl israfı
- **Kanıt:** `curl -s -o /dev/null -w '%{http_code}' https://ankaradjparty.com/djs/000000000000000000000000` → HTTP 200. Gövdede hem `<meta name="robots" content="noindex, follow">` hem `<link rel="canonical" href=".../djs/000000000000000000000000">` (çelişkili sinyal). `src/app/djs/[slugOrId]/layout.jsx:87-95` — dj bulunamayınca `generateMetadata` noindex+canonical dönüyor ama page/layout `notFound()` çağırmıyor → status 200 kalıyor. Silinen/eski DJ profilleri (bir zamanlar indexlenmiş) şimdi 200+noindex → GSC 'Soft 404' + sürekli yeniden crawl.
- **Düzeltme:** `djs/[slugOrId]` page/layout data fetch'inde `dj === null` iken `next/navigation` `notFound()` çağır → gerçek 404 (istenirse 410). noindex korunur; not-found dalında `alternates.canonical`'ı KALDIR. UYARI: sahte içerik/rating eklenmez, sadece doğru HTTP status.
- **Kabul kriteri:** Geçersiz/silinmiş DJ id isteği HTTP 404 (veya 410) döner; GSC Soft 404 raporunda `/djs/*` düşme eğilimi.
- **Doğrulama:** `curl -s -m 15 -o /dev/null -w '%{http_code}\n' https://ankaradjparty.com/djs/000000000000000000000000` (beklenen: 404)
- **Durum:** [ ]

## P2-2 · DJ sitemap `/djs?limit=50` cap + limit-öncesi client-side şehir filtresi (latent kapsama açığı)
- **Kanıt:** `src/app/sitemap.xml/route.js:122` `fetchList(apiUrl, '/djs?limit=50')`, `127-129` `brand.city ? allDjs.filter(d => d?.city === brand.city) : allDjs`. `apiUrl = api.hangises.com` (ortak/national backend, `config.js:91`); `city:'Ankara'` hard filter sadece client-side. Önce TÜM Türkiye'den ilk 50 DJ çekiliyor, SONRA Ankara'ya filtreleniyor. Canlı: sitemap şu an 3 `/djs/` `loc` içeriyor (marketplace toplam 5 DJ) → cap bugün ISIRMIYOR. Ancak national havuz 50'yi aşınca, ilk 50'ye giremeyen Ankara DJ'leri — Ankara sayısı 50'nin çok altında olsa bile — sitemap'ten tamamen düşebilir.
- **Düzeltme:** API çağrısını sayfalı (pagination) yap ya da limit'i kaldır/yükselt; ideal olarak şehir filtresini fetch limit'inden ÖNCE server-side uygula (backend brand-aware `?city=Ankara`, `config.js:91`'deki 'M3 brand-aware filter' TODO'su). NOT: mevcut `?city=Ankara` API'si `total=2` dönüyor (limit=50'deki 5 ile tutarsız) ve `?limit=200` reddediliyor → naif uygulama bugün kapsamayı düşürür; önce backend reconcile.
- **Kabul kriteri:** Yayınlanmış (isDemo olmayan) Ankara DJ sayısı arttıkça sitemap'teki `/djs/` `loc` sayısı = yayınlanmış Ankara DJ sayısı; national havuz 50+ olsa bile Ankara profili düşmez.
- **Doğrulama:** `curl -s https://ankaradjparty.com/sitemap.xml | grep -c '<loc>[^<]*/djs/'` (yayınlanmış Ankara DJ sayısıyla karşılaştır)
- **Durum:** [ ]

## P2-3 · DJ profil meta description'ları anahtar-kelimesiz/şablon (ham gündelik bio ya da jenerik kalıp)
- **Kanıt:** `pickBio` (`src/app/djs/[slugOrId]/layout.jsx:39-45`) yalnız bio<60 karakterse fallback şablonu üretir; 60+ karakterli gündelik biolar aynen description olur (`layout.jsx:100` `description=bio.slice(0,160)`). Canlı `/djs/68e9534d1d13ec636ca41d1c` DESC(74): 'Ben C0D3R!, Asıl işim yazılım ama hobi olarak DJ'lik yapmaya karar verdim.' — 'Ankara'/'DJ kiralama'/hizmet/lokasyon anahtarı YOK; 'yazılım'/'hobi' arama niyetine ters. Kısa biolu DJ'lerde fallback yalnız isim değişen jenerik metin → çoklu DJ'de near-duplicate. (Not: title, sr-only H1 ve JSON-LD zaten 'Ankara DJ Kiralama' taşıyor — eksik olan yalnız meta description.)
- **Düzeltme:** Description'ı bio'dan bağımsız her zaman anahtar-kelime öncelikli üret: `<name> — Ankara DJ kiralama. <varsa genres> Düğün, kına, parti ve kurumsal etkinlikler için profil, örnek set ve fiyat.` Bio'yu sadece zenginleştirme olarak kullan. 60-karakter fallback eşiğini kaldır; her profilde 'Ankara' + 'DJ kiralama' + hizmet bağlamı garanti, genres/handle ile benzersiz, 150-155 karakter hedefle.
- **Kabul kriteri:** Her DJ profil description'ı 'Ankara' ve 'DJ kiralama/hizmet' anahtarını içerir, gündelik/alakasız bio metnini tek başına kullanmaz, profiller arası benzersiz (≤155 karakter).
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/djs/68e9534d1d13ec636ca41d1c | grep -io 'name="description" content="[^"]*"'` ('Ankara' + 'kiralama' geçmeli)
- **Durum:** [ ]

## P2-4 · Blog meta description'ları ~155 karakter SERP sınırını aşıyor (kesiliyor)
- **Kanıt:** Kod-noktası uzunluklar: `blog/ses-sistemi-kiralama-rehberi` = 175 (`src/data/blogPosts.js:118`), `blog/dugun-dj-mi-canli-muzik-mi` = 172 (`blogPosts.js:29`). Canlı curl bu metinleri birebir doğruluyor. (Önceki 'wc -m 192/194' bayt sayımıydı; Türkçe çok-baytlı karakterler nedeniyle şişik — doğru kod-noktası 172-175, yine >155.) Sınırda: anasayfa 157 (`src/app/page.jsx:54`), servis ses-sistemi/orkestra 158, `blog/dugun-muzigi` 158.
- **Düzeltme:** Blog description'larını 150-155 karaktere indir; ilk 150 karaktere birincil anahtar + net değer önerisini yerleştir. `blogPosts.js` description alanlarını yeniden yaz.
- **Kabul kriteri:** Tüm blog (ve anasayfa) meta description'ları ≤155 kod-noktası; SERP'te kesilme yok.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/blog/ses-sistemi-kiralama-rehberi | grep -o 'name="description" content="[^"]*"' | sed -E 's/.*content="//;s/"$//' | python3 -c 'import sys;print(len(sys.stdin.read().strip()))'` (≤155)
- **Durum:** [ ]

## P2-5 · Blog `<title>`'ları çok uzun; `| Ankara DJ Party` son eki SERP'te kesiliyor
- **Kanıt:** Canlı title uzunlukları: `blog/dugun-dj-mi-canli-muzik-mi` = 91 karakter, `blog/ses-sistemi-kiralama-rehberi` = 74 karakter, `blog/dugun-muzigi-akisi-saat-saat-plan` = 69 karakter — üçü de ~60 karakter SERP eşiğini aşıyor. Title tabanları `src/data/blogPosts.js` (satır 28/117/212), `%s | Ankara DJ Party` son eki `src/lib/brand/config.js:104` (18 karakter). Google ~60 karakter sonrası keser → marka son eki ve konu kuyruğu görünmez. Servis/anasayfa title'ları (48-53) sağlıklı.
- **Düzeltme:** Blog title'larını ~60 karaktere sığdır: başlığı kısalt veya blog şablonunda marka son ekini kısalt/kaldır (ör. yalnız `| Ankara DJ` ya da son ek yok). Birincil anahtar başta kalsın.
- **Kabul kriteri:** Blog `<title>`'ları ≤60 karakter (marka son eki dahil) ve birincil anahtar kesilmeden görünür.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/blog/dugun-dj-mi-canli-muzik-mi | grep -io '<title>[^<]*</title>' | sed -E 's/<\/?title>//g' | python3 -c 'import sys;print(len(sys.stdin.read().strip()))'` (≤60)
- **Durum:** [ ]

## P2-6 · Servis landing sayfaları bireysel DJ profillerine hiç iç link vermiyor
- **Kanıt:** Canlı `/dugun-dj-ankara`: `href="/djs/<id>"` = 0 (yalnız 3x `href="/djs"` liste linki). Buna karşı anasayfa 5 profil linkliyor. `ServiceLandingPage.jsx` yalnız ilgili SERVİS kartları + CTA'da `<Link href="/djs">` (satır 306) üretiyor; bileşende bireysel DJ profiline link üretecek veri/prop yolu yok. Profiller orphan değil (anasayfa + `/djs` listesinden 1 hop), ancak servis→profil bağlamsal iç-otoritesi akmıyor.
- **Düzeltme:** Her servis landing'ine ilgili 2-4 DJ profiline açıklayıcı anchor'la bağlamsal link ekle (ör. 'Düğün DJ' sayfasında 'Dionys — Ankara düğün DJ'). Genel 'DJ'leri gör' yerine isim+niş anchor kullan.
- **Kabul kriteri:** Her servis sayfası en az 2 bireysel `/djs/<id>` profil linki içerir; anchor metinleri isim+bağlam taşır.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/dugun-dj-ankara | grep -oE 'href="/djs/[a-z0-9]+"' | sort -u` (>0 profil linki dönmeli)
- **Durum:** [ ]

## P2-7 · Başlık hiyerarşisi atlamaları (anasayfa & /djs H1→H3; DJ profillerinde SSR'da hiç H2/H3 yok)
- **Kanıt:** Canlı başlık sırası — anasayfa: `h1 h3 h3 h3 h2 ...` (H1 sonrası araya H2 girmeden 3 hero rozeti H3: 'Onaylı DJ Profilleri / Tek Noktadan Teklif / Ses & Işık Dahil'). `/djs`: `h1 h3 h2 h2` + footer h5×4. DJ profil `/djs/68e9534d1d13ec636ca41d1c` SSR: yalnız `h1(sr-only)` + footer h5×4, gövdedeki H2/H3'ler client-render (`layout.jsx:296-298` SSR'da yalnız sr-only H1); footer H5 → H3/H4 atlanıyor.
- **Düzeltme:** H1'den sonraki ilk içerik başlığı H2 olsun: hero güven rozetlerini H3'ten çıkar (span/strong yap) veya bölüm başlığını H2'ye çek. DJ profillerinde bio/genres/FAQ için en az bir görünür H2'yi server-side render et. Footer başlıklarını H4/H2 seviyesine çekerek H3→H5 atlamasını gider.
- **Kabul kriteri:** Her sayfada H1'den sonra ilk başlık H2; seviye atlaması yok; DJ profil sunucu HTML'inde en az bir içerik H2'si var.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/ | grep -oE '<h[1-6][^>]*>' | sed -E 's/<(h[1-6])[^>]*>/\1/' | head -5` (h1'den sonra h2 gelmeli)
- **Durum:** [ ]

## P2-8 · BlogPosting image + og:image + publisher.logo hepsi `/logo.png` (geçersiz makale görseli)
- **Kanıt:** `src/app/blog/[slug]/page.jsx:38` `const logo = ${siteUrl}/logo.png`; `:54` `image: logo`; `:51` `publisher.logo.url: logo`. Canlı `/blog/dugun-dj-mi-canli-muzik-mi` JSON-LD: `"image":"https://ankaradjparty.com/logo.png"` ve og:image/twitter:image de aynı (1024x325 wordmark, oran 3.15). `og:image:width/height=1200x630` beyanı gerçek dosyayla uyuşmuyor → bozuk sosyal kart. `blogPosts.js`'te 3 yazının hiçbirinde `image` alanı yok; JSON-LD görseli `post.image`'i tamamen bypass ediyor. (Not: image Google Article için zorunlu değil, önerilen alan — yazı yine uygun kalır, sadece büyük görsel önizlemesi çıkmaz. `publisher.logo`=logo şema açısından doğru.)
- **Düzeltme:** `blogPosts` verisine yazı başına gerçek kapak görseli (≥1200px genişlik, telifli) ekle; `BlogPosting.image` + og:image bunu göstersin (JSON-LD ve metadata'nın her iki yerine de dokun). Logo asla article `image` olarak kullanılmasın; `publisher.logo`'yu ankaradj marka logosuna çevir (P1-1 ile birlikte).
- **Kabul kriteri:** Rich Results Test yazıyı geçerli Article + temsili görselle gösterir; her yazının og:image'i kendine özgü.
- **Doğrulama:** `curl -s https://ankaradjparty.com/blog/dugun-dj-mi-canli-muzik-mi | grep -o '"image":"[^"]*"'`
- **Durum:** [ ]

## P2-9 · DJ profil sayfaları /djs listeleme şemasını miras alıyor (2x BreadcrumbList + 2x FAQPage + CollectionPage/ItemList sızması)
- **Kanıt:** `src/app/djs/layout.jsx:137-152` `buildDjsSchema` (@graph: CollectionPage `/djs#collection` + ItemList `/djs#dj-services` + FAQPage `/djs#faq` + BreadcrumbList) tüm `/djs/*` rotalarına, `[slugOrId]` dahil, koşulsuz basılıyor. `[slugOrId]/layout.jsx:228` ve `:238` kendi BreadcrumbList + FAQPage'ini ekliyor. Canlı `/djs/68e9534d1d13ec636ca41d1c`: iki çelişen BreadcrumbList (biri `/djs`'de biter, biri DJ'de), iki FAQPage (`.../djs#faq` VE `.../djs/{id}#faq`), ayrıca listelemeye ait CollectionPage/ItemList profil sayfasına sızmış.
- **Düzeltme:** `buildDjsSchema` çıktısını `djs/layout.jsx`'ten `djs/page.jsx`'e (yalnız index) taşı; böylece `/djs/[slugOrId]` sadece ProfilePage/Service/BreadcrumbList/FAQPage üretir.
- **Kabul kriteri:** DJ profil URL'inde tam olarak 1 BreadcrumbList ve 1 FAQPage; CollectionPage/ItemList yok.
- **Doğrulama:** `curl -s https://ankaradjparty.com/djs/68e9534d1d13ec636ca41d1c | grep -o '"@type":"BreadcrumbList"' | wc -l`
- **Durum:** [ ]

## P2-10 · Hizmet landing sayfaları #organization'ı @id ile bağlanmamış ikinci ProfessionalService varlığıyla tekrarlıyor
- **Kanıt:** `src/components/shared/ServiceLandingPage.jsx:159-184` `serviceSchema`'yı `@type: ProfessionalService` olarak, @id OLMADAN, kendi provider Organization + address + contactPoint + priceRange ile üretiyor. Canlı `/dugun-dj-ankara`: block0 `["LocalBusiness","ProfessionalService"]` @id `#organization` VE block3 ayrı ProfessionalService 'Ankara Düğün DJ' (@id yok, kendi provider adresi/telefonu). Aynı işletmeyi tanımlayan iki iş-tipi varlık @id ile bağlanmamış.
- **Düzeltme:** `serviceSchema` `@type`'ı `ProfessionalService` yerine `Service` yap; tekrar eden provider address/contactPoint'i kaldır, `provider:{"@id":"${siteUrl}/#organization"}` ile bağla; `offers` korunur. Sayfada tek iş varlığı (#organization) + ona bağlı Service kalsın.
- **Kabul kriteri:** Her hizmet sayfasında tek ProfessionalService/LocalBusiness (#organization); hizmet Service olarak ona @id ile bağlı.
- **Doğrulama:** `curl -s https://ankaradjparty.com/dugun-dj-ankara | grep -o '"@type":"ProfessionalService"' | wc -l`
- **Durum:** [ ]

## P2-11 · DJ Service/Offer şemasında aggregateRating yok — YALNIZ gerçek görünür puanla eklenmeli (sahte = ceza)
- **Kanıt:** `src/app/djs/[slugOrId]/layout.jsx:186-226` Service+Offer node'u `aggregateRating` içermiyor. Puan kaynağı `src/components/optimized/DJCard.jsx:28-29` (`dj.averageRating || 0`, `dj.totalReviews || 0`); yıldız yalnız `(rating>0 || totalReviews>0)` iken gösterilir. Canlı: 3 sitemap DJ'inde `averageRating`/`totalReviews` alanları yok → şu an GERÇEK puan yok. `grep aggregateRating src/` boş → hiç sahte puan yok (iyi). Fırsat koşulludur.
- **Düzeltme:** SADECE `dj.averageRating>0` VE `dj.totalReviews>0` olduğunda (kartta zaten gösterilen aynı gerçek veri) Service şemasına `aggregateRating {"@type":"AggregateRating", ratingValue: dj.averageRating, reviewCount: dj.totalReviews}` ekle; aksi halde tamamen çıkar. Puanı ASLA hardcode/tahmin etme — sayfada görünür karşılığı olmayan uydurma puan Google structured data politikası ihlali ve manuel ceza riskidir.
- **Kabul kriteri:** Gerçek yorumu olan DJ'lerde aggregateRating on-page yıldız değeriyle birebir eşleşir; puansız DJ'lerde hiç rating markup'ı çıkmaz.
- **Doğrulama:** Puanlı bir DJ için: `curl -s <dj-url> | grep -o 'aggregateRating'`; ratingValue sayfadaki yıldızla aynı olmalı.
- **Durum:** [ ]

## P2-12 · Hash'li immutable statik varlıklar yalnız `max-age=60` ile serve ediliyor (immutable cache kaybı)
- **Kanıt:** İçerik-hash'li `/_next/static/` varlıkları (css/js/woff2) `public, max-age=60, s-maxage=1800` alıyor (canlı, `via: 1.1 Caddy`, `cf-cache-status: REVALIDATED`); 1 yıllık immutable değil. `/og/*.png`, `/favicon.ico`, `/site.webmanifest` de `max-age=60`. `next.config.mjs:77-82` immutable kuralını yalnız `/static/:path*` için tanımlıyor ama Next varlıkları `/_next/static/` altında → kural HİÇ eşleşmiyor; ayrıca Caddy edge blanket override zaten ezerdi. (Etki mütevazı: HTML TTFB etkilenmez; ETag mevcut → tekrar ziyaret ucuz 304 döner; CF edge 30dk cache'liyor. Asıl kayıp tekrar ziyaret/SPA prefetch'te 60sn'de bir koşullu round-trip.)
- **Düzeltme:** (a) Caddy/Cloudflare blanket `Cache-Control: public, max-age=60, s-maxage=1800` kuralını `/_next/static/*`, gerçek `/brand/*`, `/og/*` için hariç tut; bu path'lere `public, max-age=31536000, immutable` (hash'siz brand/og için ör. `max-age=604800`) uygula. (b) `next.config.mjs` `headers()` içindeki yanlış `/static/:path*` kuralını `/_next/static/:path*` olarak düzelt (asıl fix edge katmanı).
- **Kabul kriteri:** `curl -D- .../_next/static/css/<hash>.css` ve `.../media/<hash>.woff2` → `cache-control: public, max-age=31536000, immutable`.
- **Doğrulama:** `for u in /_next/static/css/5d6e6de44d620505.css /_next/static/media/22a5144ee8d83bca-s.p.woff2; do curl -s -m10 -D- -o/dev/null https://ankaradjparty.com$u | grep -i '^cache-control'; done`
- **Durum:** [ ]

## P2-13 · Servis landing sayfaları jenerik ~460KB OG kullanıyor; Ankara-markalı OG'ler mevcut ama atıl
- **Kanıt:** Canlı `/ankara-dj-kiralama`: `og:image = /og/dj-kiralama.png` → 470877 bayt (460KB), Ankara markasız jenerik. `/dugun-dj-ankara` de `/og/dugun-dj.png` (469900b). Markalı OG'ler atıl ve küçük: `/brand/ankaradjparty/og/dugun-dj-ankara.png` (83805b), `ankara-dj-hizmeti.png` (86902b); set tutarsız: `dj-kiralama-ankara.png` → 404. Anasayfa + `/djs` markalı `ankara-dj-hizmeti.png` kullanırken 16 servis sayfası jenerik `/og/*.png` kullanıyor. Kök neden: `servicePageMetadata.js:39-43` `resolveImage` sadece siteUrl prefix'liyor, `brand.id==='ankaradjparty'` için markalı yola map YOK.
- **Düzeltme:** `createServiceMetadata`'da `brand.id==='ankaradjparty'` iken og:image'i markalı `/brand/ankaradjparty/og/*-ankara.png` setine map et. Eksik markalı görselleri (`dj-kiralama-ankara.png` vb.) üret; hepsi 1200x630 ve <150KB (TinyPNG/pngquant). NOT: aggregateRating/Review ile ilgisi yok — yalnız görsel kart.
- **Kabul kriteri:** `curl /ankara-dj-kiralama` og:image → markalı `/brand/ankaradjparty/og/…-ankara.png` (200, 1200x630, <150KB); tüm servis landing'leri markalı OG döner.
- **Doğrulama:** `curl -s -m12 https://ankaradjparty.com/ankara-dj-kiralama | grep -io '<meta property="og:image"[^>]*>'`
- **Durum:** [ ]

## P2-14 · Preconnect yanlış origin'e; ekran-üstü DJ görsellerinin origin'i (api.ankaradjparty.com) preconnect'siz
- **Kanıt:** Canlı home + DJ sayfasında tek API preconnect'i `<link rel="preconnect" href="https://api.hangises.com">` (`layout.jsx:363`, `apiOrigin` = brand.apiUrl). Ancak ekran-üstü DJ kart/hero görselleri (LCP adayı, server-rendered) `https://api.ankaradjparty.com/uploads/djs/dj-*.webp|jpg|jpeg` origin'inden geliyor; bu origin için ne preconnect ne dns-prefetch var → ilk görsel baytından önce soğuk DNS+TCP+TLS (~3 RTT) mobilde LCP'yi geciktiriyor. `layout.jsx:363-366` `api.ankaradjparty.com` preconnect'i yalnız `!isAnkaradj` altında → koşul fiilen ters. Preconnect edilen `api.hangises.com` bu sayfalarda görsel serve etmiyor.
- **Düzeltme:** `layout.jsx` head'ine ankaradj brand'da `<link rel="preconnect" href="https://api.ankaradjparty.com" crossOrigin="anonymous" />` ekle (koşulu düzelt). Ek olarak ilk DJ hero görseline `priority`/preload düşün.
- **Kabul kriteri:** Ankaradj sayfalarının `<head>`'inde `api.ankaradjparty.com` için `rel=preconnect` var; ilk DJ görseli için ayrı bağlantı-kurulum gecikmesi kalkar.
- **Doğrulama:** `curl -s -m12 https://ankaradjparty.com/ | grep -io '<link[^>]*preconnect[^>]*>'; curl -s https://ankaradjparty.com/ | grep -oE 'api\.ankaradjparty\.com/uploads[^" ]*' | head -3`
- **Durum:** [ ]

## P2-15 · Image optimizasyonu tamamen kapalı (passthrough loader) — webp/avif ve responsive resize yok
- **Kanıt:** `src/lib/imageLoader.js:13-23` custom loader src'yi olduğu gibi döndürüyor (width/quality atılıyor); `_next/image` proxy kapalı → `curl _next/image?url=…&w=256&q=75` → HTTP 404. Gerçek DJ görseli 1080x1080 image/jpeg, 189059 bayt; `Accept: image/avif,image/webp` gönderilse bile hâlâ image/jpeg (içerik-müzakere yok, `cf-polished` header yok → Polish kapalı). `next.config.mjs:19-23` `loader:'custom'` olduğu için `formats:['image/avif','image/webp']` + deviceSizes/imageSizes ölü config. Home'da format karışık: `.webp(29798B)+.jpg(189059B)+.jpeg(236055B)`. Mobilde 150px thumbnail için 1080px/189KB iniyor.
- **Düzeltme:** Cloudflare Image Resizing veya Polish (WebP/AVIF auto) aktive et (`imageLoader.js` yorumunda zaten planlı); ardından loader'ı `/cdn-cgi/image/` transform URL'i üretecek şekilde güncelle (width+format=auto+quality). Böylece `next.config` formats gerçekten devreye girer. Backend upload pipeline'ında tek format (webp) normalize et.
- **Kabul kriteri:** DJ görseli `Accept: image/webp` ile image/webp döner; mobil deviceSize'da ~640px varyant iner; boyut ~%40-60 düşer.
- **Doğrulama:** `curl -s -m12 -o/dev/null -w '%{content_type} %{size_download}\n' -H 'Accept: image/avif,image/webp,image/*' https://api.ankaradjparty.com/uploads/djs/dj-1760121720464-67174515.jpg`
- **Durum:** [ ]

## P2-16 · COEP credentialless var ama COOP/CORP yok — cross-origin izolasyon tamamlanmamış
- **Kanıt:** Canlı header'lar A+ (HSTS, CSP nonce+strict-dynamic+`frame-ancestors 'none'`, X-Frame-Options DENY, nosniff, Referrer-/Permissions-Policy, `poweredByHeader` off). Ancak `cross-origin-embedder-policy: credentialless` SET halde `Cross-Origin-Opener-Policy` ve `Cross-Origin-Resource-Policy` YOK (`next.config.mjs:67` yalnız COEP ekliyor). COEP tek başına (COOP olmadan) `crossOriginIsolated` sağlamaz; getirisi büyük ölçüde etkisiz. NOT: SEO sıralamasına etkisi yok; clickjacking zaten XFO+frame-ancestors ile kapalı — bu bir defense-in-depth (tab-nabbing/XS-leak sertleştirme) kalemi, aktif açık değil. Fiili P3 seviyesi.
- **Düzeltme:** `next.config.mjs` `headers()` içine ekle: `{ key:'Cross-Origin-Opener-Policy', value:'same-origin-allow-popups' }` (Google OAuth popup'ı kırmamak için düz `same-origin` DEĞİL) ve `{ key:'Cross-Origin-Resource-Policy', value:'same-origin' }`. OAuth akışını test et; sorun çıkarsa COOP'u yalnız `/login` rotasında gevşet.
- **Kabul kriteri:** `curl -D- /` → `cross-origin-opener-policy: same-origin-allow-popups` ve `cross-origin-resource-policy: same-origin`; Google OAuth login çalışır.
- **Doğrulama:** `curl -s -m12 -D- -o/dev/null https://ankaradjparty.com/ | grep -iE 'cross-origin-(opener|resource|embedder)-policy'`
- **Durum:** [ ]

## P2-17 · Ana LocalBusiness entity logosu marka logosu değil, kök `/logo.png` (node'lar arası tutarsız)
- **Kanıt:** Canlı home `#organization`: `"logo":"https://ankaradjparty.com/logo.png"` (`layout.jsx:225` hardcoded); servis provider node'u ise `.../brand/ankaradjparty/logo.png` veriyor (`ServiceLandingPage.jsx:141,165`). İki farklı dosya: `/logo.png` = 1024x325 (23322B) vs `/brand/ankaradjparty/logo.png` = 198x120 (2166B). `brand.logoUrl` (`config.js:117`) tanımlı ama layout'ta kullanılmıyor. NOT: her iki görsel de geçerli marka asset'i; asıl doğru yön iki node'u BÜYÜK (1024px) asset'te birleştirmek (Knowledge Panel için daha iyi). Bu P1-1'in tutarlılık ayağı.
- **Düzeltme:** Tüm JSON-LD node'larını tek, yüksek çözünürlüklü ankaradj logosunda birleştir. P1-1 ile birlikte `layout.jsx:225` `#organization.logo`'yu marka-bilinçli değere çek ve servis provider node'uyla aynı URL'i kullan.
- **Kabul kriteri:** Home `#organization` schema logo == servis provider node logo; tüm JSON-LD node'larında logo URL'i aynı.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/ | grep -o '"logo":"[^"]*"'`
- **Durum:** [ ]

## P2-18 · Servis sayfalarında provider, #organization'a @id ile bağlanmayan ikinci işletme entity'si yaratıyor
- **Kanıt:** Canlı `/dugun-dj-ankara` iki 'Ankara DJ Party' node'u: (1) kök `#organization` = @id'li `["LocalBusiness","ProfessionalService"]`, tam streetAddress + geo (39.977477, 32.6177454); (2) `ProfessionalService.provider` = @id'siz inline Organization (`ServiceLandingPage.jsx:137-158`), sadece addressLocality/Region/Country, streetAddress/postalCode/geo YOK. Karşılaştırma: `src/app/djs/layout.jsx:111` DOĞRU şekilde `provider: { '@id': ${SITE}/#organization }` kullanıyor. Bu bileşeni kullanan ~9 servis sayfasını etkiliyor (dj-hizmeti, dugun-dj, parti-dj, kurumsal-etkinlik-dj, etkinlik-dj, dj-setup-kiralama, ses-sistemi-kiralama, kina-dj, dj-kiralama).
- **Düzeltme:** `provider`'ı `{ "@id": ${siteUrl}/#organization }` referansına indir (`djs/layout.jsx` deseniyle aynı); tek yerel işletme node'unda konsolide olsun. (P2-10 ile aynı fix.)
- **Kabul kriteri:** Servis sayfası provider'ı `#organization` @id'sine referans veriyor; sitede tek LocalBusiness/Organization entity'si.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/dugun-dj-ankara | grep -o '"provider":{[^}]*}' | head`
- **Durum:** [ ]

## P2-19 · sameAs zayıf: yalnız kurucunun kişisel IG'si; Google Business Profile/marka sosyal profili yok
- **Kanıt:** Canlı home: hem `#organization` (LocalBusiness) hem `#dj-dionys` (Person) node'unda `"sameAs":["https://www.instagram.com/dj_dionys/"]` (`layout.jsx:192-195,231-238`; `NEXT_PUBLIC_SOCIAL_URLS` boş → founder IG fallback). `hasMap` (`maps.app.goo.gl/W8JoNGoKq6z2tf9c7`) var ama place URL sameAs'ta değil; marka IG/FB/YouTube veya GBP linki yok → entity↔GBP bağı zayıf. Kod defekti yok, tamamen operasyonel.
- **Düzeltme:** `NEXT_PUBLIC_SOCIAL_URLS` env'ine GERÇEK ve SAHİPLİ profilleri gir: Google Business Profile / Maps place URL + marka Instagram/Facebook/YouTube. Sahte veya sahip olunmayan profil EKLEME (yanlış entity bağı riski). Env dolunca layout founder fallback yerine bunları kullanır.
- **Kabul kriteri:** sameAs GBP/Maps place + en az bir doğrulanmış marka sosyal profili içeriyor; tümü gerçek ve markaya ait.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/ | grep -o '"sameAs":\[[^]]*\]'`
- **Durum:** [ ]

## P2-20 · İlçe/şehir-hub landing sayfaları yok — areaServed 9 ilçeyi hedefliyor ama indexlenebilir ilçe sayfası sıfır
- **Kanıt:** Schema `areaServed` 9 Ankara ilçesi (Çankaya, Keçiören, Yenimahalle, Etimesgut, Mamak, Sincan, Pursaklar, Altındağ, Gölbaşı) + FAQ 'Ankara'nın hangi ilçelerine DJ geliyor?' (`layout.jsx:210-222`, `faqs-data.js:65-66`). Ancak sitemap 30 URL'nin tümü konu-bazlı (`-ankara`); ilçe sayfası yok (`STATIC_ROUTES`, `src/app/sitemap.xml/route.js:20-45`). Canlı probe: `/cankaya-dj`, `/cankaya-dj-kiralama`, `/dj-kiralama-cankaya`, `/kecioren-dj`, `/eryaman-dj` → hepsi HTTP 404. (Not: areaServed listelemek + sayfa olmaması ceza değil; bu bir içerik fırsatı, teknik çakışma değil — özgün içerik gerektirir, hızlı kod değişikliği değil.)
- **Düzeltme:** Yüksek hacimli ilçeler (Çankaya, Keçiören, Yenimahalle) için özgün içerikli hub landing'ler oluştur (ör. `/cankaya-dj-kiralama`): ilçeye özel mekan/salon örnekleri, `areaServed`=ilçe, iç linkler. Thin/kopya içerik olmasın; `STATIC_ROUTES` + canonical eşlemesine ekle.
- **Kabul kriteri:** En az 3 ilçe için özgün, indexlenebilir landing sitemap'te; her biri kendi `areaServed` ilçesi ve tekil canonical'a sahip.
- **Doğrulama:** `curl -s https://ankaradjparty.com/sitemap.xml | grep -Eic 'cankaya|kecioren|yenimahalle'`
- **Durum:** [ ]

## P2-21 · PostalAddress'te postalCode eksik (GBP/NAP tamlığı)
- **Kanıt:** Hem root `#organization` (`layout.jsx:253-261`) hem servis provider (`src/components/shared/ServiceLandingPage.jsx:143-148`) PostalAddress'inde `postalCode` yok. Canlı: `{"@type":"PostalAddress","streetAddress":"Eryaman 1-2, Göksu Mah., Selçuklular Cd.","addressLocality":"Etimesgut","addressRegion":"Ankara","addressCountry":"TR"}`. `grep -rn postalCode src/` → 0 sonuç.
- **Düzeltme:** PostalAddress'e gerçek `postalCode` ekle (GBP kaydındaki koda birebir eşit); `layout.jsx` ve `ServiceLandingPage.jsx` adres bloklarının ikisine de uygula. Uydurma kod kullanma (ör. 06797 tahmin — GBP'deki değeri esas al).
- **Kabul kriteri:** Tüm PostalAddress node'ları `postalCode` içeriyor ve GBP'deki değerle birebir aynı.
- **Doğrulama:** `curl -s -L https://ankaradjparty.com/ | grep -o '"postalCode":"[^"]*"'`
- **Durum:** [ ]
