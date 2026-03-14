DROP TABLE IF EXISTS mapas;
DROP TABLE IF EXISTS mapas_astrologicos;

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