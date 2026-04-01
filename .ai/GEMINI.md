# AI Memory Log - astrologo-app

## 2026-03-28 — Admin-App v01.61.02 — Astrologo UserData Frontend Alignment
### Corrigido
- **User Data Render mapping**: JSON parsing de `dadosJson` do `AstrologoModule` ajustado para suportar `ResultData` encabeçado sob a prop `mapasSalvos` quando enviado pelo client.
- **Frontend CamelCase Parity**: O renderizador universal `renderMapaCard` foi expandido para puxar keys tanto em `snake_case` (DB nativo) quanto em `camelCase` e do objeto `query` (padrão de array salva como snapshot pelo frontend), permitindo visualização de histórico de mapas da comunidade sem bugar por falhas de parser.
### Controle de versão
- `admin-app`: APP v01.61.01 → APP v01.61.02
