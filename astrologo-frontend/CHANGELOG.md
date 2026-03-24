# Changelog — Astrólogo Frontend

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
