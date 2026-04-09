

## 📋 DIRETIVAS DO PROJETO E REGRAS DE CÓDIGO
# Regras
- Use princípios de Clean Code.
- Comente lógicas complexas.


## 🧠 MEMÓRIA DE CONTEXTO ISOLADO (ASTROLOGO-APP)
# AI Memory Log - astrologo-app


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



## 🤖 Claude Code — Memória Sincronizada (2026-04-09)

A memória persistente do **Claude Code** está em:
`C:\Users\leona\.claude\projects\c--Users-leona-lcv-workspace\memory\`

Arquivos: `MEMORY.md` (índice) · `project_workspace.md` · `version_control.md` · `infra_directives.md` · `app_memories_ref.md` · `ai_agents_files.md`

**Diretiva:** Ao atualizar esta memória, atualizar também os arquivos correspondentes da memória do Claude Code para manter paridade entre Gemini, Copilot e Claude Code.

> **DIRETIVA DE SEGURANÇA:** Ao sugerir código ou responder perguntas, leia rigorosamente o contexto e as memórias históricas acima para não divergir das decisões já tomadas pelo outro agente.
