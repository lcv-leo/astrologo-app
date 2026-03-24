# Changelog — Astrólogo Admin

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
