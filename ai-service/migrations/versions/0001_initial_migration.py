"""Initial migration for 2nd-Brain-Auto database

Revision ID: 0001
Revises: 
Create Date: 2024-09-24 21:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create content_classifications table
    op.create_table('content_classifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('content_preview', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('complexity', sa.String(length=20), nullable=False),
        sa.Column('estimated_time', sa.String(length=50), nullable=True),
        sa.Column('reasoning', sa.Text(), nullable=True),
        sa.Column('ai_service_used', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_content_hash', 'content_classifications', ['content_hash'], unique=False)
    op.create_index('idx_category', 'content_classifications', ['category'], unique=False)
    op.create_index('idx_content_hash_category', 'content_classifications', ['content_hash', 'category'], unique=False)
    op.create_index('idx_created_at', 'content_classifications', ['created_at'], unique=False)
    op.create_index('idx_confidence', 'content_classifications', ['confidence'], unique=False)

    # Create content_tags table
    op.create_table('content_tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('classification_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tag', sa.String(length=100), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('semantic_group', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['classification_id'], ['content_classifications.id'], )
    )
    op.create_index('idx_tag', 'content_tags', ['tag'], unique=False)
    op.create_index('idx_tag_confidence', 'content_tags', ['tag', 'confidence'], unique=False)
    op.create_index('idx_semantic_group', 'content_tags', ['semantic_group'], unique=False)

    # Create content_analyses table
    op.create_table('content_analyses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('classification_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entities', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('sentiment', sa.String(length=20), nullable=False),
        sa.Column('complexity_score', sa.Float(), nullable=False),
        sa.Column('key_concepts', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('ai_service_used', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['classification_id'], ['content_classifications.id'], )
    )
    op.create_index('idx_sentiment', 'content_analyses', ['sentiment'], unique=False)
    op.create_index('idx_complexity_score', 'content_analyses', ['complexity_score'], unique=False)
    op.create_index('idx_language', 'content_analyses', ['language'], unique=False)

    # Create processing_logs table
    op.create_table('processing_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('processing_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('processing_time_ms', sa.Integer(), nullable=False),
        sa.Column('ai_service_used', sa.String(length=50), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_content_hash', 'processing_logs', ['content_hash'], unique=False)
    op.create_index('idx_processing_type_status', 'processing_logs', ['processing_type', 'status'], unique=False)
    op.create_index('idx_created_at', 'processing_logs', ['created_at'], unique=False)
    op.create_index('idx_processing_time', 'processing_logs', ['processing_time_ms'], unique=False)

    # Create system_metrics table
    op.create_table('system_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('metric_unit', sa.String(length=20), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_metric_name', 'system_metrics', ['metric_name'], unique=False)
    op.create_index('idx_metric_name_timestamp', 'system_metrics', ['metric_name', 'timestamp'], unique=False)
    op.create_index('idx_timestamp', 'system_metrics', ['timestamp'], unique=False)

    # Create ai_service_status table
    op.create_table('ai_service_status',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('service_name', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.Column('last_successful_call', sa.DateTime(), nullable=True),
        sa.Column('error_count', sa.Integer(), nullable=False),
        sa.Column('success_count', sa.Integer(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_service_name', 'ai_service_status', ['service_name'], unique=False)
    op.create_index('idx_service_status', 'ai_service_status', ['service_name', 'status'], unique=False)
    op.create_index('idx_last_successful_call', 'ai_service_status', ['last_successful_call'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('ai_service_status')
    op.drop_table('system_metrics')
    op.drop_table('processing_logs')
    op.drop_table('content_analyses')
    op.drop_table('content_tags')
    op.drop_table('content_classifications')

