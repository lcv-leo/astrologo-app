# Astrologo App

Monorepo com dois apps Vite + React + TypeScript:

- `astrologo-frontend` (público): **https://mapa-astral.lcv.app.br**
- `astrologo-admin` (admin): **https://admin-astrologo.lcv.app.br**

> O admin é protegido por Cloudflare Access.

## Estrutura

- `astrologo-frontend/` — app público e funções API de cálculo/análise/envio
- `astrologo-admin/` — painel administrativo e funções API admin
- `schema.sql` — schema base do D1
- `migrations/` — migrações incrementais/idempotentes

## Setup rápido

1. Preencha o arquivo `.env` na raiz.
2. Instale dependências em cada app:
   - `astrologo-frontend`: `npm install`
   - `astrologo-admin`: `npm install`

## Comandos úteis

### Frontend

- `npm run lint`
- `npm run test`
- `npm run build`

### Admin

- `npm run lint`
- `npm run build`

## Segurança e CSP

- CORS restrito a origens `https://*.lcv.app.br` nas APIs.
- Headers de segurança servidos via `public/_headers` em cada app.
- CSP contempla Cloudflare Insights (`static.cloudflareinsights.com`) para evitar bloqueios de beacon.

## Rate limiting (fase 3)

As rotas sensíveis usam tabela D1 de janela deslizante simples por chave hash (`rota + IP + user-agent`).

### Migração idempotente

Arquivo:

- `migrations/001_add_api_rate_limits.sql`

Cria (se não existir):

- tabela `api_rate_limits`
- índices `idx_api_rate_limits_route_window` e `idx_api_rate_limits_updated_at`

## Observações operacionais

- O fallback de origem CORS no frontend é `https://mapa-astral.lcv.app.br`.
- O fallback de origem CORS no admin é `https://admin-astrologo.lcv.app.br`.
