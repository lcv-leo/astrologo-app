## 2026-04-17 — Astrologo Frontend v02.17.18 (wrangler observability + traces)
### Escopo
Padronização do baseline de observabilidade Cloudflare no `astrologo-app`, cobrindo o config raiz e o `astrologo-frontend`.
### Alterado
- `wrangler.json` e `astrologo-frontend/wrangler.json` agora garantem `observability.logs.enabled = true`, `observability.logs.invocation_logs = true` e `observability.traces.enabled = true`.
### Motivação
- Fechar a padronização de telemetria do workspace sem perder campos já existentes de observability.
### Versão
- APP v02.17.17 → APP v02.17.18
## 2026-04-10 — Biome 2.x + patches (v02.17.14)
- Biome 2.x adicionado (lint + format com organizeImports)
- vite 8.0.7 → 8.0.8, vitest 4.1.2 → 4.1.4, lucide-react 1.7.0 → 1.8.0
- Dependabot groups: @vitest/* e @biomejs/* adicionados

# AI Memory Log - astrologo-app

## 2026-04-17 — Astrologo Frontend v02.17.17 (rate limit real + origem fail-closed + tokens hashed)
### Escopo
Fechamento da auditoria defensiva de 2026-04-17 no `astrologo-app`, removendo o fail-open de rate limiting, endurecendo os fluxos de auth/contato/e-mail e alinhando a suíte ao contrato de segurança atual.
### Alterado
- **`requestSecurity.ts`**: origem ausente ou fora de `https://*.lcv.app.br` passou a ser bloqueada; rate limiting real por D1 substituiu a dependência do binder ausente.
- **`calcular.ts`, `analisar.ts`, `contato.ts`, `enviar-email.ts`, `astrologo-auth.ts`**: todos os fluxos sensíveis passaram a usar o enforcement centralizado de origem/quota.
- **OTPs e sessões**: tokens passaram a ser persistidos por hash, com lookup compatível durante a transição.
- **Testes**: `requestSecurity.test.ts` foi atualizado para afirmar o comportamento fail-closed de origem ausente.
### Motivação
- Responder à auditoria defensiva fechando a janela de abuso/rate-limit bypass e reduzindo exposição de tokens sensíveis e relay de e-mail.
### Versão
- APP v02.17.16 → APP v02.17.17

## 2026-04-08 — Tech Upgrade: ESLint 10 + Lint Fix
### Escopo
Migração ESLint 9→10 e correção de 4 erros de lint pré-existentes surfaceados pelas regras mais estritas.
### Feito
- **ESLint 10.2.0**: Upgrade + `.npmrc` para peer dep compatibility.
- **`_middleware.ts`**: `context: any` → tipagem estrutural (resolve `no-explicit-any`).
- **`calcular.ts`**: 3 atribuições mortas removidas (regra `no-useless-assignment`).
### Versão
- APP v02.17.12 → APP v02.17.13

## 2026-04-08 — GitHub Actions Purge & Dependabot Standardization
### Escopo
Auditoria completa de CI/CD para eliminação de "ghost runs" em toda a rede de repositórios do workspace, juntamente com a universalização da configuração do Dependabot ajustada às necessidades de empacotamento locais para mitigar tráfego e limites no API.

## 2026-04-06 — Astrologo Frontend: HTML Rendering & IA Save Persistence Fix
### Escopo
Resolução da regressão de renderização onde a "Síntese do Mestre (IA)" exibia tags HTML cruas como texto visível, e correção da perda de dados de análise IA ao salvar mapas na nuvem.

### Corrigido
- **Backend `sanitizeGeneratedHtml()` (analisar.ts)**: Root cause identificado — a função chamava `escapeHtml()` no output HTML do Gemini, convertendo `<p>`, `<strong>` em `&lt;p&gt;`, `&lt;strong&gt;`. Substituído por sanitizador baseado em whitelist de tags (`p`, `strong`, `ul`, `li`, `em`, `b`, `i`, `h1`-`h3`, `br`) com preservação de atributos `style` seguros (`text-align`, `text-indent`).
- **Frontend DOMPurify (App.tsx)**: `ALLOWED_ATTR: []` → `ALLOWED_ATTR: ['style']` para preservar estilos de alinhamento.
- **Save flow (App.tsx)**: `analiseIa` era uma variável de estado separada e nunca era mesclada no `result` ao salvar na nuvem. Agora o fluxo faz `{ ...result, analiseIa }` antes de persistir, garantindo que a análise IA apareça na aba "Dados de Usuários" do admin-app.
- **Admin-app `AstrologoModule.tsx`**: `ALLOWED_ATTR: ['style']` para paridade de renderização.
- **Migração D1**: Revertidas entidades HTML escapadas em 2 registros históricos na coluna `astrologo_mapas.analise_ia` e limpos `<p><p` duplicados residuais.

### Controle de versão
- `astrologo-app`: APP v02.17.09 → APP v02.17.10
- `admin-app`: APP v01.77.43 → APP v01.77.44

## 2026-04-03 — Cloudflare Paid Scale Integration
### Escopo
Migração arquitetural unificada para aproveitamento da infraestrutura Cloudflare Paid. Implementação de **Smart Placement** transversal para redução de latência via proximidade física com o banco de dados (BIGDATA_DB). Adoção da diretiva `usage_model: unbound` para mitigar o `Error 1102` (CPU limit excess). Embutimento global do proxy **Cloudflare AI Gateway** sobrepondo o SDK nativo (`@google/genai`) e habilitando Caching, Rate limiting Nativo e Observabilidade Unificada, mantendo operação híbrida com os LLMs da rede.

### Diretivas Respeitadas
- Conformidade 100% com `wrangler.json`.
- `tlsrpt-motor` e `cron-taxa-ipca` revalidados em infraestrutura moderna sem timeout.

## 2026-03-28 — Admin-App v01.61.02 — Astrologo UserData Frontend Alignment
### Corrigido
- **User Data Render mapping**: JSON parsing de `dadosJson` do `AstrologoModule` ajustado para suportar `ResultData` encabeçado sob a prop `mapasSalvos` quando enviado pelo client.
- **Frontend CamelCase Parity**: O renderizador universal `renderMapaCard` foi expandido para puxar keys tanto em `snake_case` (DB nativo) quanto em `camelCase` e do objeto `query` (padrão de array salva como snapshot pelo frontend), permitindo visualização de histórico de mapas da comunidade sem bugar por falhas de parser.
### Controle de versão
- `admin-app`: APP v01.61.01 → APP v01.61.02
