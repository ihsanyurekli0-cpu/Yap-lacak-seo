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
  Tetik: trig_01MiZXgduAbsWyXP5RZesgNx (poke-only, yeni-oturum modu, push bildirimi açık)
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

- ID: `trig_01MiZXgduAbsWyXP5RZesgNx` · mod: `create_new_session_on_fire=true` · bildirim: push
- Prompt özeti: Yap-lacak-seo'yu ekle-oku (BACKLOG + TAVSIYELER A1..A9) → ankaradjparty-frontend-v2'de
  A1 aggregateRating, A2 sitemap pagination, A3 OG swap, A4 brand logo, A5 desc 155ch →
  dal `claude/seo-p1-fixes`, DRAFT PR, backlog kutularını [x] + PR linki, `run/OTURUM-KAYDI.md`
  Faz-2 kutularını [x], kısa özet raporu.

## ✅ Bitiş kontrol listesi

### Faz 1 — Denetim (ana oturum kapatır)
- [x] Workflow başlatıldı (wf_ab12bff1-eb4)
- [x] TAVSIYELER.md yazıldı + push
- [x] Tetik kuruldu (Faz 2 otomasyonu)
- [x] Export: script + pano + oturum kaydı repoya push
- [ ] Workflow tamamlandı (20 audit + verify + synth + consolidate)
- [ ] Güncel backlog'lar (projects/*.md + BACKLOG.md + README.md) bu repoya push edildi
- [ ] Pano final durumuna güncellendi (`run/pano.html` + Artifact)
- [ ] Tetik ateşlendi → Faz 2 oturumu başladı

### Faz 2 — Uygulama (tetiklenen oturum kapatır)
- [ ] A1 aggregateRating uygulandı (djs/[slugOrId]/layout.jsx)
- [ ] A2 sitemap pagination uygulandı (sitemap.xml/route.js)
- [ ] A3 markalı OG swap uygulandı (servicePageMetadata.js)
- [ ] A4 brand-aware logo uygulandı (layout.jsx)
- [ ] A5 description ~155ch (config.js) — vakit kalırsa
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
