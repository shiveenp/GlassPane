CREATE TABLE indexed_files
(
    id             UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    path           VARCHAR(1024) NOT NULL UNIQUE,
    last_modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    indexed_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_indexed_files_path ON indexed_files (path);
