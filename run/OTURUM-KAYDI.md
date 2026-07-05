# Oturum Kaydı — SEO Denetim + Uygulama Zinciri (2026-07-04)

Bu dosya zincirin **kalıcı kaydı**dır. Konteyner uçucu → önemli her şey bu repoya push edilir.
Kural: **yarım iş kalmaz** — aşağıdaki kontrol listesi tamamen [x] olmadan zincir bitmiş sayılmaz.

## Zincir şeması

```
FAZ 1 · DENETİM (bu oturum)
  Workflow: seo-audit-4-projects (runId: wf_ab12bff1-eb4)
  20 denetçi (4 proje × 5 boyut) → adversarial verify → sentez → konsolidasyon
        │ bitince
        ▼
  Ana oturum: backlog md'lerini bu repoya push + pano final + tetiği ateşle
        │ fire_trigger
        ▼
FAZ 2 · UYGULAMA (otomatik yeni oturum)
  Tetik: trig_01WGgXUhY3tULigsD7hSJsKv (v2, poke-only, yeni-oturum modu, push bildirimi açık)
  P1 kod düzeltmeleri → claude/seo-p1-fixes dalı → DRAFT PR → backlog [x] işaretleme
```

## Kalıcı varlıklar (export edilenler)

| Varlık | Yer |
|---|---|
| Denetim workflow scripti | `run/seo_audit_wf.js` (bu repo) |
| Canlı ilerleme panosu (HTML) | `run/pano.html` + https://claude.ai/code/artifact/46d72cf8-829c-4812-87cd-94fbf4f89888 |
| Proje backlog'ları | `projects/*.md` (workflow bitince güncellenir) |
| Konsolide öncelikler | `BACKLOG.md` |
| Hazır kod + strateji | `TAVSIYELER.md` |
| Denetim ilk raporu | ankaradjparty-frontend-v2 → `docs/SEO_AUDIT_2026-07.md` (PR #1) |
| Kalıcı proje hafızası | ankaradjparty-frontend-v2 → `CLAUDE.md` (PR #1) |

## Tetik yedeği (silinse bile yeniden kurulabilir)

- ID: `trig_01WGgXUhY3tULigsD7hSJsKv` (v2 — denetim SONRASI gerçek önceliklerle yeniden kuruldu;
  eski `trig_01MiZXgduAbsWyXP5RZesgNx` A1-A5 varsayımına dayanıyordu, artık GEÇERSİZ/silindi)
- mod: `create_new_session_on_fire=true` · bildirim: push
- Prompt özeti: Yap-lacak-seo'yu ekle-oku (BACKLOG.md + projects/ankaradj.md + projects/hangises.md)
  → ankaradjparty-frontend-v2'de doğrulanmış 3 P1'i uygula: (1) Ankaradj Organization/publisher logosu
  `layout.jsx:225` (+blog publisher.logo) `brand.logoUrl`'a çevir, (2) Hangises `/equipment` H1 +
  `equipment-schema.js` marka-koşullu yap (ulusal markada "Ankara" hardcode kaldır), (3) Hangises
  DJ liste şeması (`djs/layout.jsx:137-152`) profil sayfalarına sızıyor → `djs/page.jsx`'e taşı.
  Vakit kalırsa P2 hızlı kazanımlar: aggregateRating (P2-11 ankaradj/hangises benzeri), sitemap
  DJ pagination, markalı OG swap, `layout.jsx:363-366` preconnect `!isAnkaradj` ters koşulu.
  Dal `claude/seo-p1-fixes`, DRAFT PR, backlog kutularını [x] + PR linki, `run/OTURUM-KAYDI.md`
  Faz-2 kutularını [x], kısa özet raporu.

## ✅ Bitiş kontrol listesi

### Faz 1 — Denetim (ana oturum kapatır)
- [x] Workflow başlatıldı (wf_ab12bff1-eb4)
- [x] TAVSIYELER.md yazıldı + push
- [x] Tetik kuruldu (Faz 2 otomasyonu) — v1, sonra v2 ile düzeltildi
- [x] Export: script + pano + oturum kaydı repoya push
- [x] Workflow tamamlandı (20 audit + 79 verify + 4 synth + consolidate; 104 agent, 0 hata)
- [x] Güncel backlog'lar (projects/*.md + BACKLOG.md + README.md) bu repoya push edildi
      → 4 proje, 75 doğrulanmış madde (P0=0, P1=3, P2=72)
- [x] Pano final durumuna güncellendi (`run/pano.html` + Artifact)
- [x] Tetik DÜZELTİLDİ (v2 — gerçek doğrulanmış P1'lerle) ve ateşlendi → Faz 2 oturumu başladı

### Faz 2 — Uygulama (tetiklenen oturum kapatır)
- [ ] P1-1: Ankaradj logo düzeltmesi (`layout.jsx:225` + blog publisher.logo) → brand.logoUrl
- [ ] P1-2: Hangises `/equipment` H1 + `equipment-schema.js` marka-koşullu (Ankara hardcode kaldır)
- [ ] P1-3: Hangises DJ liste şeması `djs/layout.jsx` → `djs/page.jsx`'e taşı (profil sızıntısı fix)
- [ ] (vakit kalırsa) P2 hızlı kazanımlar: aggregateRating, sitemap pagination, OG swap, preconnect ters-koşul
- [ ] DRAFT PR açıldı (claude/seo-p1-fixes → main): PR linki buraya: ______
- [ ] Backlog maddeleri [x] işaretlendi + PR linkleri eklendi
- [ ] Bu listenin Faz-2 kutuları [x] yapılıp push edildi

### Kapanış (insan kararı — İhsan)
- [ ] PR #1 (denetim raporu) gözden geçir → merge/kapat
- [ ] P1-fixes PR'ı gözden geçir → merge
- [ ] Nextrez + Burcuevent düzeltmeleri için ayrı oturum planla (kodları bu ortamda değildi)

> Yarım kalırsa kurtarma: workflow ölürse `Workflow({scriptPath: run/seo_audit_wf.js, resumeFromRunId: "wf_ab12bff1-eb4"})`
> ile kaldığı yerden devam eder (biten agent'lar cache'ten döner). Tetik kaybolursa yukarıdaki
> yedekten aynı prompt'la yeniden kurulur.
