# Changelog — Astrólogo Frontend

## [v02.17.04] - 2026-03-31
### Corrigido
- **Compliance - GNU AGPLv3**: corrigido erro 404 no invólucro do arquivo LICENSE, publicando o texto integral da licença (~34KB) em conformidade técnica e jurídica.

### Controle de versão
- "astrologo-app": APP v02.17.03   APP v02.17.04

## [v02.17.03] — 2026-03-31
### Alterado
- **Fluxo indireto `preview` padronizado**: branch operacional `preview` adotado no monorepo para promoções consistentes para `main`.
- **Automação de promoção**: workflow `.github/workflows/preview-auto-pr.yml` adicionado/atualizado para abrir/reusar PR `preview -> main`, habilitar auto-merge e tentar merge imediato quando elegível.
- **Permissões do GitHub Actions**: ajuste para permitir criação/aprovação de PR por workflow, eliminando falhas 403 operacionais.

### Controle de versão
- `astrologo-frontend`: APP v02.17.02 → APP v02.17.03

## [v02.17.02] — 2026-03-29
### Alterado
- **CI/CD branch standardization**: workflow de deploy do monorepo `astrologo-app` padronizado para publicar no branch `main` na Cloudflare Pages, com trigger GitHub em `main` e `concurrency.group` atualizado para `deploy-main`.

### Controle de versão
- `astrologo-frontend`: APP v02.17.01 → APP v02.17.02

## [v02.17.01] — 2026-03-27
### Corrigido
- **Acessibilidade e UX**: adicionados atributos de autocompletar (`name`, `tel-national`, `email`) e formatador/máscara de telefone (`formatPhone`) aos inputs do Modal de Contato para garantir paridade com o Oráculo Financeiro.

## [v02.17.00] — 2026-03-27
### Adicionado
- Autenticação por e-mail e token (OTP) implementada para acesso unificado e proteção dos dados do usuário.
- Fluxo completo para salvar, resgatar e excluir dados associados ao seu e-mail de forma segura (`astrologo_user_data` e `astrologo_mapas`).
- Modal de Contato integrado via API Resend, com paridade aos demais sistemas.
- Gerenciamento de sessão persistente no client interligado ao UUID de autenticação de 60 minutos D1.

## [v02.16.00] — 2026-03-24
### Alterado
- Migração de D1 para `bigdata_db` com tabelas prefixadas (`astrologo_mapas`, `astrologo_api_rate_limits`, `astrologo_rate_limit_policies`)
- Rotas de rate limit migradas para namespace contextual (`astrologo/calcular`, `astrologo/analisar`, `astrologo/enviar-email`)

### Infra
- `wrangler.json` atualizado para `bigdata_db` (binding `BIGDATA_DB`)
- Versionamento consolidado para `APP v02.16.00` + `package.json` 2.16.0

## [v02.15.01] — 2026-03-24
### Corrigido
- Persistência da análise de IA na D1 com fallback quando a coluna `data_analise` não existe no schema
- Restauração no admin normalizada ao garantir gravação de `analise_ia` no registro

## [v02.15.00] — 2026-03-23
### Corrigido
- Reinserção obrigatória de emojis e símbolos pictóricos (astros, signos, orixás, esotérico) no prompt da IA, que haviam desaparecido após o upgrade do modelo Gemini

## [v02.14.00] — 2026-03-22
### Alterado
- Upgrade Gemini API: modelo gemini-pro-latest, endpoint v1beta, thinkingLevel HIGH, safetySettings, retry
- Padronização do sistema de versão para formato APP v00.00.00
- Cabeçalho de código adicionado (App.tsx e analisar.ts)
- Correção de duplicação de prefixo "APP v" no footer, email e WhatsApp

## [v02.13.00] — Anterior
### Histórico
- Versão anterior à padronização do controle de versão
