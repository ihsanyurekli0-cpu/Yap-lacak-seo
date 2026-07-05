# Nextrez — nextrez.com.tr

Stack: Next.js + Cloudflare (edge önünde Caddy). Repo oturumda yok — tüm bulgular canlı denetimle doğrulandı. Genel değerlendirme: 🟡 Teknik temel sağlam; yalnızca düşük öncelikli (P2) hijyen ve fırsat maddeleri açık, kritik/engelleyici bir sorun yok.

## Canlı doğrulama (2026-07-04)
- **Canonical:** Tüm sayfalar self-referencing canonical döndürüyor (ör. /login → .../login, /signup → .../signup, sektör sayfaları kendi URL'lerine).
- **JSON-LD:** SoftwareApplication (@id #software, offers price=0 TRY), Organization (@id #organization, legalName "BK Organizasyon", logo, email, contactPoint, sameAs IG/FB), WebSite (inLanguage tr-TR) mevcut; sektör landing'leri FAQPage + BreadcrumbList + SoftwareApplication + Organization taşıyor (baseline şema gap'i kapatılmış).
- **Sitemap:** sitemap.xml ~25 URL listeliyor; robots.txt `Allow: /` + hedefli `Disallow` (/p/, /c/, /s/, /admin/, /onboarding).
- **Yönlendirme:** http (non-www) ve https-www tek 301 (redirects=1) ile temiz; yalnız http://www kombinasyonu 2 hop yapıyor.
- **Güvenlik header'ları:** CSP mevcut ve büyük ölçüde sağlam (default-src 'self', frame-ancestors 'none', object-src 'none', base-uri 'self', form-action 'self'); HSTS preload aktif.
- **Prerender:** Anasayfa ve sektör sayfaları SSR/prerender ediliyor (x-nextjs-prerender:1, HTTP 200), şablon server-side H2 üretebiliyor.

---

## P2-1 · http://www için 2 adımlı yönlendirme zinciri
- **Kanıt:** `curl -L http://www.nextrez.com.tr/` → redirects=2, final=https://nextrez.com.tr/. hop1: http://www → 301 https://www (Cloudflare edge), hop2: https://www → 301 https non-www. Alt yol /ozellikler de aynı 2 hop. http (non-www) ve https-www tek adımda gidiyor; sadece http+www kombinasyonu önce protokol sonra host normalize ettiği için 2 hop.
- **Düzeltme:** Edge/CDN katmanında (Cloudflare Redirect Rule veya Caddy) protokol+host normalizasyonunu tek kurala birleştir: her `http(s)://www.nextrez.com.tr/*` isteğini TEK 301 ile `https://nextrez.com.tr/$1` hedefine gönder. Böylece www+http kombinasyonu tek hop olur; link equity kaybı ve crawl israfı önlenir. (Etki minimal: HSTS preload sayesinde tarayıcılar http'yi zaten denemez; kalan tek fazla hop bazı crawler'lar için.)
- **Kabul kriteri:** http://www.nextrez.com.tr/ ve alt yolları tek 301 ile (num_redirects=1) doğrudan https://nextrez.com.tr/<path> hedefine ulaşır.
- **Doğrulama:** `curl -s -m 15 -o /dev/null -w '%{num_redirects} %{url_effective}\n' -L http://www.nextrez.com.tr/ozellikler` (beklenen: 1 https://nextrez.com.tr/ozellikler)
- **Durum:** [ ]

## P2-2 · Sitemap düşük değerli utility sayfalarını içeriyor (/login, /signup index,follow)
- **Kanıt:** sitemap.xml `<loc>.../login</loc>` ve `<loc>.../signup</loc>` listeliyor (lastmod 2026-06-01). Her ikisi de canlıda `<meta name="robots" content="index, follow">` + self-canonical döndürüyor. robots.txt bu yolları engellemiyor → gerçekten taranabilir/indekslenebilir. Auth/utility sayfalarının indekslenebilir olması crawl bütçesini seyreltir, thin sonuç riskini artırır.
- **Düzeltme:** /login'i sitemap.xml'den çıkar ve sayfaya `meta robots noindex,follow` ekle (işlevsel sayfa, aranma değeri yok). /signup dönüşüm/landing amaçlı tutulacaksa sitemap'te kalabilir; sitemap'i yalnızca kanonik, indekslenmeye değer içerik sayfalarıyla sınırla. UYARI: bu sayfalara sahte içerik/schema EKLENMEZ; yalnızca kapsam daraltılır. (Etki düşük: ~30 URL ölçeğinde crawl-bütçe seyrelmesi pratikte önemsiz; asıl aksiyon /login.)
- **Kabul kriteri:** sitemap.xml artık /login içermez; /login yanıtı `meta robots noindex` döndürür; sitemap yalnızca index edilmesi istenen kanonik sayfaları listeler.
- **Doğrulama:** `curl -s https://nextrez.com.tr/sitemap.xml | grep -c '/login'` (beklenen: 0) ;; `curl -s -L https://nextrez.com.tr/login | grep -io '<meta[^>]*name="robots"[^>]*>'` (noindex bekleniyor)
- **Durum:** [ ]

## P2-3 · Anasayfada hiç H2/H3 yok — semantik başlık hiyerarşisi eksik
- **Kanıt:** `curl -s https://nextrez.com.tr/` prerender HTML'inde H1=1, H2=0, H3=0 (H4/H5/H6 ve role=heading fallback de yok). H1 tek ve dolu ("Ücretsiz randevu, rezervasyon ve personel planlamayı tek panelden yönetin."). Görsel bölüm başlıkları `<h2>` yerine `<p class="text-3xl font-bold">` olarak işaretlenmiş. Kardeş sayfalar şablonun H2 ürettiğini kanıtlıyor: /ozellikler=8, /randevu-programi-karsilastirma=10, blog yazısı=10 — sorun yalnız anasayfada.
- **Düzeltme:** Anasayfadaki mevcut görsel bölüm başlıklarını (özellikler, sektörler, nasıl çalışır, SSS vb.) gerçek `<h2>`, alt kırılımları `<h3>` olarak işaretle. Başlıklara hedef anahtar kelime göm (ör. "Kuaför, klinik ve güzellik salonu için randevu", "WhatsApp ile randevu hatırlatma"). H1'den sonra mantıksal H2→H3 sırası koru, seviye atlama.
- **Kabul kriteri:** Anasayfa SSR HTML'inde en az 3-4 anahtar kelime içeren H2 ve uygun yerlerde H3 var; H1 tek kalıyor; hiyerarşi H1>H2>H3 sırasını atlamıyor.
- **Doğrulama:** `curl -s -m 20 https://nextrez.com.tr/ | grep -io '<h[123][^>]*>[^<]*' | sed -E 's/<[^>]+>//g'`
- **Durum:** [ ]

## P2-4 · Meta description'lar 155ch üstünde — SERP'te kesiliyor (CTR kaybı)
- **Kanıt:** Canlı karakter sayımı (Unicode kod-noktası): anasayfa 176, /randevu-programi-karsilastirma 180, /danisman-avukat-randevu-sistemi 169, /fiyatlandirma 165, /guzellik-salonu-randevu-sistemi 165, /klinik-randevu-sistemi 165, /spa-masaj-randevu-sistemi 162, /kuafor-randevu-programi 163. 9 sayfanın 8'i ~160ch üstünde; masaüstü SERP'te (~920px) kuyruk kesilecek. (Not: /musteri-yonetimi 153ch ile zaten sınır içinde → listeden çıkar, yanlış pozitif. Kanıttaki 170-191 rakamları UTF-8 BYTE sayımıdır; Türkçe ç/ş/ğ/ü/ö/ı 2 byte olduğu için şişmiş.)
- **Düzeltme:** İlgili sayfaların meta description'ını ~150-155 karaktere indir; en önemli değer önermesini ilk 120 karaktere front-load et (metinler zaten iyi yazılmış, yalnız kuyruğu kısalt). Örn anasayfada "iCloud/Google Takvim senkronu ve WhatsApp bildirimleri tek panelde" kısmını sadeleştir.
- **Kabul kriteri:** Sitemap'teki tüm indexlenebilir sayfalarda meta description <= 158 karakter; anahtar mesaj ilk 120 karakterde.
- **Doğrulama:** `for u in '' ozellikler fiyatlandirma klinik-randevu-sistemi guzellik-salonu-randevu-sistemi danisman-avukat-randevu-sistemi randevu-programi-karsilastirma; do curl -s -m 15 https://nextrez.com.tr/$u | grep -io 'name="description"[^>]*content="[^"]*"' | sed -E 's/.*content="([^"]*)".*/\1/' | awk '{print length" "$0}'; done`
- **Durum:** [ ]

## P2-5 · Sektör landing'lerinde anahtar kelime yamyamlığı (klinik↔diş, güzellik↔spa)
- **Kanıt:** /klinik-randevu-sistemi H1/title = "Klinik ve Diş Hekimi Randevu Sistemi" + desc "Klinik, diş ve estetik..."; ayrı /dis-klinigi-randevu-sistemi title = "Diş Kliniği Randevu Sistemi ve Diş Hekimi Randevu Programı" — ikisi de en yüksek ağırlıklı title'da "diş hekimi randevu" hedefliyor. Aynı şekilde /guzellik-salonu-randevu-sistemi H1 = "Güzellik Salonu ve Spa Randevu Sistemi" vs ayrı /spa-masaj-randevu-sistemi "Spa ve Masaj Salonu Randevu Sistemi" — ikisi de "spa randevu" içeriyor. Dört sayfa da index,follow + self-canonical + sitemap'te; karşılıklı iç link zaten mevcut.
- **Düzeltme:** Hub sayfaları tek birincil terime daralt: /klinik-randevu-sistemi title/H1/desc'inden "Diş Hekimi"ni çıkar (genel klinik+estetik'e odakla), "diş" sorgusunu tamamen /dis-klinigi-randevu-sistemi'ne bırak. /guzellik-salonu... title/H1'inden "Spa"yı çıkar, spa/masaj sorgusunu /spa-masaj-randevu-sistemi'ne devret. Yön veren iç linkleri koru. (Hub-and-spoke ikincil terim çakışması; sert collision değil, düşük etki.)
- **Kabul kriteri:** Her sektör sayfasının title+H1'i benzersiz tek birincil anahtar kelime hedefliyor; iki farklı URL'nin title/H1'inde aynı "diş hekimi randevu" veya "spa randevu" ifadesi tekrar etmiyor.
- **Doğrulama:** `for u in klinik-randevu-sistemi dis-klinigi-randevu-sistemi guzellik-salonu-randevu-sistemi spa-masaj-randevu-sistemi; do echo "$u:"; curl -s -m 15 https://nextrez.com.tr/$u | grep -io '<h1[^>]*>[^<]*' | sed -E 's/<[^>]+>//g'; done`
- **Durum:** [ ]

## P2-6 · Bazı sayfalarda <title> 60 karakter üstü — başlık kesilme riski
- **Kanıt:** Canlı Unicode kod-noktası sayımı: /dis-klinigi-randevu-sistemi 68ch ("Diş Kliniği Randevu Sistemi ve Diş Hekimi Randevu Programı · Nextrez"), /randevu-programi-karsilastirma 66ch, /fiyatlandirma 62ch → 3 sayfa net 60 üstü; /ozellikler 60ch (sınırda), /blog 55ch (artık 60 altında). Google ~600px sonrası keser; "· Nextrez" markası ve hedef kelime sonu görünmeyebilir. (Kanıttaki 61-73ch değerleri hafif şişirilmiş/bayat; site başlıkları aktif kısaltıyor gibi.)
- **Düzeltme:** 60 üstü title'ları ~55-60 karaktere indir. Örn /dis-klinigi: "Diş Kliniği Randevu Sistemi · Nextrez" ("Diş Hekimi Randevu Programı" tekrarını at). /fiyatlandirma: "Ücretsiz Randevu Fiyatlandırması · Nextrez". Marka son ekini koru, gövdedeki tekrarı sadeleştir.
- **Kabul kriteri:** Tüm indexlenebilir sayfalarda `<title>` <= 60 karakter ve birincil anahtar kelime + marka görünür kalıyor.
- **Doğrulama:** `for u in dis-klinigi-randevu-sistemi randevu-programi-karsilastirma fiyatlandirma ozellikler blog; do curl -s -m 15 https://nextrez.com.tr/$u | grep -io '<title[^>]*>[^<]*</title>' | sed -E 's/<[^>]+>//g' | awk '{print length" "$0}'; done`
- **Durum:** [ ]

## P2-7 · SoftwareApplication şemasında aggregateRating/review yok — yıldız zengin sonuç fırsatı (yalnız GERÇEK görünür puanla)
- **Kanıt:** #software düğümü (anasayfa, /ozellikler, /fiyatlandirma, /kuafor-randevu-programi ve tüm sektör landing'lerinde birebir aynı): `{"@type":"SoftwareApplication",...,"offers":{"@type":"Offer","price":"0","priceCurrency":"TRY"}}` — offers VAR, aggregateRating YOK, review YOK (`grep -o aggregateRating` boş). Etiket-temizlenmiş görünür puan taraması (★, x.y/5, puan, değerlendirme, yorum) sıfır eşleşme → sitede yayınlanacak gerçek puan verisi yok. Offer tek başına yıldız üretmez; yıldız için aggregateRating/review şart.
- **Düzeltme:** ÖNCE ürün içinde gerçek müşteri puanı/yorumu topla (ör. panelde 1-5 yıldız geri bildirim veya G2/Trustpilot) ve sayfada GÖRÜNÜR yayınla. Ardından SoftwareApplication JSON-LD'ye aggregateRating (ratingValue, ratingCount/reviewCount) ekle ve bu değerler sayfadaki görünür değerle BİREBİR eşleşsin. **KRİTİK:** sayfada görünmeyen/uydurma puan Google "spammy structured markup" manuel işlem cezası riski taşır — gerçek görünür puan yoksa bu alan hiç eklenmez. Şu an gerçek puan olmadığından bu bir önkoşula bağlı gelecek fırsatı, hemen basılacak markup değil.
- **Kabul kriteri:** aggregateRating YALNIZCA sayfada görünür, gerçek ve doğrulanabilir puanlarla eklenmiş; ratingValue/reviewCount görünür değerle eşleşiyor; gerçek veri yoksa hiç eklenmemiş; Rich Results Test SoftwareApplication için hatasız yıldız önizlemesi veriyor.
- **Doğrulama:** `curl -s -m 15 https://nextrez.com.tr/ | grep -o 'aggregateRating\|"review"'` (boş = henüz eklenmemiş) ; sayfada görünür yıldız/puan var mı gözle doğrula (varsa ratingValue ile eşleşmeli)
- **Durum:** [ ]

## P2-8 · Organization şemasında telephone ve PostalAddress yok
- **Kanıt:** #organization düğümü: name, legalName ("BK Organizasyon"), url, logo (icon-512.png, HTTP 200), email, contactPoint[2] (customer support + data protection officer — İKİSİ DE yalnız email), parentOrganization, areaServed:TR, sameAs[instagram,facebook] VAR. Ancak `grep -io '"telephone"'` boş (yalnızca `<meta content="telephone=no">` format-detection, şema alanı değil) ve `grep -io 'PostalAddress\|"address"'` boş — hiçbir sayfada telephone veya PostalAddress yok.
- **Düzeltme:** En az bir ContactPoint'e gerçek telephone (E.164, ör. +90...) ekle; işletmenin gerçek adresi varsa Organization'a PostalAddress (streetAddress/addressLocality/addressRegion/postalCode/addressCountry:TR) ekle. Uzaktan/adresi olmayan SaaS ise adres UYDURMA — yalnız telephone yeterli. Marka knowledge panel ve Organization zengin sonuç tamlığını güçlendirir. (Opsiyonel tamlık iyileştirmesi; Google Organization için telephone/adres zorunlu tutmaz.)
- **Kabul kriteri:** Organization JSON-LD'de gerçek telephone bulunur (ve varsa geçerli PostalAddress); Rich Results Test "Organization" için uyarısız/eksiksiz döner.
- **Doğrulama:** `curl -s -L https://nextrez.com.tr/ | grep -o '"telephone"[^,]*\|PostalAddress'`
- **Durum:** [ ]

## P2-9 · CSP script-src'te 'unsafe-inline' var — nonce/hash yok, XSS koruması zayıf
- **Kanıt:** Canlı response header (hem anasayfa hem /kuafor-randevu-programi aynı): `content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com https://challenges.cloudflare.com https://connect.facebook.net ...`. script-src içinde hiçbir `nonce-` veya `sha256-` yok → `unsafe-inline` tam aktif, satır içi script enjeksiyonuna (reflected/stored XSS) karşı CSP büyük ölçüde etkisiz. (CSP'nin geri kalanı sağlam: frame-ancestors 'none', object-src 'none', base-uri 'self', form-action 'self'.)
- **Düzeltme:** Next.js middleware ile per-request nonce üret (crypto.randomUUID/base64), CSP'de `script-src 'self' 'nonce-<n>' 'strict-dynamic'` kullan ve `unsafe-inline`ı kaldır. GTM/gtag için nonce'u tag'lere propagate et. style-src 'unsafe-inline' Next.js'te genelde kaçınılmaz olduğundan öncelik script-src. UYARI: kaldırmadan önce GTM/Facebook pixel/Cloudflare challenge script'lerinin nonce ile yüklendiğini staging'de doğrula, aksi halde analytics kırılır. (Savunma-derinliği sertleştirmesi; aktif exploit noktası gösterilmiyor.)
- **Kabul kriteri:** CSP header'ında script-src içinde 'unsafe-inline' yok; yerine 'nonce-...' 'strict-dynamic' var ve GTM/gtag/FB pixel hâlâ çalışıyor.
- **Doğrulama:** `curl -s -D - -o /dev/null https://nextrez.com.tr/ | grep -io "script-src[^;]*"`
- **Durum:** [ ]

## P2-10 · x-powered-by: Next.js header'ı framework'ü ifşa ediyor
- **Kanıt:** Canlı response header: `x-powered-by: Next.js` (HTTP/2 200 yanıtında mevcut). Teknoloji yığınını doğrudan söyleyerek hedefli exploit taramasını kolaylaştıran gereksiz bilgi ifşası. Not: aynı yanıt zaten x-nextjs-cache/x-nextjs-prerender/x-nextjs-stale-time da döndürüyor, dolayısıyla tam gizlilik için edge katmanında tüm x-nextjs-* header'ları da strip edilmeli.
- **Düzeltme:** next.config.js içinde `poweredByHeader: false` (veya Cloudflare/Caddy katmanında header'ı strip et — via: 1.1 Caddy görüldüğü için edge strip en garantili yol). Tek satırlık, risksiz değişiklik.
- **Kabul kriteri:** Response'ta x-powered-by header'ı dönmüyor.
- **Doğrulama:** `curl -s -D - -o /dev/null https://nextrez.com.tr/ | grep -i x-powered-by` (çıktı boş olmalı)
- **Durum:** [ ]

## P2-11 · OG/Twitter sosyal görselleri cache'lenmiyor (max-age=0, must-revalidate)
- **Kanıt:** /opengraph-image.png ve /twitter-image.png için `cache-control: public, max-age=0, must-revalidate`. Cloudflare edge cache'lemiyor (cf-cache-status MISS, ikinci istekte EXPIRED). Görsel tam 26233 byte, PNG 1200x630 (statik marka görseli) ama her istekte revalidate ediliyor. x-nextjs-cache HIT (origin görseli yeniden üretmiyor) ve yanıt last-modified taşıdığından revalidation 304 ile ucuz.
- **Düzeltme:** Statik OG/Twitter görsellerini uzun cache ile serve et (`cache-control: public, max-age=31536000, immutable`) — dynamic OG route'una `export const revalidate`/Cache-Control header ekle veya /public altında statik dosya kullan. İçerik değişebiliyorsa fingerprintli dosya adı kullan. (Düşük etki: sosyal crawler'lar ilk scrape sonrası kendi taraflarında cache'ler; doğrudan ranking etkisi yok, sosyal önizleme hijyeni.)
- **Kabul kriteri:** /opengraph-image.png ve /twitter-image.png cache-control'de max-age > 0 (ideal 1 yıl immutable) döndürüyor.
- **Doğrulama:** `curl -s -D - -o /dev/null 'https://nextrez.com.tr/opengraph-image.png' | grep -i cache-control`
- **Durum:** [ ]

## P2-12 · Hiç hreflang yok (self tr-TR + x-default) ve og:locale yok
- **Kanıt:** curl / ve /kuafor-randevu-programi (HTTP 200): `grep -io 'hreflang='` BOŞ, HTTP Link header yok, `grep -io 'og:locale'` BOŞ. Yalnız `<html lang="tr">` ve WebSite şemasında `"inLanguage":"tr-TR"` var. Diğer OG etiketleri (og:title/description/image/type/url) mevcut ama og:locale eksik.
- **Düzeltme:** Her URL'ye self-referencing hreflang ekle: `<link rel="alternate" hreflang="tr-TR" href="<canonical>"/>` + `<link rel="alternate" hreflang="x-default" href="<canonical>"/>` (app router `alternates.languages` ile). `og:locale="tr_TR"` meta ekle. İleride EN sürüm açılırsa aynı yapı çok-dilli hreflang'a hazır. (Etki düşük: tek-dilli sitede self-referencing hreflang ranking sinyali üretmez, pratikte no-op; gerçekten faydalı tek ekleme og:locale — gelecek hazırlığı.)
- **Kabul kriteri:** Her indekslenebilir sayfada tr-TR self + x-default hreflang bulunur; og:locale=tr_TR set; hreflang tester karşılıklı (return-tag) hatasız.
- **Doğrulama:** `curl -s https://nextrez.com.tr/ | grep -io 'hreflang="[^"]*"'` ; `curl -s https://nextrez.com.tr/ | grep -io 'og:locale[^>]*'`
- **Durum:** [ ]

## P2-13 · NAP eksik: şemada/iletisim'de telefon ve adres yok (yalnız e-posta)
- **Kanıt:** /iletisim görünür metin: yalnız `destek@nextrez.com.tr` ve `kvkk@nextrez.com.tr` (telefon/adres/TR adres anahtar kelimeleri Mah/Cad/Sok/No:/posta kodu HİÇ yok). Organization JSON-LD: email/legalName (BK Organizasyon)/areaServed:TR var; telephone alanı YOK, address/PostalAddress YOK; iki ContactPoint de yalnız email. /about da telefon/adres içermiyor. Not: kanıttaki "07481615535" aslında Facebook Pixel ID'sinin (id=27607481615535122) parçası — gerçek telefon yok.
- **Düzeltme:** Organization şemasına gerçek `telephone` (E.164) ve varsa `address` (PostalAddress) ekle; ContactPoint'e telephone alanı ekle; /iletisim'de aynı NAP'ı görünür metinde yayınla. GERÇEK olmalı — uydurma NAP olmaz. (Not: Nextrez ülke geneli online SaaS/rezervasyon ürünü, yerel harita-paketi işletmesi değil; Google Business Profile önerisi bu model için zayıf/opsiyonel. Asıl aksiyon: gerçek telefon varsa şema + /iletisim NAP tutarlılığı.)
- **Kabul kriteri:** Organization şemasında telephone (+ varsa PostalAddress) dolu; /iletisim'de aynı NAP görünür; Rich Results Test Organization hatasız.
- **Doğrulama:** `curl -s https://nextrez.com.tr/ | grep -o '"telephone"[^,]*\|PostalAddress'` ; /iletisim görünür metinde telefon/adres kontrolü
- **Durum:** [ ]

## P2-14 · Şehir hedefleme sıfır — sektör landing'lerinde şehir/ilçe içeriği yok (şehir-hub fırsatı)
- **Kanıt:** /kuafor-randevu-programi: şehir/ilçe grep'i (Ankara|İstanbul|İzmir|Bursa|şehir|ilçe) SIFIR gerçek şehir; yalnız `"areaServed":"TR"` (2). Sitemap tam 25 URL, hiçbiri şehir-kırılımlı değil (ör. kuafor-randevu-programi-ankara yok). areaServed yalnız ülke düzeyi. "kuaför randevu programı Ankara/İstanbul" gibi yüksek niyetli yerel-sektör sorguları için hedefli sayfa/hub yok.
- **Düzeltme:** En yüksek hacimli 2-3 sektör × ilk kademe şehir (İstanbul, Ankara, İzmir) için şehir-hub sayfaları üret (ör. /kuafor-randevu-programi/istanbul) — özgün, ince olmayan içerik (yerel kullanım senaryoları, ilçe örnekleri, yerel işletme referansı). Hub'ları ana sektör sayfasından ve sitemap'ten linkle; areaServed'i Country + AdministrativeArea ile yapılandır. **Doorway/çoğaltılmış ince sayfalardan kaçın** — her şehir sayfası gerçek yerel değer taşımalı. (Nextrez ulusal B2B SaaS olduğundan yerel-nitelik hacmi düşük; getiri mütevazı, konumdan bağımsız üründe toplu şehir sayfaları Google'ın cezalandırdığı doorway desenine kayabilir — dikkatli uygula.)
- **Kabul kriteri:** En az 3 şehir-hub sayfası yayında, sitemap'te ve iç linklerde; Search Console'da "randevu programı + şehir" sorgularında impression artışı; sayfalar thin-content/doorway olarak işaretlenmiyor.
- **Doğrulama:** `curl -s https://nextrez.com.tr/sitemap.xml | grep -io '<loc>[^<]*</loc>' | grep -iE 'istanbul|ankara|izmir'`
- **Durum:** [ ]
