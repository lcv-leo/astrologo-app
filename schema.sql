DROP TABLE IF EXISTS mapas;
DROP TABLE IF EXISTS mapas_astrologicos;
DROP TABLE IF EXISTS api_rate_limits;

CREATE TABLE mapas_astrologicos (
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

CREATE TABLE api_rate_limits (
    key TEXT PRIMARY KEY,
    route TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mapas_astrologicos_created_at ON mapas_astrologicos(created_at DESC);
CREATE INDEX idx_api_rate_limits_route_window ON api_rate_limits(route, window_start);
CREATE INDEX idx_api_rate_limits_updated_at ON api_rate_limits(updated_at);