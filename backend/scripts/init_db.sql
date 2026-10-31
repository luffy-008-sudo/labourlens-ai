-- KaushalSetu database initialization
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create read-only role for LLM chat tools
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ks_readonly') THEN
        CREATE ROLE ks_readonly LOGIN PASSWORD 'ks_readonly';
    END IF;
END
$$;

-- Default grants will be applied after tables are migrated
