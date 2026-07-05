# BK Organizasyon (Burcuevent) — burcuevent.tr

Statik HTML / Caddy · Repo: `ihsanyurekli0-cpu/burcuevent` (GitHub PRIVATE, uzak yedekli, default `master`; `bkorganizasyon.com.tr` alias). Genel değerlendirme: 🟡 Temel SEO hijyeni sağlam (canonical, sitemap, güvenlik header'ları, temiz redirect'ler, JSON-LD, sahte-puan yok); yalnızca düşük öncelikli (P2) cila ve fırsat maddeleri açık — kritik (P0/P1) bulgu yok.

## Canlı doğrulama (2026-07-04)
- **Canonical:** `/index.html` gövdesindeki canonical doğru şekilde köke işaret ediyor (`https://burcuevent.tr/`); sitemap yalnız kökü listeliyor (kopya sunucu 301'i yok, ama sinyal doğru).
- **Sitemap:** 9 URL; `robots.txt` tek bu sitemap'i işaret ediyor, `sitemap_index.xml` = 404 (gizli ikinci sitemap yok).
- **JSON-LD @type'lar:** EventPlanner (LocalBusiness), Service, FAQPage, BreadcrumbList, Article, Organization, ImageObject — geçerli ve zengin; sahte aggregateRating/Review YOK (güvenli/doğru durum).
- **Güvenlik header'ları:** HSTS (max-age=63072000; includeSubDomains; preload), X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy MEVCUT (yalnız CSP eksik).
- **Redirect'ler:** Ana alan yönlendirmeleri doğru; nihai hedef her zaman `https://burcuevent.tr/` (200). http non-www, https www tek atlama; yalnız `http://www` 2 atlama.
- **Cache:** CSS (`?v=` sürümlü) ve görseller `public, max-age=31536000, immutable`; yalnız iki JS dosyası header'sız.
- **Server:** Caddy (HTTP/2). Adres/telefon şeması gerçek (İncek Mah., Gölbaşı/Ankara · +905413001238).

---

## P2-1 · /index.html kök ile byte-byte özdeş 200 kopyası (sunucuda 301 yok)
- **Kanıt:** `curl … /index.html` => HTTP/2 **200**, 0 yönlendirme; kök ile byte-byte özdeş (her ikisi content-length 21744, aynı etag `djpsl6gbod8ggs0`, `cmp` = IDENTICAL BYTES). Kopya yalnızca canonical ile konsolide ediliyor; sitemap'te `/index.html` yok (doğru).
- **Düzeltme:** Caddy'de `redir /index.html / permanent` (301) ekle. Canonical'ı yedek sinyal olarak koru. Sitemap'i değiştirme. Böylece taranan yinelenen URL kaynakta elenir, canonical bağımlılığı azalır.
- **Kabul kriteri:** `/index.html` isteği 301 (Location: `https://burcuevent.tr/`) döndürür; artık 200 gövde sunmaz.
- **Doğrulama:** `curl -s -m 12 -o /dev/null -w '%{http_code} -> %{redirect_url}\n' https://burcuevent.tr/index.html`
- **Durum:** [ ]

## P2-2 · Sitemap lastmod tüm 9 URL'de aynı ve deploy tarihine (bugün) eşit
- **Kanıt:** `sitemap.xml`'deki 9 URL'in tamamı `<lastmod>2026-07-04</lastmod>` (bugün) ve kök/altsayfa `last-modified` header'ı `Sat, 04 Jul 2026 12:40:10 GMT` ile aynı — hatta `sitemap.xml` ile `hakkimizda.html` saniye-hassasiyetinde özdeş last-modified döndürüyor: her deploy tüm dosyaları build zamanıyla damgalıyor. `changefreq=monthly` ile çelişiyor.
- **Düzeltme:** lastmod'u sayfa-başına gerçek içerik değişiklik tarihiyle üret (ör. dosyanın git commit tarihi). Değişmeyen sayfalar deploy sonrası eski lastmod'unu korumalı; üreticiyi her build'de tüm tarihleri today'e set etmekten çıkar.
- **Kabul kriteri:** lastmod değerleri sayfalar arasında farklılaşır ve gerçek düzenleme tarihini yansıtır; içeriği değişmeyen URL'lerin lastmod'u bir deploy sonrası değişmez.
- **Doğrulama:** `curl -s -m 15 https://burcuevent.tr/sitemap.xml | grep -o '<lastmod>[^<]*' | sort | uniq -c`
- **Durum:** [ ]

## P2-3 · http://www.burcuevent.tr 2 atlamalık zincirle çözülüyor (tek atlama olmalı)
- **Kanıt:** `http://www` => 308 `https://www` => 308 `https://burcuevent.tr/` (200); `-L` ile num_redirects=**2**. Diğer 3 giriş noktası zaten tek atlama/direkt. HSTS preload mevcut olduğundan etki marjinal (gerçek tarayıcılar http atlamasını atlar), ama fazladan hop yalnız bu edge case'de.
- **Düzeltme:** Caddy'de www + http'yi tek kuralda doğrudan kanonik hedefe yönlendir: `redir https://burcuevent.tr{uri} permanent` ile ara `https://www` adımını ele.
- **Kabul kriteri:** `http://www.burcuevent.tr/` tek atlamada (num_redirects=1) doğrudan `https://burcuevent.tr/` adresine ulaşır.
- **Doğrulama:** `curl -s -m 12 -o /dev/null -w '%{num_redirects} hops -> %{url_effective}\n' -L http://www.burcuevent.tr/`
- **Durum:** [ ]

## P2-4 · Ana sayfa H1'i yalnızca marka; hedef anahtar kelime H1'de yok
- **Kanıt:** Tek H1 yalnız markayı taşıyor: `<h1><span class="hzm-wordmark">BK <span>Organizasyon</span><sup>®</sup></span></h1>`. Birincil yerel anahtar (Ankara Düğün/Kına/DJ Organizasyon) hiçbir başlıkta geçmiyor; yalnız `<title>`'da ve hero `<p class="hzm-hero-brandline">`'de var. Alt sayfalar H1'de core keyword taşırken ana sayfa bunu wordmark'a harcıyor.
- **Düzeltme:** H1'i anahtar kelime içerecek şekilde yaz (ör. `<h1>Ankara Düğün, Kına & DJ Organizasyon Şirketi</h1>`); marka wordmark'ı (BK Organizasyon®) H1 içinde ikincil `<span>` veya H1 altında dekoratif öge olarak kalabilir. Doldurma yapma; tek doğal cümle yeterli.
- **Kabul kriteri:** Sayfada tam 1 H1 var ve görünür metni `Ankara` + (`düğün`/`organizasyon`) anahtarını içeriyor; marka adı ikincil konuma alınmış.
- **Doğrulama:** `curl -s -m 15 https://burcuevent.tr/ | grep -io '<h1[^>]*>.*</h1>' | sed 's/<[^>]*>//g'`
- **Durum:** [ ]

## P2-5 · Meta description çok uzun (kina-gecesi, hizmetlerimiz) — SERP'te kesilir
- **Kanıt:** Gerçek Unicode karakter sayısı (Türkçe çok-baytlı harfler byte sayımını ~%10-13 şişiriyor): **kina-gecesi.html = 201 char**, **hizmetlerimiz.html = 175 char** — ikisi de ~155 eşiğinin üstünde, `…` ile kesilip CTA görünmez oluyor. Ana sayfa = 156 (sınırda). `dugun-organizasyonu=148`, `hakkimizda=153` düzeltmeye gerek YOK; `bekarliga-veda` = 404 (mevcut değil).
- **Düzeltme:** kina-gecesi (201) ve hizmetlerimiz (175) açıklamalarını ≤155 karaktere indir, anahtar kelime + CTA'yı ilk 150 karaktere yerleştir. kina-gecesi'nin canlıda mevcut 118 karakterlik `og:description`'ı şablon olarak kullanılabilir.
- **Kabul kriteri:** kina-gecesi ve hizmetlerimiz meta description ≤155 karakter; kesilme yaşayan (>160) sayfa kalmadı.
- **Doğrulama:** `for p in kina-gecesi.html hizmetlerimiz.html; do echo -n "$p: "; curl -s -m 15 "https://burcuevent.tr/$p" | grep -io 'name="description"[^>]*content="[^"]*"' | sed 's/.*content="//;s/"$//' | python3 -c 'import sys;print(len(sys.stdin.read().strip()))'; done`
- **Durum:** [ ]

## P2-6 · kina-gecesi.html <title>'ında marka + 'Ankara' yok; og:title ile tutarsız
- **Kanıt:** `<title>Kına Gecesi — Töre, Zarafet ve Mum Işığı</title>` (marka YOK, Ankara YOK). Aynı sayfanın `og:title`'ı `… | Burcuevent` içeriyor → title/og:title tutarsız. Diğer 8 sayfanın hepsi `| Burcuevent` veya `| Burcuevent Ankara` kalıbıyla bitiyor; yalnız bu sayfa kalıp dışı.
- **Düzeltme:** `<title>`'ı og:title ile hizala: `Kına Gecesi — Töre, Zarafet ve Mum Işığı | Burcuevent Ankara` (≤60 char). Hem marka görünürlüğü hem "Ankara kına gecesi" yerel sinyali kazanılır, site geneli kalıp tutarlı olur.
- **Kabul kriteri:** `<title>` `| Burcuevent` ekini içeriyor, `Ankara` geçiyor ve og:title ile birebir aynı; uzunluk ≤60 karakter.
- **Doğrulama:** `curl -s -m 15 https://burcuevent.tr/kina-gecesi.html | grep -io '<title>[^<]*</title>'; curl -s -m 15 https://burcuevent.tr/kina-gecesi.html | grep -io 'property="og:title"[^>]*content="[^"]*"'`
- **Durum:** [ ]

## P2-7 · EventPlanner/LocalBusiness'te aggregateRating/Review yok — yıldız fırsatı (YALNIZ gerçek puanla)
- **Kanıt:** 9/9 sayfada aggregateRating=0, ratingValue=0, reviewCount=0, "Review"=0. Homepage EventPlanner bloğu name/address/telephone/openingHours/sameAs içeriyor, puan alanı yok. Sitede görünür gerçek yıldız/puan bölümü de yok. Site şu an DOĞRU ve güvenli (sahte puan yok) — bu bir hata değil, gerçekleşmemiş rich-result fırsatı.
- **Düzeltme:** Google Business Profile'da GERÇEK, görünür müşteri yorumları biriktikçe EventPlanner'a ratingValue+reviewCount (GBP'deki gerçek değerlerle) ya da tek tek Review düğümleri eklenir. **UYARI: yalnız gerçek görünür puanla ekle; uydurma/kendi-koyduğun puan Google politikası ihlalidir — manuel işlem ve rich-result kaybı riski taşır. Asla sahte veri girme.**
- **Kabul kriteri:** Yalnızca doğrulanabilir gerçek yorumlar mevcutken aggregateRating eklenmiş; ratingValue/reviewCount GBP ile birebir; Rich Results Test 'Review snippet' geçerli.
- **Doğrulama:** `curl -s https://burcuevent.tr/ | grep -o 'aggregateRating'  # eklendikten sonra Rich Results Test ile doğrula`
- **Durum:** [ ]

## P2-8 · EventPlanner'da geo koordinatı ve hasMap yok — yerel harita/rich sinyali eksik
- **Kanıt:** 9/9 sayfada `"geo"`=0, `hasMap`=0. EventPlanner bloğunda address/telephone/priceRange/openingHoursSpecification var ama GeoCoordinates (lat/long) ve hasMap yok. Adres İncek/Gölbaşı Ankara — fiziksel konum gerçek, koordinat eklenebilir.
- **Düzeltme:** EventPlanner'a `"geo":{"@type":"GeoCoordinates","latitude":<gerçek>,"longitude":<gerçek>}` ve `"hasMap":"<Google Maps yer URL'si>"` ekle. Koordinatları işletmenin gerçek Google Maps pininden al (uydurma).
- **Kabul kriteri:** Blokta geçerli GeoCoordinates + hasMap; Rich Results Test 'Local Business' uyarısız; koordinat gerçek adresle örtüşüyor.
- **Doğrulama:** `curl -s https://burcuevent.tr/hakkimizda.html | grep -o '"geo"\|hasMap'`
- **Durum:** [ ]

## P2-9 · kina-gecesi.html Article'da datePublished/dateModified yok — tazelik sinyali kaybı
- **Kanıt:** Article bloğu (block 0) headline/description/image/author(Organization)/publisher/mainEntityOfPage içeriyor; ANCAK `datePublished`/`dateModified` yok (JSON-LD parse ile teyit). Google Article dokümantasyonu datePublished'ı önerilen alan olarak listeler (zorunlu değil).
- **Düzeltme:** Article'a ISO 8601 `"datePublished":"YYYY-MM-DD"` ve `"dateModified":"YYYY-MM-DD"` (gerçek yayın/güncelleme tarihleri) ekle; opsiyonel `author.url` eklenebilir.
- **Kabul kriteri:** Article bloğunda geçerli datePublished + dateModified; Rich Results Test 'Article' uyarısız; tarihler gerçek.
- **Doğrulama:** `curl -s https://burcuevent.tr/kina-gecesi.html | grep -o 'datePublished\|dateModified'`
- **Durum:** [ ]

## P2-10 · Varlık grafiği @id ile birleştirilmemiş — provider/author/publisher parçalı entity
- **Kanıt:** 9/9 sayfada `@id`=0. Service.provider yalın stub (`{"@type":"EventPlanner","name":"Burcuevent","telephone":"+905413001238"}`); kina-gecesi author ve publisher ayrı ayrı Organization; ana EventPlanner her sayfada address/sameAs ile tam ama kimliksiz tekrarlanıyor. Google bunları ayrı varlıklar olarak görebilir.
- **Düzeltme:** Ana işletmeye sabit `"@id":"https://burcuevent.tr/#organization"` ver, EventPlanner'ı bir kez tam tanımla; diğer tüm Service.provider / Article.author / Article.publisher düğümlerinde `{"@id":"https://burcuevent.tr/#organization"}` referansı kullan. Böylece sameAs/adres/logo tek kanonik varlıkta toplanır.
- **Kabul kriteri:** Provider/author/publisher düğümleri @id ile ana EventPlanner'a referans veriyor; Rich Results Test hatasız; validator'da tek birleşik işletme varlığı görünüyor.
- **Doğrulama:** `curl -s https://burcuevent.tr/dugun-organizasyonu.html | grep -o '#organization\|"@id"'`
- **Durum:** [ ]

## P2-11 · Content-Security-Policy response header eksik (diğer tüm güvenlik header'ları var)
- **Kanıt:** `curl -D -` çıktısında HSTS, X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy MEVCUT; ancak `content-security-policy` YOK. Sayfa harici GTM (`gtag/js?id=G-XXBY3BW5WY`), inline gtag script ve 2× `onload=` inline handler kullanıyor — CSP savunma katmanı değerli.
- **Düzeltme:** Caddy header bloğuna temel CSP ekle (ör. `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests`). Önce Report-Only ile test et, sonra enforce'a al.
- **Kabul kriteri:** `curl -sI` çıktısında content-security-policy satırı görünür ve GTM/fontlar bloklanmadan sayfa render olur (konsolda CSP violation yok).
- **Doğrulama:** `curl -s -m 15 -D - -o /dev/null https://burcuevent.tr/ | grep -i content-security-policy`
- **Durum:** [ ]

## P2-12 · og:image / twitter:image sosyal kart oranı hatalı (1200x630 değil) — paylaşımda kırpılıyor
- **Kanıt:** Ana sayfa `og:image`=Giris.jpeg = **1920x709** (2.71:1, 144KB); alt sayfa (dugun-organizasyonu) Davet.jpeg = **900x504** (1.79:1, 68KB). İki sayfada da `twitter:card=summary_large_image` (1.91:1 / 1200x630 ister). `og:image:width/height` meta yok, özel marka kartı yok — hero fotoğrafları yeniden kullanılmış → FB/WhatsApp/X önizlemede kırpılıyor; alt sayfa 1200px altında (düşük çözünürlük).
- **Düzeltme:** Her şablon için 1200x630 (veya 1200x628), <100KB, marka logolu özel OG kartı üret; og:image ve twitter:image'ı buna işaret ettir; `og:image:width=1200` + `og:image:height=630` meta'larını ekle. **UYARI: içine sahte puan/yıldız bindirme.**
- **Kabul kriteri:** og:image 1200x630 (±oran 1.91:1) görseli işaret eder; opengraph.xyz / X Card Validator önizlemede kırpma olmadan tam kart gösterir.
- **Doğrulama:** `curl -s https://burcuevent.tr/ | grep -io 'og:image[^>]*'; curl -s -o /tmp/og.jpg https://burcuevent.tr/assets/images/<yeni-kart>.jpg && python3 -c "from PIL import Image;print(Image.open('/tmp/og.jpg').size)"`
- **Durum:** [ ]

## P2-13 · Görseller yalnız JPEG/JPG — WebP/AVIF yok; LCP hero'su modern formatta değil
- **Kanıt:** LCP hero `/assets/images/Giris.jpeg` preload+`fetchpriority=high` ile yükleniyor (content-type image/jpeg, 144679 byte, 1920px). HTML'de `<picture>`/`<source type=image/*>` yok (0). Dört görsel de eski format (Giris.jpeg, Davet.jpeg, kina.jpg, DJPar.jpeg); tüm `.webp` ve `.avif` varyantları HTTP 404. Kart görsellerinde width/height mevcut (CLS güvende).
- **Düzeltme:** Hero + kart görsellerinin AVIF + WebP varyantlarını üret; `<picture><source type=image/avif><source type=image/webp><img …></picture>` ile sun; LCP hero preload'unu AVIF'e çevir (`imagesrcset`). Hero AVIF ~40-60KB'a iner (144KB'dan).
- **Kabul kriteri:** Giris.avif ve Giris.webp 200 döner; hero `<picture>` ile AVIF sunar; PageSpeed 'next-gen formats' uyarısı temizlenir, LCP payload düşer.
- **Doğrulama:** `curl -s -o /dev/null -w '%{http_code}\n' https://burcuevent.tr/assets/images/Giris.avif; curl -s https://burcuevent.tr/ | grep -io '<picture>\|type="image/avif"'`
- **Durum:** [ ]

## P2-14 · /assets/pwa.js ve /assets/wa-form.js Cache-Control header'sız (her ziyarette revalidate)
- **Kanıt:** `/assets/css/style.css` ve görseller `cache-control: public, max-age=31536000, immutable` dönerken `/assets/pwa.js` (1315 B) ve `/assets/wa-form.js` (1396 B) yanıtlarında cache-control YOK — sadece etag + last-modified. İki JS her sayfada sürüm query'si olmadan yükleniyor (CSS'te `?v=71e18971` var, JS'lerde yok) → tarayıcı koşullu GET yapıp 304 alır.
- **Düzeltme:** Caddy immutable cache kuralını `/assets/` altındaki `.js` dosyalarını kapsayacak şekilde genişlet **VE aynı anda** dosya adına içerik-hash/sürüm query'si ekle (yoksa bayat-JS bug'ı doğar); ya da JS'leri sürümlenmiş `/assets/js/` altına taşı.
- **Kabul kriteri:** `curl -sI https://burcuevent.tr/assets/pwa.js` çıktısında `cache-control: public, max-age=31536000, immutable` görünür.
- **Doğrulama:** `curl -s -m 15 -D - -o /dev/null https://burcuevent.tr/assets/pwa.js | grep -i cache-control; curl -s -m 15 -D - -o /dev/null https://burcuevent.tr/assets/wa-form.js | grep -i cache-control`
- **Durum:** [ ]

## P2-15 · theme-color tutarsız: HTML meta (#2a0f1a) ≠ manifest theme_color (#1a1512)
- **Kanıt:** HTML head: `<meta name="theme-color" content="#2a0f1a">` (tek etiket, media attribute yok → dark/light varyantı değil, gerçek uyuşmazlık). `manifest.json`: `"theme_color":"#1a1512"`. İki değer farklı → adres çubuğu rengi ile yüklü PWA teması uyuşmuyor. Manifest'in geri kalanı geçerli (name/short_name/icons 192+512 any+maskable/display standalone).
- **Düzeltme:** Marka birincil rengini tek değere sabitle; HTML `<meta name=theme-color>` ile `manifest.json theme_color`'ı aynı hex'e getir.
- **Kabul kriteri:** meta theme-color değeri manifest.json theme_color ile birebir aynı.
- **Doğrulama:** `curl -s https://burcuevent.tr/ | grep -io 'theme-color[^>]*'; curl -s https://burcuevent.tr/assets/manifest.json | grep -i theme_color`
- **Durum:** [ ]

## P2-16 · LocalBusiness şemasında geo, hasMap ve GBP sameAs bağlantısı eksik; harita embed'i doğrulanmış Place değil
- **Kanıt:** Home + servis sayfalarındaki EventPlanner address+areaServed+openingHoursSpecification içeriyor ama `"geo"`=0, `hasMap`=0. `sameAs` yalnız 2 Instagram URL'i (`burcueventplanner`, `burcuozdemir9`) — Google Business Profile/Maps linki yok. iletisim.html haritası doğrulanmış Place değil, adres-sorgu embed'i (`maps?q=İncek+Mahallesi…&output=embed`).
- **Düzeltme:** EventPlanner'a GBP pin'inden alınan gerçek geo {latitude, longitude} + hasMap (GBP/place URL) ekle; sameAs'e doğrulanmış GBP/Maps URL'ini ekle; iletisim.html embed'ini place_id tabanlı Place embed'ine çevir. Koordinatlar gerçek İncek/Gölbaşı konumundan olmalı (uydurma).
- **Kabul kriteri:** Validator'da EventPlanner geo + hasMap görünür; sameAs GBP içerir; harita embed'i işletmenin doğrulanmış Place'ini gösterir.
- **Doğrulama:** `curl -s https://burcuevent.tr/ | grep -o '"geo"[^}]*}'; curl -s https://burcuevent.tr/ | grep -o '"sameAs":[^]]*]'`
- **Durum:** [ ]

## P2-17 · İlçe/şehir hub landing sayfaları yok — areaServed ilçeleri için yerel içerik fırsatı kaçıyor
- **Kanıt:** sitemap.xml tam 9 URL; robots.txt yalnız bu sitemap'i işaret ediyor, `sitemap_index.xml`=404 (gizli sitemap yok). Şemada `areaServed=["Ankara","Gölbaşı","Etimesgut","Çankaya","Yenimahalle"]` beyan edilmesine rağmen ilçe×hizmet URL'leri (golbasi-dugun-organizasyonu.html, cankaya-kina-organizasyonu.html, golbasi.html …) hepsi 404 — tek bir yerel landing yok.
- **Düzeltme:** Öncelikli ilçe×hizmet kombinasyonları için benzersiz içerikli hub sayfaları oluştur (ör. `/golbasi-dugun-organizasyonu.html`): yerel mekan/referans bilgisi, LocalBusiness + areaServed, servis sayfalarına iç link. **Thin/duplicate/doorway içerik olmamalı; her sayfa gerçek yerel değer taşımalı.**
- **Kabul kriteri:** Öncelikli ilçeler için benzersiz, indekslenebilir hub sayfaları sitemap'te; her biri servis+ilçe kombinasyonunda tek başına sıralanabilir içerikte.
- **Doğrulama:** `curl -s https://burcuevent.tr/sitemap.xml | grep -o '<loc>[^<]*</loc>'`
- **Durum:** [ ]

## P2-18 · kina-gecesi.html başlığında şehir/marka yok ve yerel işletme (areaServed) şeması eksik
- **Kanıt:** title = `Kına Gecesi — Töre, Zarafet ve Mum Işığı` (Ankara ve marka yok). Sayfa şeması yalnız Article + Organization + BreadcrumbList + ImageObject; EventPlanner/LocalBusiness ve areaServed yok (kardeş kina-organizasyonu.html'in aksine). Buna karşın body'de 'ankara' 5× geçiyor, meta desc yerel hedefleme içeriyor — sinyal içerikte var, title'da ve şemada yok.
- **Düzeltme:** Öncelik: title'a marka (+opsiyonel şehir) ekle (ör. `Kına Gecesi Organizasyonu — Ankara | Burcuevent`). İkincil: sayfaya en azından areaServed sinyali ekle. NOT: kina-organizasyonu.html'e iç link ZATEN mevcut (canlıda 2×). Article'a EventPlanner eklemek tartışmalı olduğundan net kazanç title güncellemesinde.
- **Kabul kriteri:** Title şehir + marka içerir; sayfa (mümkünse) yerel işletme sinyali (areaServed/adres) taşır.
- **Doğrulama:** `curl -s https://burcuevent.tr/kina-gecesi.html | grep -io '<title>[^<]*</title>'; curl -s https://burcuevent.tr/kina-gecesi.html | grep -o '"areaServed"'`
- **Durum:** [ ]
