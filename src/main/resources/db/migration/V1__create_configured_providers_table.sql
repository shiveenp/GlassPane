-- Enable UUID generation extension
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE configured_providers
(
    id             UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
    user_id        VARCHAR(255) NOT NULL,
    provider       VARCHAR(50)  NOT NULL,
    deactivated_at TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP
);
