# Changelog — Astrólogo Frontend

## [v02.17.14] - 2026-04-10
### Adicionado
- **Biome 2.x**: lint + format com organizeImports

### Alterado
- **vite**: 8.0.7 → 8.0.8
- **vitest**: 4.1.2 → 4.1.4
- **lucide-react**: 1.7.0 → 1.8.0
- **Dependabot groups**: @vitest/* e @biomejs/* adicionados

## [v02.17.13] - 2026-04-08
### Atualização Tecnológica
- **ESLint 9 → 10**: Migração para `eslint@10.2.0` e `@eslint/js@10.0.1`.
- **`.npmrc`**: Criado com `legacy-peer-deps=true` para resolver conflito `eslint-plugin-react-hooks@7` ↔ ESLint 10.

### Corrigido
- **`_middleware.ts`**: `context: any` substituído por tipagem estrutural `{ request: Request; next: () => Promise<Response> }` — resolve `no-explicit-any`.
- **`calcular.ts`**: Removidas 3 atribuições iniciais mortas (`isDay`, `minsFromStart`, `periodDurationMins`) que jamais eram lidas (regra `no-useless-assignment` do ESLint 10).

### Controle de versão
- `astrologo-frontend`: APP v02.17.12 → APP v02.17.13

## [v02.17.12] - 2026-04-07
### Segurança
- **Vite 8.0.3 → 8.0.7**: Correção de 3 CVEs de severidade alta/média.

### Controle de versão
- `astrologo-frontend`: APP v02.17.11 → APP v02.17.12
## [v02.17.11] - 2026-04-06
### Adicionado
- **Cross-Service AI Telemetry**: Implementação de `logAiUsage` em `analisar.ts` para registro de tokens, latência e status no `ai_usage_logs` (D1).
### Alterado
- **Compatibility Date**: `wrangler.json` atualizados para `2026-04-06`.
### Controle de versão
- `astrologo-app`: APP v02.17.10 → APP v02.17.11

## [v02.17.10] - 2026-04-06
### Corrigido
- **Renderização HTML da Síntese (IA)**: Root cause identificado e corrigido em `sanitizeGeneratedHtml()` no backend `analisar.ts`. A função chamava `escapeHtml()` no conteúdo HTML retornado pelo Gemini, convertendo `<p>`, `<strong>` etc. em `&lt;p&gt;`, `&lt;strong&gt;` — exibindo tags cruas como texto visível ao invés de elementos formatados. Substituído por sanitizador baseado em whitelist de tags (`p`, `strong`, `ul`, `li`, `em`, `b`, `i`, `h1`-`h3`, `br`) com suporte a `style` para `text-align`/`text-indent`.
- **Frontend DOMPurify — style attributes**: Adicionado `'style'` ao `ALLOWED_ATTR` do `sanitizeRichHtml` em `App.tsx`, permitindo que estilos de alinhamento gerados pelo Gemini sobrevivam à sanitização no browser.
- **Persistência de análise IA nos dados de usuário**: O fluxo de salvamento na nuvem ("Salvar na Nuvem") agora inclui `analiseIa` no objeto de mapa salvo (`{ ...result, analiseIa }`), corrigindo a ausência da Síntese do Mestre (IA) na aba "Dados de Usuários" do admin-app.
- **Migração D1 — dados históricos**: Executada migração em produção para reverter `&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#39;` em 2 registros existentes na tabela `astrologo_mapas.analise_ia` e limpar tags `<p>` duplicadas residuais do algoritmo anterior.

### Removido
- Função `escapeHtml()` obsoleta removida de `analisar.ts` (sem uso após refatoração).

### Controle de versão
- `astrologo-app`: APP v02.17.09 → APP v02.17.10

## [v02.17.09] - 2026-04-04
### Resolvido
- **Infraestrutura IA**: Restabelecimento da comunicação das chamadas e análises cósmicas solucionando o erro 500 do backend ao adotar hardcode literal 'gemini-pro-latest' como fallback model, impedindo payload strings vazias.
- **Cloudflare Environment**: Sincronização e injeção do binding `RESEND_API_KEY` mapeado via Secrets Store nativo.

## [v02.17.08] - 2026-04-02
### Controle de versão
- `astrologo-app`: APP v02.17.07 → APP v02.17.08

## [v02.17.09] - 2026-04-04
### Resolvido
- **Infraestrutura IA**: Restabelecimento da comunicação das chamadas e análises cósmicas solucionando o erro 500 do backend ao adotar hardcode literal 'gemini-pro-latest' como fallback model, impedindo payload strings vazias.
- **Cloudflare Environment**: Sincronização e injeção do binding `RESEND_API_KEY` mapeado via Secrets Store nativo.

## [v02.17.07] - 2026-04-01
### Adicionado
- **Configuração de IA Dinâmica (Paridade D1)**: Função serverless `analisar.ts` agora consome a configuração `astrologo-config` nativamente a partir da tabela `admin_config_store` (`BIGDATA_DB`), obedecendo ao que for definido no Admin App, com fallback seguro para \`gemini-2.5-flash\`. O hardcode de modelos (ex: \`gemini-pro-latest\`) foi permanentemente abolido.

### Controle de versão
- `astrologo-app`: APP v02.17.06 → APP v02.17.07

## [v02.17.09] - 2026-04-04
### Resolvido
- **Infraestrutura IA**: Restabelecimento da comunicação das chamadas e análises cósmicas solucionando o erro 500 do backend ao adotar hardcode literal 'gemini-pro-latest' como fallback model, impedindo payload strings vazias.
- **Cloudflare Environment**: Sincronização e injeção do binding `RESEND_API_KEY` mapeado via Secrets Store nativo.

## [v02.17.06] - 2026-03-31
### Corrigido
- **Compliance - docs legais locais em runtime**: o `LicencasModule` passou a carregar `LICENSE`, `NOTICE` e `THIRDPARTY` a partir de `public/legal/*` via `BASE_URL`, eliminando dependência de `raw.githubusercontent.com` no browser e removendo os 404 recorrentes em produção.

### Controle de versão
- `astrologo-app`: APP v02.17.05 → APP v02.17.06

## [v02.17.09] - 2026-04-04
### Resolvido
- **Infraestrutura IA**: Restabelecimento da comunicação das chamadas e análises cósmicas solucionando o erro 500 do backend ao adotar hardcode literal 'gemini-pro-latest' como fallback model, impedindo payload strings vazias.
- **Cloudflare Environment**: Sincronização e injeção do binding `RESEND_API_KEY` mapeado via Secrets Store nativo.

## [v02.17.05] - 2026-03-31
### Adicionado
- **Governança de Licenciamento (GNU AGPLv3)**: Inserção do `LicencasModule` e `ComplianceBanner` no frontend para fechamento do SaaS Loophole com conformidade total.

### Controle de versão
- `astrologo-app`: APP v02.17.04 -> APP v02.17.05

## [v02.17.09] - 2026-04-04
### Resolvido
- **Infraestrutura IA**: Restabelecimento da comunicação das chamadas e análises cósmicas solucionando o erro 500 do backend ao adotar hardcode literal 'gemini-pro-latest' como fallback model, impedindo payload strings vazias.
- **Cloudflare Environment**: Sincronização e injeção do binding `RESEND_API_KEY` mapeado via Secrets Store nativo.

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

