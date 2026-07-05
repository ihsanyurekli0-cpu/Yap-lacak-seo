# Hangises — hangises.com

Stack: Next.js 16 + Cloudflare. Repo `ankaradjparty-frontend-v2` (çift marka; brand=hangises). Genel durum 🟡 — kritik (P0) engel yok; teknik temel (canonical, HSTS preload, JSON-LD, sitemap) sağlam ama 2 gerçek P1 (ekipman sayfasında coğrafi çelişki + DJ liste şemasının profil sayfalarına sızması) ve bir dizi P2 hijyen/olgunluk maddesi mevcut.

## Canlı doğrulama (2026-07-04)
- **Canonical:** çalışıyor; sayfalı/filtreli URL'ler self-canonical ile toplanıyor (`/djs?q=test` → canonical `https://hangises.com/djs`).
- **HSTS preload:** tüm yanıtlarda aktif (`max-age=63072000; includeSubDomains; preload`) — preload listesindeki tarayıcılarda http hop'u hiç görülmüyor.
- **Redirect'ler:** 4 varyanttan 3'ü tek hop ve sağlıklı; yalnız `http://www` 2 hop yiyor (bkz. P2-3).
- **Sitemap:** 30 URL; 24 statik + 3 blog + 3 non-demo DJ profili. DJ profilleri API total ile örtüşüyor (henüz kesme yok).
- **JSON-LD @type'lar:** LocalBusiness/ProfessionalService (#organization), founder Person, ProfilePage + Service (DJ profili), BlogPosting, FAQPage, BreadcrumbList, CollectionPage + ItemList (DJ listesi) — tümü mevcut ve büyük ölçüde geçerli.
- **robots:** para sayfaları (`/equipment`, `/djs`, DJ profilleri) `index, follow`; demo DJ'ler `isDemo` ile noindex.
- **OG altyapısı:** `/og-image.png` 1200x630 (1.91:1) mevcut; ancak DJ profili ve blog OG/BlogPosting görselleri bunu kullanmıyor (bkz. P2-5, P2-11).
- **Güvenlik header'ları:** XFO/COEP/CSP set; tek hijyen sorunu HSTS'in iki kez gönderilmesi (bkz. P2-12).

---

## P1-1 · Ekipman sayfası: görünür H1 ve Service şeması ulusal markada 'Ankara' hardcoded — title/meta ile çelişiyor
- **Kanıt:** Canlı `https://hangises.com/equipment` (200, `index, follow`, sitemap'te). H1 = "Ankara'da / DJ & Canlı Müzik / Ekipman Kiralama" AMA `<title>` = "...| Hangi Ses" ve meta description "Türkiye geneli" içeriyor. Servil edilen HTML'deki JSON-LD de `name:"Ankara DJ ve Canlı Müzik Ekipman Kiralama"`, `description:"Ankara'da DJ ekipmanı..."`. Kaynak: `src/app/equipment/page.jsx:262` (`<span className="block">Ankara&apos;da</span>` — marka koşulu yok); `src/lib/seo/equipment-schema.js:34,36` (statik, Ankara baked-in). `layout.jsx` generateMetadata 06-14'te marka-bilinçli yapılmış ama görünür H1 + statik şema atlanmış (eksik migration / cross-brand geo sızıntısı).
- **Düzeltme:** H1 ve `equipmentSchema`'yı `layout.jsx` gibi marka-koşullu yap: `brand.city` varsa (ankaradjparty) "Ankara'da" kalsın; hangises (ulusal) için "Ankara'da" ibaresini KALDIR — H1 örn. "DJ & Canlı Müzik Ekipman Kiralama", şema name/description "Türkiye geneli". Ulusal markaya uydurma şehir metni ekleme.
- **Kabul kriteri:** `hangises.com/equipment` H1 ve JSON-LD Service name/description'ında "Ankara" geçmez; title/meta/H1/şema aynı ulusal hedeflemede tutarlı. `ankaradjparty.com/equipment` "Ankara" formunu korur.
- **Doğrulama:** `curl -s -L https://hangises.com/equipment | grep -o "Ankara'da"` (boş dönmeli)
- **Durum:** [ ]

## P1-2 · DJ liste (CollectionPage) @graph'ı bireysel DJ profil sayfalarına sızıyor — 2 BreadcrumbList + 2 FAQPage + yanlış sayfa tipi
- **Kanıt:** Canlı `https://hangises.com/djs/68e9534d1d13ec636ca41d1c` (200) → 8 JSON-LD bloğu. Biri liste @graph'ı: `CollectionPage (@id .../djs#collection, url=/djs)` + `ItemList(8 DJ)` + `FAQPage(5 soru)` + `BreadcrumbList`. Profilin kendi breadcrumb/faq/profile/service blokları da mevcut → sayımlar: `BreadcrumbList=2`, `FAQPage=2` (10 Question), `CollectionPage=1` (sayfa aslında ProfilePage). Kök neden: `src/app/djs/layout.jsx:137-152` `buildDjsSchema(brand)` çıktısını `{children}`'ı saran `<script>` olarak basıyor; Next.js layout nested child route'ları (`[slugOrId]`) sardığı için liste şeması her profil sayfasında render ediliyor.
- **Düzeltme:** `<script>`'i `src/app/djs/layout.jsx`'ten çıkar, `src/app/djs/page.jsx` içine taşı (page yalnız `/djs` route'unda çalışır, `[slugOrId]` child'ına inmez). Profil sayfasında yalnız `[slugOrId]/layout.jsx`'in tek ProfilePage + Service + tek BreadcrumbList + tek FAQPage'i kalır.
- **Kabul kriteri:** `/djs/{id}` SSR'sinde tam 1 BreadcrumbList, 1 FAQPage, 0 CollectionPage; `/djs` listesinde CollectionPage/ItemList/FAQPage/BreadcrumbList korunur. Rich Results Test her iki URL'de uyarısız.
- **Doğrulama:** `curl -s https://hangises.com/djs/68e9534d1d13ec636ca41d1c | grep -c CollectionPage` (0 beklenir) — `grep -c '"@type":"BreadcrumbList"'` (1) — `grep -c '"@type":"FAQPage"'` (1); `curl -s https://hangises.com/djs | grep -c CollectionPage` (1)
- **Durum:** [ ]

---

## P2-1 · DJ profilleri sitemap'te limit=50 ile sert kesiliyor, sayfalama yok (ölçeklenince kayıp)
- **Kanıt:** `src/app/sitemap.xml/route.js:122` → `fetchList(apiUrl, '/djs?limit=50')` tek istek; `fetchList` (69-82) yalnız `json.data`'yı döndürüp `total`/`pages` meta'sını yok sayıyor, sayfalama döngüsü yok. Canlı API limit>50 reddediyor (`curl '.../djs?limit=500'` → `"Number must be less than or equal to 50"`). Şu an meta `total:5, pages:1` (3 non-demo) ve sitemap tam 3 DJ içeriyor → ÖRTÜŞÜYOR, kesme HENÜZ yok. Ancak katalog 50'yi aşınca 50 sonrası profiller sessizce düşer (latent ölçekleme kusuru).
- **Düzeltme:** Üretimi sayfalayın: yanıttaki `pages`/`total` meta'sıyla `limit=50` + `page` döngüsünde tüm sayfaları çekin, tüm non-demo (`isDemo=false`) DJ'leri ekleyin. `page` paramı API'de çalışıyor.
- **Kabul kriteri:** Katalogdaki tüm non-demo DJ profilleri sitemap'te; 50'den fazla DJ olsa bile hiçbiri düşmez.
- **Doğrulama:** DJ sayısını 50 üstüne çıkardıktan sonra `curl -s https://hangises.com/sitemap.xml | grep -c '/djs/'` değeri API total ile eşleşmeli. Kod: `grep -n 'limit=50' src/app/sitemap.xml/route.js`
- **Durum:** [ ]

## P2-2 · Statik sayfaların lastmod'u dosya mtime'ı = her deploy'da hepsi 'şimdi'ye sıfırlanıyor (yanıltıcı tazelik sinyali)
- **Kanıt:** `src/app/sitemap.xml/route.js:54` → `return statSync(filePath).mtime`. CI checkout'ta tüm dosyalar aynı anda yazıldığından 24 statik URL'nin HEPSİ aynı damgayı taşıyor: canlı `curl ... | grep -oE '<lastmod>[^<]+' | sort | uniq -c` → 24× `2026-07-04T07:59:07.000Z` (blog 3× 06-17, DJ gerçek `itemDate()` ile doğru). `/privacy`, `/terms` gibi değişmeyen sayfalar her deploy'da lastmod'u "şimdi"ye zıplatıyor → Google lastmod'a güvenmeyi bırakabilir.
- **Düzeltme:** Statik lastmod'u gerçek içerik değişim kaynağından türet: git son-commit tarihi (`git log -1 --format=%cI -- <dosya>`), manuel tarih tablosu ya da içerik-hash tabanlı tarih. Deploy mtime'ını lastmod olarak kullanma.
- **Kabul kriteri:** İçeriği değişmeyen statik sayfaların lastmod'u deploy'lar arası sabit; yalnız gerçekten değişen sayfanın lastmod'u güncellenir.
- **Doğrulama:** İki ardışık deploy sonrası `curl -s https://hangises.com/sitemap.xml`'de `/privacy` lastmod'u değişmemeli. Kod: `src/app/sitemap.xml/route.js:49-55`
- **Durum:** [ ]

## P2-3 · http+www giriş noktası 2 zincirli redirect (http+www → https+www → https non-www)
- **Kanıt:** `curl -sIL http://www.hangises.com/` → 308 `https://www.hangises.com/` ardından 301 `https://hangises.com/` (2 hop). Diğer 3 varyant tek hop: `http://hangises.com` → 308 (tek); `https://www` → 301 (tek); `https://hangises.com` → 200. Yalnız http+www kombinasyonu protokol-yükseltme ve www-strip'i ayrı adımlarda yiyor. HSTS preload aktif olduğundan tarayıcı etkisi ~sıfır; ham `http://www` linklerini keşfeden crawler'lar için 1 gereksiz hop.
- **Düzeltme:** Edge'de (Cloudflare Redirect Rule / Caddy) tek kuralla http VE/VEYA www olan tüm istekleri doğrudan tek 301 ile `https://hangises.com` hedefine yönlendir; iki adıma bölme.
- **Kabul kriteri:** Dört varyantın (http/https × www/non-www) tümü canonical https non-www'e tek hop ile ulaşır.
- **Doğrulama:** `curl -s -o /dev/null -w '%{num_redirects}\n' -L http://www.hangises.com/` → 1 olmalı (şu an 2)
- **Durum:** [ ]

## P2-4 · İki meta description SERP kesme sınırını aşıyor (equipment 204, muzisyen-kiralama 187 karakter)
- **Kanıt:** Canlı unicode sayımı: `/equipment` desc = 204 kr; `/muzisyen-kiralama` desc = 187 kr — ikisi de ~155-160 kr masaüstü kesme eşiğini aşıyor. Kaynak: `src/app/equipment/layout.jsx:17`; `src/app/muzisyen-kiralama/page.jsx:9`. NOT: baseline byte-sayımıyla ~167 görünüyordu; doğru unicode sayımıyla diğer sayfalar 133-159 kr (uygun) — sadece bu iki sayfa aşıyor.
- **Düzeltme:** Her iki description'ı ≤155 unicode karaktere indir; birincil keyword'ü (ekipman kiralama / müzisyen kiralama) başta tut, kuyruk keyword listesini kısalt. Örn. equipment: "DJ ve canlı müzik ekipmanı kiralama: mikser, CDJ, RCF/JBL ses sistemi, sahne ışığı, çalgılar. Türkiye geneli, hızlı teklif." (~120 kr).
- **Kabul kriteri:** Her iki sayfanın meta description'ı ≤155 unicode karakter; SERP'te kesilmeden görünür.
- **Doğrulama:** `python3 -c "import re,html,urllib.request as u;[print(len(html.unescape(re.search(r'name=.description. content=.(.*?).',u.urlopen(x).read().decode()).group(1)))) for x in ['https://hangises.com/equipment','https://hangises.com/muzisyen-kiralama']]"`
- **Durum:** [ ]

## P2-5 · Blog BlogPosting.image (+ og:image/twitter:image) marka logosunu kullanıyor — makale görseli temsili değil
- **Kanıt:** (onpage + structured-data denetiminde iki kez doğrulandı) Canlı `https://hangises.com/blog/dugun-dj-mi-canli-muzik-mi` → BlogPosting `"image":"https://hangises.com/logo.png"`; aynı değer 3 blog yazısının hepsinde. `logo.png` gerçekte 1024×325 banner (genişlik <1200px, ~3.15:1) → Google Article/BlogPosting görsel önerisini (temsili, ≥1200px, tercihen 1.91:1) karşılamaz. `og:image` ve `twitter:image` de logo.png → sosyal önizleme de logoyu gösteriyor. Kaynak: `src/app/blog/[slug]/page.jsx:38` (`logo = ${siteUrl}/logo.png`) ve `:54-55` (`image: logo`).
- **Düzeltme:** Blog verisine (`src/data/blogPosts`) post başına hero/cover görseli (≥1200px, 16:9/4:3/1:1) ekle; `BlogPosting.image` + `og:image` + `twitter:image` bunu kullansın. Logo yalnız `publisher.logo` ImageObject'te kalsın. Görsel yoksa en azından mevcut `/og-image.png`'e (1200×630) düş — logoyu image alanından kaldır.
- **Kabul kriteri:** Her indekslenen blog yazısının `BlogPosting.image`'i benzersiz, 200 dönen, ≥1200px, yazıya özgü görsel (logo değil). Rich Results Test "Article" uygun.
- **Doğrulama:** `curl -s -L https://hangises.com/blog/ses-sistemi-kiralama-rehberi | grep -o '"image":"[^"]*"'` (logo.png OLMAMALI)
- **Durum:** [ ]

## P2-6 · Blog yazılarında author @type Organization ('Hangi Ses Editör Ekibi') — Person değil
- **Kanıt:** Canlı `BlogPosting.author = {"@type":"Organization","name":"Hangi Ses Editör Ekibi"}` ve `<meta property="article:author">` aynı. Kaynak: `src/app/blog/[slug]/page.jsx:47` (`author: { "@type": "Organization", name: post.author || brand.name }`). Organization author schema.org'da geçerli (hata değil) ama Google E-E-A-T için gerçek isimli Person author önerir; yazar otoritesi sinyali zayıf.
- **Düzeltme:** `author`'ı `@type Person`'a çevir (gerçek isimli yazar; mümkünse `url`/`sameAs` ile yazar profili). Organization yalnız `publisher` olarak kalsın. İsimli yazar yoksa en azından yazar varlığını Person olarak tanımla — **uydurma/sahte isim ekleme.**
- **Kabul kriteri:** `BlogPosting.author @type = Person`, name gerçek yazar; publisher Organization ayrı kalır.
- **Doğrulama:** `curl -s -L https://hangises.com/blog/dugun-muzigi-akisi-saat-saat-plan | grep -o '"author":{[^}]*}'`
- **Durum:** [ ]

## P2-7 · İndekslenen DJ profilleri, meta description olarak zayıf/test niteliğinde ham biyografi basıyor
- **Kanıt:** Canlı `https://hangises.com/djs/68e9534d1d13ec636ca41d1c` (sitemap'te, `index,follow`) → title "DJC0D3R — Ankara DJ Kiralama | Hangi Ses", meta description = ham bio "Ben C0D3R!, Asıl işim yazılım ama hobi olarak DJ'lik yapmaya karar verdim." (~78 kr, test/hobi görünümlü). Kod: `src/app/djs/[slugOrId]/layout.jsx:42` (`trimmed.length >= 60` → ham bio) ve `:100` (`bio.slice(0,160)`). noindex yalnız `dj.isDemo`'ya bağlı (`:107`); bu profesyonel-olmayan test hesabı `isDemo` işaretli olmadığından index'e sızıyor.
- **Düzeltme:** `pickBio` kalite eşiğini yükselt: yalnız uzunluk değil kalite guard'ı (örn. ≥120 kr VE hizmet/şehir keyword içeriyorsa ham bio; aksi halde profesyonel şablon açıklamaya düş). Placeholder/test biyografili profilleri `isDemo` benzeri bir içerik-kalite bayrağıyla noindex yap.
- **Kabul kriteri:** İndekslenen DJ profillerinin meta description'ı açıklayıcı ve hizmet-alakalı; test/joke/placeholder metin indekslenmez.
- **Doğrulama:** `curl -s -L https://hangises.com/djs/68e9534d1d13ec636ca41d1c | grep -o '<meta name="description"[^>]*>'`
- **Durum:** [ ]

## P2-8 · hangises Organization/#organization node'unda marka sameAs (sosyal profil) yok
- **Kanıt:** (structured-data + local-intl denetiminde iki kez doğrulandı) Canlı `#organization` (LocalBusiness/ProfessionalService) node'unda `sameAs` YOK; tek IG (`instagram.com/dj_dionys`) yalnız founder Person node'unda. Kod: `src/app/layout.jsx:231-238` → `sameAs` yalnız `NEXT_PUBLIC_SOCIAL_URLS` set VEYA `isAnkaradj` iken ekleniyor; hangises'te env boş + `isAnkaradj=false` (areaServed=Country) → org düzeyinde marka sosyal bağı hiç üretilmiyor. Entity disambiguation / Knowledge Panel sinyali zayıf (opsiyonel alan, kırık indeksleme yok).
- **Düzeltme:** **Yalnız GERÇEK, kurum-sahipli** Hangi Ses profillerini (Instagram/Facebook/LinkedIn/YouTube, varsa GBP URL'i) `NEXT_PUBLIC_SOCIAL_URLS`'e virgüllü gir; kod bunları org `sameAs`'ına yansıtır. Marka hesabı yoksa uydurma ekleme — kişisel founder IG'si org sameAs'ı yerine geçmemeli (önce hesapları aç).
- **Kabul kriteri:** `#organization` node'unda markaya ait doğrulanabilir, canlı `sameAs` URL dizisi; Schema validator uyarısız.
- **Doğrulama:** `curl -s https://hangises.com/ | grep -o 'id="local-business-schema"[^<]*' | grep -c sameAs` (≥1 beklenir)
- **Durum:** [ ]

## P2-9 · Ulusal marka hangises için @type LocalBusiness + sabit Ankara adresi, areaServed=Country ile uyumsuz
- **Kanıt:** `config.js:45` `city:null`, description ulusal ("Türkiye'nin ... marketplace'i"). Ama canlı `#organization`: `"@type":["LocalBusiness","ProfessionalService"]`, `address` Eryaman/Etimesgut/Ankara, `priceRange:"$$"` iken `areaServed:{"@type":"Country","name":"Türkiye"}`. Kaynak `src/app/layout.jsx:201-261` — `@type`/`priceRange`/`address` markaya göre dallanmıyor. Markup geçerli (hata değil) ama tip↔areaServed çelişkisi ulusal marketplace'i Ankara'ya yerelleştirme riski taşır (düşük/spekülatif etki, hijyen).
- **Düzeltme:** hangises için birincil tipi `Organization` (gerekirse `OnlineBusiness`) yap; kayıtlı adres kalabilir ama `LocalBusiness+priceRange+tek ilçe adresi` yerine `Organization+contactPoint` modeli daha doğru. `ankaradjparty` gerçekten yerel olduğundan onda `LocalBusiness` kalsın (marka-koşullu — mevcut `isAnkaradj` dallanmasıyla).
- **Kabul kriteri:** hangises `#organization` Organization tabanlı, areaServed=Country ile tutarlı; ankaradj LocalBusiness/geo/openingHours korunur. Validator uyarısız.
- **Doğrulama:** `curl -s https://hangises.com/ | grep -o 'id="local-business-schema"[^>]*>[^<]*' | grep -o '"@type":\[[^]]*\]'` (ulusal markada LocalBusiness beklenmiyor)
- **Durum:** [ ]

## P2-10 · hangises LocalBusiness'ta geo koordinatı ve openingHoursSpecification yok (yalnız kardeş markaya veriliyor)
- **Kanıt:** Canlı ana sayfa + `/contact` LocalBusiness JSON-LD'sinde `address` (Etimesgut/Ankara), `hasMap` (`maps.app.goo.gl/W8JoNGoKq6z2tf9c7`), `telephone`, `contactPoint` VAR; ancak `geo` ve `openingHoursSpecification` tüm HTML'de 0 kez. Kod: `src/app/layout.jsx:263` (`geo` yalnız env lat/long VEYA `isAnkaradj` iken) ve `:282` (`openingHoursSpecification` yalnız `isAnkaradj`). hangises aynı ofisi kullanıp adres+hasMap yayınlamasına rağmen bu iki alanı almıyor.
- **Düzeltme:** `isAnkaradj` koşulunu genişlet: hangises için de aynı ofis koordinatını (39.977477, 32.6177454 — zaten yayınlanan `hasMap` pininin çözümü, uydurma değil) `geo` ve 7/24 `openingHoursSpecification` olarak ekle (env `NEXT_PUBLIC_BUSINESS_LATITUDE/LONGITUDE` öncelikli kalır). Böylece adres+hasMap+geo üçlüsü tamamlanır.
- **Kabul kriteri:** hangises.com ana sayfa LocalBusiness JSON-LD'si `geo` (GeoCoordinates) + `openingHoursSpecification` içeriyor; Rich Results Test uyarısız.
- **Doğrulama:** `curl -s https://hangises.com/ | grep -o '"geo":{[^}]*}\|openingHoursSpecification'`
- **Durum:** [ ]

## P2-11 · Görsel optimizasyonu tümüyle devre dışı (custom passthrough loader) — AVIF/WebP ve resize hiç uygulanmıyor
- **Kanıt:** `next.config.mjs:19-23` `loader:'custom'` + `formats:['image/avif','image/webp']` + deviceSizes/imageSizes tanımlı; ama `src/lib/imageLoader.js:13-23` gelen src'yi hiç dokunmadan döndürüyor → next.config'teki formats/deviceSizes/imageSizes ÖLÜ konfig. Canlı: DJ kartı görseli `content-type: image/jpeg`, `content-length: 189059` (~184KB, gerçek 1080×1080); `Accept: image/avif,image/webp` gönderilse bile jpeg dönüyor (`vary: Origin`, format müzakeresi yok). `/_next/image` → 404 (optimizer yok). Cloudflare Polish/Image Resizing kapalı (`/cdn-cgi/image/` → 404). Kartlar `fill`+object-cover ile 1080×1080 tam-res'i küçük gösteriyor → gerçek resize israfı. NOT: "LCP/CWV" çerçevesi abartılı — kartlar `loading=lazy` (fold altı), `/djs` SSR'de upload `<img>` yok (client-render); ana maliyet bant genişliği/sayfa ağırlığı, LCP-ranking etkisi koşullu.
- **Düzeltme:** `imageLoader.js`'i gerçek bir resize/format CDN'ine bağla (Cloudflare Image Resizing/Polish veya R2): loader `/cdn-cgi/image/width={width},format=auto,quality={quality}/` gibi transform üretsin → Next/Image'in width/sizes hint'leri gerçek küçültme+AVIF/WebP'e dönüşür. Alternatif: upload pipeline'da AVIF/WebP + boyut varyantları üret. (SSRF-guard transform CDN üzerinden korunur.)
- **Kabul kriteri:** Upload görselleri kart genişliğine uygun boyutta ve Accept'e göre AVIF/WebP servis edilir; 189KB jpeg thumbnail <40KB'a düşer; Lighthouse "next-gen formats" ve "properly size images" temizlenir.
- **Doğrulama:** `curl -s -o /dev/null -w '%{content_type} %{size_download}\n' -H 'Accept: image/avif,image/webp,image/*' 'https://api.ankaradjparty.com/uploads/djs/dj-1760121720464-67174515.jpg'` (bugün image/jpeg 189059; hedef image/avif + belirgin küçük boyut). Kod: `src/lib/imageLoader.js:14-22 + next.config.mjs:19-23`
- **Durum:** [ ]

## P2-12 · DJ profil og:image ham foto — 1200x630 markalı kart değil, og:image:width/height yok, cross-origin (api.ankaradjparty.com)
- **Kanıt:** `src/app/djs/[slugOrId]/layout.jsx:116` `images:[{ url: photo, alt }]` (width/height YOK) + `:118-119` `twitter.card:'summary_large_image'`; `photo = pickPhoto()` (47-55) ham profil fotosu. Canlı: `og:image=https://api.ankaradjparty.com/uploads/djs/...jpg` (hangises sayfasında ankaradjparty origin → marka tutarsızlığı), `og:image:width/height` grep BOŞ. NOT: görsel aslında 1080×1080 KARE (dikey portre DEĞİL) → summary_large_image şartını karşılar, "kötü kırpılır/kart atlanır" iddiası abartılı; etki marka estetiği/polish düzeyinde, SEO-nötr.
- **Düzeltme:** Her DJ için 1200×630 markalı OG kartı üret (isim + foto + Hangi Ses logo bindirmeli) ve `openGraph.images`'e `width:1200,height:630` ile ver; üretilemiyorsa `brand.ogImage` (hangises `/og-image.png`, zaten 1200×630) fallback. og:image mutlak URL'i **hangises origin'inden** servis et. **Gerçek DJ görseli/markalı kart — sahte/yanıltıcı görsel değil.**
- **Kabul kriteri:** DJ paylaşımlarında og:image 1200×630 (1.91:1) markalı kart; `og:image:width/height` deklare; Twitter Card Validator / FB Debugger düzgün render; görsel hangises.com origin'inden.
- **Doğrulama:** `curl -s -L https://hangises.com/djs/68e9534d1d13ec636ca41d1c | grep -io '<meta property="og:image[^>]*>'` (og:image:width=1200 ve height=630 görünmeli)
- **Durum:** [ ]

## P2-13 · Strict-Transport-Security header'ı iki kez (duplike) gönderiliyor
- **Kanıt:** `curl -sD - https://hangises.com/` çıktısında iki adet birebir aynı `strict-transport-security: max-age=63072000; includeSubDomains; preload` (aynısı `/site.webmanifest`'te de). Kaynak: `next.config.mjs:60` app katmanında HSTS set ediyor VE edge (`via: 1.1 Caddy`, `server: cloudflare`) da ekliyor. İki başlık şu an byte-for-byte aynı; RFC 6797 gereği tarayıcı ilkini işleyip diğerini yok sayar → bugün sıfır fonksiyonel etki (kozmetik/hijyen; ileride ayrışırlarsa zayıf olan kazanabilir + bazı tarayıcı/Lighthouse gürültüsü).
- **Düzeltme:** HSTS'i TEK katmanda tut: ya `next.config.mjs:60`'tan kaldır (edge zaten ekliyorsa) ya da edge/Caddy'den kaldırıp yalnız app katmanında bırak. Preload gereksinimleri (max-age≥1yr, includeSubDomains, preload) korunmalı.
- **Kabul kriteri:** Yanıtta yalnız bir `Strict-Transport-Security` header'ı; değer `max-age=63072000; includeSubDomains; preload`.
- **Doğrulama:** `curl -sD - -o /dev/null https://hangises.com/ | grep -ci '^strict-transport-security:'` (1 olmalı, şu an 2)
- **Durum:** [ ]

## P2-14 · Fold altı footer logosu (logo.svg) her rotada image olarak preload ediliyor
- **Kanıt:** Link header her yanıtta: `</logo-mark.svg>; rel=preload; as=image, </logo.svg>; rel=preload; as=image`. `logo-mark.svg` fold-üstü ilk `<img>` (33×40) — haklı; ancak `logo.svg` FOOTER görseli (`AppFooter.jsx:124`, 141×40, ~%53 derinlik, fold altı, LCP değil) preload edilerek bant genişliğiyle yarışıyor. Etki trivial (küçük SVG). **UYARI — konum:** preload'u üreten kod BU REPODA YOK (next.config headers yalnız HSTS/XFO/COEP; middleware yalnız CSP; iki logo düz `<img>`; repoda Caddyfile/wrangler yok). Header edge (Caddy/Cloudflare) katmanında enjekte ediliyor → düzeltme edge config erişimi gerektirir, codebase içinde uygulanamaz.
- **Düzeltme:** Edge/early-hints Link header üreticisinden fold-altı `/logo.svg` girişini çıkar; yalnız fold-üstü `/logo-mark.svg` preload'u kalsın. Footer logosu normal lazy yüklensin.
- **Kabul kriteri:** Link header'da yalnız `logo-mark.svg` image preload'u; `logo.svg` preload edilmez.
- **Doğrulama:** `curl -sD - -o /dev/null https://hangises.com/ | grep -o 'logo[^>]*rel=preload'` (logo.svg satırı görünmemeli)
- **Durum:** [ ]

## P2-15 · Kök seviye statik public varlıklar kısa cache'leniyor (Cache-Control max-age=60)
- **Kanıt:** `curl -sD - https://hangises.com/og-image.png` → `cache-control: public, max-age=60, s-maxage=1800` (356KB PNG, nadiren değişir); `/site.webmanifest` de aynı. `next.config.mjs headers()` yalnız `/static/:path*` (satır 78-80, 1yıl immutable) ve `/.well-known` (86400) için uzun cache tanımlıyor; kök `/public` varlıkları (`/og-image.png`, `/site.webmanifest`, `/logo.svg`, `/favicon-*.png`) hiçbir kurala girmiyor → 60s browser cache. NOT: her varlıkta etag+last-modified var (ucuz 304), `s-maxage=1800` + `cf-cache-status: HIT` → edge zaten 30dk cache; Lighthouse "uses-long-cache-ttl" diagnostic (skorlanan CWV değil) — düşük etkili hijyen.
- **Düzeltme:** `next.config.mjs headers()`'e kural ekle: `source: '/:all*(svg|png|ico|webmanifest|woff2)'` → `Cache-Control: public, max-age=31536000, immutable` (değişebilen manifest için max-age=86400). Alternatif: varlıkları `/static` altına taşı.
- **Kabul kriteri:** og-image.png, favicon/logo ve manifest uzun süreli (≥1 gün, tercihen immutable) cache header'ı ile döner; tekrar ziyaretlerde ağ isteği düşer.
- **Doğrulama:** `curl -sD - -o /dev/null https://hangises.com/og-image.png | grep -i cache-control` (max-age ≥ 86400 beklenir, şu an 60)
- **Durum:** [ ]

## P2-16 · Ulusal marka hangises için şehir-hub landing sayfaları yok — yüksek niyetli şehir sorguları kaçıyor
- **Kanıt:** Sitemap'te 30 URL; hiçbiri şehir-hedefli değil (16 servis sayfası generic: `/dugun-dj`, `/dj-kiralama`, `/ses-sistemi-kiralama`...). Şehir landing probe'ları (`/istanbul-dugun-dj`, `/izmir-dj-kiralama`...) 404. org `areaServed` yalnız Country:Türkiye. Şehirler yalnız `/dugun-dj`'deki paragrafta link'siz geçiyor ("Ankara, İstanbul, İzmir, Antalya başta olmak üzere..."). `serviceLocalization.js` lokalizasyonu SADECE kardeş marka ankaradj için (`ANKARADJ_PATH_MAP`); hangises için şehir varyantı üreten yapı yok. Bu bir defect değil, içerik-büyüme FIRSATI (kaçan sorgu ölçülmemiş hipotez).
- **Düzeltme:** Şehir × servis matrisiyle programatik hub sayfaları üret (öncelik: İstanbul, İzmir, Bursa, Antalya, Adana — Ankara kardeş markaya ait). Her sayfa benzersiz H1/title ("İstanbul Düğün DJ Kiralama"), şehir-özel gövde/FAQ, `areaServed:{City}`, sitemap kaydı, iç link. **Doorway/thin-content ceza riskine karşı her şehre GERÇEK yerel bilgi (mekan/salon örnekleri, ilçe listesi) — kopya/ince içerik üretme.**
- **Kabul kriteri:** En az 5 büyük şehir için benzersiz landing yayında; her biri kendi canonical + tr-TR/x-default hreflang, şehir-özel H1/meta, City areaServed; sitemap'te listeli ve GSC'de indeksli.
- **Doğrulama:** `curl -s https://hangises.com/sitemap.xml | grep -Eio '(istanbul|izmir|bursa|antalya|adana)[^<]*'` ; `curl -s https://hangises.com/istanbul-dugun-dj -o /dev/null -w '%{http_code}\n'`
- **Durum:** [ ]

---

**Özet:** 18 madde (2 P1, 16 P2). Tüm bulgular canlı + kod ile doğrulandı, hepsi `open`. P0 yok. Kritik iki P1: ekipman sayfasındaki coğrafi çelişki (P1-1) ve DJ liste şemasının profil sayfalarına sızması (P1-2) — ikisi de tek dosya değişimiyle çözülür ve öncelikli ele alınmalı. Kalanlar hijyen/olgunluk (sitemap ölçekleme, lastmod, redirect, meta/şema kalitesi, görsel optimizasyonu, cache, şehir-hub büyümesi). P2-14 (footer logo preload) yalnız edge/Caddy config ile çözülür — repo içinde aksiyon alınamaz.
