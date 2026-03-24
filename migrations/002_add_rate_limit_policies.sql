-- Migração idempotente: políticas manuais de rate limit por rota
CREATE TABLE IF NOT EXISTS astrologo_rate_limit_policies (
    route TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 1,
    max_requests INTEGER NOT NULL,
    window_minutes INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('astrologo/calcular', 1, 10, 10);
INSERT OR IGNORE INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('astrologo/analisar', 1, 6, 15);
INSERT OR IGNORE INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('astrologo/enviar-email', 1, 4, 60);

CREATE INDEX IF NOT EXISTS idx_astrologo_rate_limit_policies_updated_at ON astrologo_rate_limit_policies(updated_at);
