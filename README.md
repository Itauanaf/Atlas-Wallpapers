# ATLAS — landing page

Landing page estática e responsiva para uma coleção premium de wallpapers.

Os previews publicados ficam em `assets/collection/` e possuem marca-d’água
incorporada. Os arquivos originais enviados permanecem intactos em `F:\`.

## Abrir localmente

```powershell
python -m http.server 4173
```

Depois, acesse `http://localhost:4173`.

## Antes de publicar

- Troque os preços e URLs de checkout em `index.html` / `script.js`.
- Substitua os seis depoimentos marcados como `Placeholder` por relatos autorizados.
- Atualize domínio canônico, e-mail de suporte, links legais e política de garantia.
- Vincule `window.trackAtlasPurchase(...)` à confirmação do gateway de pagamento.

Os eventos `view_landing_page`, `click_hero_cta`, `view_gallery`,
`click_gallery_image`, `use_before_after`, `view_pricing`, `select_plan`,
`begin_checkout` e `purchase` são enviados para `window.dataLayer`.
