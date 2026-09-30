# VYVE Marketing — site e campanha de reativação

Entrega com site institucional estático e campanha de nove posts para Instagram.

## Estrutura

- `index.html`, `styles.css`, `script.js`: site publicado no GitHub Pages.
- `assets/brand/`: identidade visual oficial da VYVE.
- `assets/clients/`: marcas do portfólio e projetos anteriores.
- `assets/fonts/`: tipografia hospedada no próprio site para carregamento rápido.
- `assets/generated/`: imagens conceituais originais da campanha.
- `assets/platforms/`: logos vetoriais das plataformas e ícone de contato.
- `blog/`: hub editorial e dez guias SEO segmentados por intenção de busca.
- `instagram/artes/`: arquivos PNG prontos para publicar.
- `instagram/artes-v2/`: segundo lote de nove criativos, com provas de resultado, oferta e tipografia mais legível.
- `instagram/fontes/posts.html`: fonte editável das artes.
- `instagram/PLANO_DE_CONTEUDO.md`: legendas, sequência e cadência.
- `instagram/PLANO_DE_CONTEUDO_V2.md`: legendas e ordem de publicação da campanha atualizada.
- `instagram/ROTEIROS_REELS.md`: seis roteiros de vídeo.

O site registra o histórico consolidado de 67 marcas atendidas, mais de R$ 1,7 milhão gerenciado em mídia, mais de 369 mil leads gerados e mais de R$ 7 milhões faturados pelos clientes nos projetos acompanhados. O portfólio apresenta uma seleção de nove identidades autorizadas em carrossel contínuo.

O site também oferece uma frente personalizada para infoprodutores, apresenta a experiência profissional de Eros e inclui `robots.txt`, `sitemap.xml` e dados estruturados de artigo. Ao conectar um domínio próprio, substitua as URLs canônicas e do sitemap pelo novo domínio antes de solicitar indexação no Google Search Console.

## Visualizar localmente

Abra `index.html` no navegador ou execute:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Validação do site

Com um servidor local ativo na porta `4179`, execute:

```bash
node qa-site.js
```

O teste cobre desktop, tablet e mobile, menu responsivo, imagens, links, métricas, overflow horizontal e acessibilidade WCAG com axe-core.

## Reexportar as artes

```bash
node render-posts.js
```

O script usa o Chromium já instalado no ambiente local e exporta nove imagens em 1080 × 1080.

Para exportar a campanha V2 e sua prévia em mosaico:

```bash
node render-posts-v2.js
```

## Atualizações antes de campanhas pagas

- Instagram oficial registrado: [`@vyve_marketing`](https://www.instagram.com/vyve_marketing/).
- Registrar `@vyve_marketing` também no TikTok para manter consistência entre as redes.
- Instalar Google Analytics 4 e Meta Pixel após criar/confirmar as contas.
- Adicionar política de privacidade antes de usar formulários ou pixels.
