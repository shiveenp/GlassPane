CREATE TABLE indexed_directories
(
    id              UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    path            VARCHAR(1024) NOT NULL UNIQUE,
    enabled         BOOLEAN       NOT NULL   DEFAULT true,
    last_indexed_at TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
