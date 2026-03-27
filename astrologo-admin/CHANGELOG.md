# Changelog — Astrólogo Admin

## [v02.17.00] — 2026-03-27
### Adicionado
- **Seleção de Modelos de IA**: Interface de configuração para definir o modelo Gemini ativo na síntese astrológica, com paridade de arquitetura ao admin-app/Oráculo. O modelo escolhido é salvo no cache local (`localStorage`) e lido no disparo das análises.

## [v02.16.00] — 2026-03-26
### Adicionado
- **Botões flutuantes de rolagem**: FABs (Voltar ao topo / Ir para o final) com `ArrowUp`/`ArrowDown` do lucide-react. Aparecem dinamicamente conforme posição de scroll (threshold 200px). Design tiptap.dev (branco, circular, hover Google Blue). Paridade com admin-app e mainsite-frontend.

## [v02.15.01] — 2026-03-26
### Corrigido
- **Notification.css**: classes CSS não correspondiam aos nomes do componente `Notification.tsx` (`notification-toast` → `notification`, `notification-icon` → removido, etc.). Toast aparecia sem estilização. Classes alinhadas: `notification`, `notification-body`, `notification-close`, `notification-progress`, `notification-container-desktop/mobile`.

## [v02.15.00] — 2026-03-26
### Alterado
- **UI/UX Redesign (tiptap.dev, Google Blue)**: design completo reescrito seguindo design language do tiptap.dev
- **Tailwind CSS removido**: todo CSS convertido para vanilla com classes semânticas (~700 linhas)
- Background: warm gray `#f5f4f4`. Cards: sólido `#ffffff`, shadow `0 1px 3px`
- Botões: pill preto (`border-radius: 100px`) com hover Google Blue `#1a73e8`
- Inputs: `border-radius: 10px`, focus ring Google Blue
- Tipografia Inter via Google Fonts com `letter-spacing: -0.02em` em headings
- Orbs decorativos sutis (`opacity: 0.20, blur: 120px`)
- Toast notifications: dark pill, bottom-right, blur backdrop
- Favicon: SVG admin customizado (gear + monitor) em Google Blue `#1a73e8`

### Adicionado
- WCAG/eMAG: `focus-visible` outlines `#1a73e8`, `prefers-reduced-motion`, `sr-only`, skip-link semântico
- `<meta name="theme-color">` para consistência visual
- Form fields: `id`, `name`, `autoComplete` validados em todos os inputs

### Removido
- Dependência do Tailwind CSS (`@import "tailwindcss"`)
- Glassmorphism pesado (backdrop-filter em cards)
- Gradientes de background radiais

## [v02.14.01] — 2026-03-26
### Removido
- **`_headers`**: arquivo removido — admins não precisam de CSP nem controles de cache (Cloudflare Access protege o app). Cache gerenciado nativamente pelo Cloudflare.

## [v02.14.00] — 2026-03-24
### Alterado
- Migração de D1 para `bigdata_db` com tabelas prefixadas (`astrologo_mapas`, `astrologo_rate_limit_policies`)
- Ajuste de compatibilidade do painel para rotas contextualizadas de rate limit (`astrologo/calcular`, `astrologo/analisar`, `astrologo/enviar-email`)

### Infra
- `wrangler.json` atualizado para `bigdata_db` (binding `BIGDATA_DB`)
- Versionamento atualizado para `ADMIN_VERSION` 2.14.0 + `package.json` 2.14.0

## [v01.00.00] — 2026-03-22
### Adicionado
- Indicador visual de registro selecionado na lista
- Entrada inicial no sistema de controle de versão

## Anterior
### Histórico
- Painel administrativo do Oráculo Celestial
