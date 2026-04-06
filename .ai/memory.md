# AI Memory Log - astrologo-app

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
