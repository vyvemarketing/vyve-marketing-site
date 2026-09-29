# VYVE Marketing — site e campanha de reativação

Entrega com site institucional estático e campanha de nove posts para Instagram.

## Estrutura

- `index.html`, `styles.css`, `script.js`: site publicado no GitHub Pages.
- `assets/brand/`: identidade visual oficial da VYVE.
- `assets/generated/`: imagens conceituais originais da campanha.
- `instagram/artes/`: arquivos PNG prontos para publicar.
- `instagram/fontes/posts.html`: fonte editável das artes.
- `instagram/PLANO_DE_CONTEUDO.md`: legendas, sequência e cadência.
- `instagram/ROTEIROS_REELS.md`: seis roteiros de vídeo.

## Visualizar localmente

Abra `index.html` no navegador ou execute:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Reexportar as artes

```bash
node render-posts.js
```

O script usa o Chromium já instalado no ambiente local e exporta nove imagens em 1080 × 1080.

## Atualizações antes de campanhas pagas

- Confirmar o @ oficial do Instagram.
- Adicionar WhatsApp comercial ao botão principal, se desejado.
- Instalar Google Analytics 4 e Meta Pixel após criar/confirmar as contas.
- Adicionar política de privacidade antes de usar formulários ou pixels.
