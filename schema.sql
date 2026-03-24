DROP TABLE IF EXISTS mapas;
DROP TABLE IF EXISTS astrologo_mapas;
DROP TABLE IF EXISTS astrologo_api_rate_limits;
DROP TABLE IF EXISTS astrologo_rate_limit_policies;

CREATE TABLE astrologo_mapas (
    id TEXT PRIMARY KEY,
    nome TEXT,
    data_nascimento TEXT,
    hora_nascimento TEXT,
    local_nascimento TEXT,
    dados_astronomica TEXT,
    dados_tropical TEXT,
    dados_globais TEXT,
    analise_ia TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE astrologo_api_rate_limits (
    key TEXT PRIMARY KEY,
    route TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE astrologo_rate_limit_policies (
    route TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 1,
    max_requests INTEGER NOT NULL,
    window_minutes INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('astrologo/calcular', 1, 10, 10);
INSERT OR IGNORE INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('astrologo/analisar', 1, 6, 15);
INSERT OR IGNORE INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('astrologo/enviar-email', 1, 4, 60);

CREATE INDEX idx_astrologo_mapas_created_at ON astrologo_mapas(created_at DESC);
CREATE INDEX idx_astrologo_api_rate_limits_route_window ON astrologo_api_rate_limits(route, window_start);
CREATE INDEX idx_astrologo_api_rate_limits_updated_at ON astrologo_api_rate_limits(updated_at);
CREATE INDEX idx_astrologo_rate_limit_policies_updated_at ON astrologo_rate_limit_policies(updated_at);