-- Initialize database for 2nd-Brain-Auto (Ver. ENG)
-- PostgreSQL database setup script

-- Create database if it doesn't exist (this is handled by POSTGRES_DB)
-- CREATE DATABASE second_brain_auto;

-- Connect to the database
\c second_brain_auto;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('urgent', 'important', 'normal', 'low');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
        CREATE TYPE content_status AS ENUM ('active', 'completed', 'on-hold', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complexity_level') THEN
        CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sentiment_type') THEN
        CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral', 'mixed');
    END IF;
END $$;

-- Create indexes for better performance
-- These will be created by Alembic migrations, but we can add additional ones here

-- Create a function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Clean up old processing logs
    DELETE FROM processing_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up old metrics
    DELETE FROM system_metrics 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    deleted_count := deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_classifications', (SELECT COUNT(*) FROM content_classifications),
        'total_tags', (SELECT COUNT(*) FROM content_tags),
        'total_analyses', (SELECT COUNT(*) FROM content_analyses),
        'total_logs', (SELECT COUNT(*) FROM processing_logs),
        'recent_classifications', (
            SELECT COUNT(*) FROM content_classifications 
            WHERE created_at >= CURRENT_DATE
        ),
        'ai_service_usage', (
            SELECT json_agg(
                json_build_object(
                    'service', ai_service_used,
                    'count', count
                )
            )
            FROM (
                SELECT ai_service_used, COUNT(*) as count
                FROM content_classifications
                GROUP BY ai_service_used
            ) t
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create a view for recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    cc.id,
    cc.content_preview,
    cc.category,
    cc.confidence,
    cc.priority,
    cc.status,
    cc.created_at,
    cc.ai_service_used,
    COALESCE(
        json_agg(
            json_build_object(
                'tag', ct.tag,
                'confidence', ct.confidence,
                'group', ct.semantic_group
            )
        ) FILTER (WHERE ct.id IS NOT NULL),
        '[]'::json
    ) as tags,
    CASE 
        WHEN ca.id IS NOT NULL THEN
            json_build_object(
                'entities', ca.entities,
                'sentiment', ca.sentiment,
                'complexity_score', ca.complexity_score,
                'key_concepts', ca.key_concepts,
                'summary', ca.summary,
                'language', ca.language
            )
        ELSE NULL
    END as analysis
FROM content_classifications cc
LEFT JOIN content_tags ct ON cc.id = ct.classification_id
LEFT JOIN content_analyses ca ON cc.id = ca.classification_id
WHERE cc.created_at >= NOW() - INTERVAL '7 days'
GROUP BY cc.id, cc.content_preview, cc.category, cc.confidence, 
         cc.priority, cc.status, cc.created_at, cc.ai_service_used, ca.id,
         ca.entities, ca.sentiment, ca.complexity_score, ca.key_concepts,
         ca.summary, ca.language
ORDER BY cc.created_at DESC;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE second_brain_auto TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Insert initial data
INSERT INTO ai_service_status (service_name, status, error_count, success_count) 
VALUES 
    ('openai', 'inactive', 0, 0),
    ('anthropic', 'inactive', 0, 0),
    ('perplexity', 'inactive', 0, 0),
    ('fallback', 'inactive', 0, 0)
ON CONFLICT (service_name) DO NOTHING;

-- Log completion
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags) 
VALUES ('database_initialized', 1, 'count', '{"status": "success", "timestamp": "' || NOW() || '"}');

