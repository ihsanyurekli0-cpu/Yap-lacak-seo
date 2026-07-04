export const meta = {
  name: 'seo-audit-4-projects',
  description: 'Exhaustive live+code SEO audit of 4 projects, adversarial verify, rewrite backlog',
  phases: [
    { title: 'Audit', detail: 'live+code audit per project×dimension' },
    { title: 'Verify', detail: 'adversarially re-check each finding live' },
    { title: 'Synthesize', detail: 'write updated per-project backlog md' },
    { title: 'Consolidate', detail: 'rebuild BACKLOG.md + README.md' },
  ],
}

const SCRATCH = '/tmp/claude-0/-home-user-ankaradjparty-frontend-v2/edadfb88-83e1-5e10-87d0-3624b8fe4a22/scratchpad'
const CODE = '/home/user/ankaradjparty-frontend-v2'

const PROJECTS = [
  {
    slug: 'ankaradj', name: 'Ankaradj', domain: 'ankaradjparty.com',
    stack: 'Next.js 16 + Cloudflare', codePath: CODE, brand: 'ankaradjparty',
    repoNote: 'Repo: ankaradjparty-frontend-v2 (tek codebase, brand: ankaradjparty)',
    baseline: 'Güçlü. Bilinen: DJ profil aggregateRating yok (veri var DJCard.jsx:28); sitemap /djs?limit=50 cap; servis OG generic /og/*.png (markalı /brand/ankaradjparty/og/*-ankara.png atıl); meta desc ~176; LocalBusiness.logo hardcoded /logo.png; sameAs sadece founder IG.',
  },
  {
    slug: 'hangises', name: 'Hangises', domain: 'hangises.com',
    stack: 'Next.js 16 + Cloudflare', codePath: CODE, brand: 'hangises',
    repoNote: 'Repo: ankaradjparty-frontend-v2 (aynı codebase, brand: hangises)',
    baseline: 'Güçlü (HSTS preload, CSP nonce+strict-dynamic, HowTo schema). Bilinen: DJ aggregateRating + sitemap limit (ortak kod); blog BlogPosting.image=logo (blog/[slug]/page.jsx:54); meta desc ~167; blog author Organization; şehir-kırılımlı içerik eksik (ulusal marka).',
  },
  {
    slug: 'nextrez', name: 'Nextrez', domain: 'nextrez.com.tr',
    stack: 'Next.js + Cloudflare', codePath: null, brand: null,
    repoNote: 'Repo: harici (kod oturumda yok) — canlı denetim.',
    baseline: 'Randevu/rezervasyon SaaS. İyi (SoftwareApplication+Offer+Organization+WebSite schema, 25-URL sitemap). Bilinen: anasayfada H2/H3 yok (h1=1,h2=0,h3=0); SoftwareApplication aggregateRating yok; meta desc 183ch; hreflang yok; sektör landing (kuaför/klinik/güzellik/diş) FAQ/Breadcrumb şema eksik.',
  },
  {
    slug: 'burcuevent', name: 'BK Organizasyon (Burcuevent)', domain: 'burcuevent.tr',
    stack: 'Statik HTML / Caddy', codePath: null, brand: null,
    repoNote: 'Repo: ihsanyurekli0-cpu/burcuevent (GitHub PRIVATE, uzak yedekli, default master). bkorganizasyon.com.tr = alias.',
    baseline: 'Ankara organizasyon şirketi. Sağlam (EventPlanner+FAQPage+OpeningHours+PostalAddress, 9-URL sitemap: dugun/kina/dj-kiralama/bekarliga-veda/hizmetler/hakkimizda/iletisim). Bilinen: bkorganizasyon.com.tr alias kök / 200 duplicate (canonical→burcuevent.tr; tam 301 olmalı); EventPlanner aggregateRating/Review yok; meta desc ~171; servis .html sayfalarında Service/BreadcrumbList + benzersiz OG eksik; robots minimal.',
  },
]

const DIMENSIONS = [
  {
    key: 'indexation',
    focus: 'Indexation & crawl: robots.txt (Allow/Disallow, Sitemap satırı), sitemap.xml (URL sayısı+kapsam, lastmod, noindex çelişkisi), <link rel=canonical> (self mi, cross-domain mi), <meta name=robots>, X-Robots-Tag header, http→https + www→non-www yönlendirme (301/308), gereksiz redirect zinciri, 404→301 kurtarma, duplicate/alias domain.',
  },
  {
    key: 'onpage',
    focus: 'On-page & content: <title> (uzunluk, keyword, benzersizlik), meta description (KARAKTER SAYISI — 155 üstü kesik say), H1 tekliği, H2/H3 hiyerarşisi (VARLIĞI), keyword hedefleme, iç-linkleme, görsel alt metni, anchor metinleri, thin/duplicate içerik.',
  },
  {
    key: 'structured-data',
    focus: 'Structured data (JSON-LD): mevcut @type envanteri, VALIDITY (zorunlu alanlar), Organization/LocalBusiness tamlığı, BreadcrumbList her sayfada mı, FAQPage, aggregateRating/Review FIRSATI (yalnız gerçek görünür puanla — sahtesi ceza), sameAs, ImageObject/logo doğru URL mi (404 mü), Offer/Product, Service.',
  },
  {
    key: 'perf-security',
    focus: 'Performance & security & social: response header (Cache-Control, HSTS, CSP, X-Frame-Options, X-Content-Type-Options), preconnect/dns-prefetch, font display:swap/preload, LCP riski (büyük görsel/CSS), OG/Twitter kartları (og:image mevcut+doğru marka+1200x630), PWA manifest, <meta viewport>, image format (webp/avif).',
  },
  {
    key: 'local-intl',
    focus: 'Local & international: hreflang (tr-TR + x-default), LocalBusiness geo/areaServed/openingHours, GBP/harita sinyali, şehir/ilçe hedefleme, adres/telefon tutarlılığı (NAP), uluslararası genişleme hazırlığı. Ulusal marka için şehir-hub içerik fırsatı.',
  },
]

const PAIRS = []
for (const p of PROJECTS) for (const d of DIMENSIONS) PAIRS.push({ p, d })

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
          category: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string', description: 'Somut kanıt: canlı sinyal (curl çıktısı) veya dosya:satır' },
          fix: { type: 'string' },
          acceptance: { type: 'string', description: 'Kabul kriteri' },
          verify: { type: 'string', description: 'Doğrulama komutu/yöntemi' },
          location: { type: 'string', description: 'URL veya dosya yolu' },
        },
        required: ['priority', 'category', 'title', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    real: { type: 'boolean' },
    status: { type: 'string', enum: ['open', 'already-fixed', 'false-positive'] },
    correctedPriority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
    note: { type: 'string' },
  },
  required: ['real', 'status', 'note'],
}

function auditPrompt(p, d) {
  const codeBlock = p.codePath
    ? `\nKOD ERİŞİMİ VAR: ${p.repoNote}\nİlgili dosyaları OKU (Read/Grep): src/app/layout.jsx, src/app/sitemap.xml/route.js, src/app/robots.js, src/app/servicePageMetadata.js, src/app/djs/[slugOrId]/layout.jsx, src/app/blog/[slug]/page.jsx, src/lib/brand/config.js, next.config.mjs. Bu marka = ${p.brand}. Kod + canlı BİRLİKTE denetle.\nÇalışma dizini: ${p.codePath}\n`
    : `\nKOD YOK — yalnız CANLI denetim. Statik/harici site.\n`
  return `Sen kıdemli teknik SEO denetçisisin (seo-webdev-designer). TEK proje, TEK boyut denetle ve SOMUT bulgu çıkar.

PROJE: ${p.name} — https://${p.domain}  (${p.stack})
BOYUT: ${d.key.toUpperCase()}
ODAK: ${d.focus}
${codeBlock}
BASELINE (bunları DOĞRULA — hâlâ geçerli mi? — VE bu boyutta YENİ bulgular ekle):
${p.baseline}

YÖNTEM (mutlaka CANLI kontrol yap, ezberden yazma):
- Bash curl ile canlı çek. Örnekler:
  curl -s -m 20 -L https://${p.domain}/ -o /tmp/h.html   (title/desc/canonical/robots/hreflang/og/h1/h2/h3/JSON-LD/img-alt için grep -io)
  curl -s -m 15 -D - -o /dev/null https://${p.domain}/    (response header'lar)
  curl -s -m 12 -o /dev/null -w '%{http_code} %{redirect_url}' http://${p.domain}/   (redirect)
  curl -s -m 12 -o /dev/null -w '%{http_code} %{redirect_url}' https://www.${p.domain}/
  curl -s https://${p.domain}/robots.txt ; curl -s https://${p.domain}/sitemap.xml | grep -c '<loc>'
- Sitemap'teki alt sayfaları da örnekle (özellikle Nextrez sektör landing'leri, Burcuevent servis .html'leri).
- Meta description'ları KARAKTER say (155 üstü = P2 kesik bulgu).
- JSON-LD bloklarını çıkar, @type envanteri + eksik zorunlu alan + aggregateRating fırsatı değerlendir.
- Her bulgu için: priority (P0 kritik/index-kırık, P1 sıralama-CTR kaybı, P2 iyileştirme), category, title, evidence (GERÇEK curl çıktısı veya dosya:satır — uydurma değil), fix, acceptance, verify (komut), location.

KURAL: aggregateRating/Review sadece GERÇEK görünür puanla önerilir; sahtesi ceza — bunu fix'te belirt.
Yalnız bu boyuta ait bulguları döndür. Bulgu yoksa boş findings döndür. Şişirme; her bulgu gerçek ve kanıtlı olsun.`
}

function verifyPrompt(f) {
  return `Sen düşmanca (adversarial) SEO doğrulayıcısısın. Amaç: bu bulguyu ÇÜRÜTMEYE çalış. Şüpheci ol.

PROJE: ${f.project} — https://${f.domain}
BULGU: [${f.priority}] ${f.title}
KANIT (iddia): ${f.evidence}
ÖNERİLEN FIX: ${f.fix}
KONUM: ${f.location || '-'}

YAP:
- CANLI curl ile bizzat kontrol et (site zaten düzeltmiş olabilir → already-fixed). Örn:
  curl -s -m 20 -L https://${f.domain}/... | grep -i ...
  curl -s -m 15 -D - -o /dev/null https://${f.domain}/... (header)
- Kod-tabanlı bulguysa ve /home/user/ankaradjparty-frontend-v2 altındaysa dosyayı OKU ve teyit et.
- Değerlendir: real (gerçek+aksiyon alınabilir mi), status (open / already-fixed / false-positive), correctedPriority (gerekirse), note (kısa gerekçe + gördüğün gerçek sinyal).

Şüphede kal: kanıt canlıda doğrulanamıyorsa real=false. Abartılı priority'yi düşür.`
}

function synthPrompt(p, findings) {
  const list = JSON.stringify(findings, null, 1)
  return `Sen SEO backlog editörüsün. Aşağıdaki DOĞRULANMIŞ bulgulardan tek projenin backlog markdown'ını YENİDEN yaz ve dosyaya YAZ.

PROJE: ${p.name} — ${p.domain}
STACK: ${p.stack}
${p.repoNote}

DOĞRULANMIŞ BULGULAR (JSON; status: open/already-fixed; false-positive'ler zaten elendi):
${list}

İSTENEN ÇIKTI — şu formatta Markdown (Türkçe), Write ile şu dosyaya yaz: ${SCRATCH}/backlog_${p.slug}.md

Format:
# ${p.name} — ${p.domain}
(1-2 satır: stack, repo durumu, genel değerlendirme emoji ✅/🟡/🔴)

## Canlı doğrulama (2026-07-04)
- (denetimde görülen güçlü sinyaller: canonical, hreflang, JSON-LD @type'lar, sitemap URL sayısı, güvenlik header'ları, redirect'ler — kısa madde madde)

---
Sonra her bulgu için (priority sırası P0>P1>P2, her boyuttan gruplanmış):
## <P1-x> · <title>
- **Kanıt:** ...
- **Düzeltme:** ...
- **Kabul kriteri:** ...
- **Doğrulama:** <komut>
- **Durum:** [ ]   (status already-fixed ise [x] ve sonuna "(canlıda düzeltilmiş)")

Kurallar:
- Sadece real bulgular. aggregateRating maddelerinde "yalnız gerçek görünür puanla" uyarısını koru.
- Bulguları mantıklı ID'le (P1-1, P1-2, P2-1...). Kısa, aksiyon-odaklı, kanıtlı.
- Dosyayı yazdıktan sonra tek satır özet döndür: "<slug>: N madde (x P1, y P2)".`
}

// ---- run ----
phase('Audit')
const audit = await parallel(
  PAIRS.map((pd, i) => () =>
    agent(auditPrompt(pd.p, pd.d), {
      label: `${pd.p.slug}:${pd.d.key}`,
      phase: 'Audit',
      schema: FINDINGS_SCHEMA,
    }).then((r) => ({ pd, findings: (r && r.findings) || [] }))
  )
)

// flatten + tag project
const flat = []
for (const a of audit.filter(Boolean)) {
  for (const f of a.findings) {
    flat.push({ ...f, project: a.pd.p.name, slug: a.pd.p.slug, domain: a.pd.p.domain, dim: a.pd.d.key })
  }
}
log(`Audit bitti: ${flat.length} ham bulgu (${PAIRS.length} denetçi).`)

phase('Verify')
const verified = await parallel(
  flat.map((f) => () =>
    agent(verifyPrompt(f), { label: `verify:${f.slug}:${(f.title || '').slice(0, 24)}`, phase: 'Verify', schema: VERDICT_SCHEMA })
      .then((v) => ({ ...f, verdict: v || { real: false, status: 'false-positive', note: 'verify null' } }))
  )
)
const kept = verified.filter((f) => f.verdict && f.verdict.real && f.verdict.status !== 'false-positive')
  .map((f) => ({ ...f, priority: f.verdict.correctedPriority || f.priority, status: f.verdict.status }))
log(`Verify bitti: ${kept.length}/${flat.length} bulgu doğrulandı (kalanlar elendi/false-positive).`)

phase('Synthesize')
const synth = await parallel(
  PROJECTS.map((p) => () => {
    const fs = kept.filter((f) => f.slug === p.slug)
    return agent(synthPrompt(p, fs), { label: `synth:${p.slug}`, phase: 'Synthesize' })
  })
)

phase('Consolidate')
const counts = PROJECTS.map((p) => ({
  slug: p.slug, name: p.name, domain: p.domain,
  p0: kept.filter((f) => f.slug === p.slug && f.priority === 'P0').length,
  p1: kept.filter((f) => f.slug === p.slug && f.priority === 'P1').length,
  p2: kept.filter((f) => f.slug === p.slug && f.priority === 'P2').length,
}))
const consolidatePrompt = `Sen backlog konsolidatörüsün. 4 projenin backlog md'leri şurada yazıldı: ${SCRATCH}/backlog_{ankaradj,hangises,nextrez,burcuevent}.md — hepsini OKU.

Sonra İKİ dosya YAZ (Write):

1) ${SCRATCH}/BACKLOG.md — Konsolide öncelik tablosu.
   Başlık "# Konsolide Backlog — Öncelik Sıralı", "Son güncelleme: 2026-07-04".
   "## P0", "## P1", "## P2" bölümleri; her bölümde tablo: | # | Proje | Aksiyon | Konum | Durum |
   Maddeleri 4 proje md'sinden topla. Sonda özet sayaç.
   Proje bazlı sayılar (ipucu): ${JSON.stringify(counts)}

2) ${SCRATCH}/README.md — Repo README.
   "# SEO Yapılacaklar — Backlog", proje tablosu (Proje|Domain|Altyapı|Repo|Dosya), kullanım, öncelik ölçeği (P0/P1/P2), altın kural (aggregateRating yalnız gerçek görünür puanla).
   Projeler: Ankaradj=ankaradjparty.com (ankaradjparty-frontend-v2); Hangises=hangises.com (aynı codebase); Nextrez=nextrez.com.tr (harici); BK Organizasyon=burcuevent.tr (ihsanyurekli0-cpu/burcuevent PRIVATE, yedekli).
   Not: bkorganizasyon.com.tr alias → burcuevent.tr; nextrez.com satılık park → nextrez.com.tr.

İki dosyayı yazınca tek satır özet döndür.`
const consolidate = await agent(consolidatePrompt, { label: 'consolidate', phase: 'Consolidate' })

return {
  rawFindings: flat.length,
  kept: kept.length,
  counts,
  synthSummaries: synth,
  consolidate,
}
