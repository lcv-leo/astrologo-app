-- Migração idempotente: tabela de rate limit por janela
CREATE TABLE IF NOT EXISTS astrologo_api_rate_limits (
    key TEXT PRIMARY KEY,
    route TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_astrologo_api_rate_limits_route_window ON astrologo_api_rate_limits(route, window_start);
CREATE INDEX IF NOT EXISTS idx_astrologo_api_rate_limits_updated_at ON astrologo_api_rate_limits(updated_at);
