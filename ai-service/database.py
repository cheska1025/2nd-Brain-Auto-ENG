"""
Database configuration and models for 2nd-Brain-Auto (Ver. ENG)
PostgreSQL integration with SQLAlchemy
"""

import os
from datetime import datetime
from typing import Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, Boolean, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/second_brain_auto")

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=os.getenv("DEBUG_MODE", "false").lower() == "true"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Database Models
class ContentClassification(Base):
    """Store AI classification results for content"""
    __tablename__ = "content_classifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_hash = Column(String(64), nullable=False, index=True)
    content_preview = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # P.A.R.A category
    confidence = Column(Float, nullable=False)
    priority = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    complexity = Column(String(20), nullable=False)
    estimated_time = Column(String(50))
    reasoning = Column(Text)
    ai_service_used = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tags = relationship("ContentTag", back_populates="classification", cascade="all, delete-orphan")
    analysis = relationship("ContentAnalysis", back_populates="classification", uselist=False, cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_content_hash_category', 'content_hash', 'category'),
        Index('idx_created_at', 'created_at'),
        Index('idx_confidence', 'confidence'),
    )

class ContentTag(Base):
    """Store AI-generated tags for content"""
    __tablename__ = "content_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    classification_id = Column(UUID(as_uuid=True), ForeignKey("content_classifications.id"), nullable=False)
    tag = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    semantic_group = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    classification = relationship("ContentClassification", back_populates="tags")
    
    # Indexes
    __table_args__ = (
        Index('idx_tag_confidence', 'tag', 'confidence'),
        Index('idx_semantic_group', 'semantic_group'),
    )

class ContentAnalysis(Base):
    """Store detailed content analysis results"""
    __tablename__ = "content_analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    classification_id = Column(UUID(as_uuid=True), ForeignKey("content_classifications.id"), nullable=False)
    entities = Column(ARRAY(String), nullable=False)
    sentiment = Column(String(20), nullable=False)
    complexity_score = Column(Float, nullable=False)
    key_concepts = Column(ARRAY(String), nullable=False)
    summary = Column(Text)
    language = Column(String(10), nullable=False)
    ai_service_used = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    classification = relationship("ContentClassification", back_populates="analysis")
    
    # Indexes
    __table_args__ = (
        Index('idx_sentiment', 'sentiment'),
        Index('idx_complexity_score', 'complexity_score'),
        Index('idx_language', 'language'),
    )

class ProcessingLog(Base):
    """Store processing logs and statistics"""
    __tablename__ = "processing_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_hash = Column(String(64), nullable=False, index=True)
    processing_type = Column(String(50), nullable=False)  # classification, tagging, analysis
    status = Column(String(20), nullable=False)  # success, error, timeout
    processing_time_ms = Column(Integer, nullable=False)
    ai_service_used = Column(String(50))
    error_message = Column(Text)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Indexes
    __table_args__ = (
        Index('idx_processing_type_status', 'processing_type', 'status'),
        Index('idx_created_at', 'created_at'),
        Index('idx_processing_time', 'processing_time_ms'),
    )

class SystemMetrics(Base):
    """Store system performance metrics"""
    __tablename__ = "system_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(20))
    tags = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_metric_name_timestamp', 'metric_name', 'timestamp'),
    )

class AIServiceStatus(Base):
    """Store AI service status and health checks"""
    __tablename__ = "ai_service_status"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_name = Column(String(50), nullable=False, index=True)
    status = Column(String(20), nullable=False)  # active, inactive, error
    response_time_ms = Column(Integer)
    last_successful_call = Column(DateTime)
    error_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_service_status', 'service_name', 'status'),
        Index('idx_last_successful_call', 'last_successful_call'),
    )

# Database utility functions
def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables"""
    Base.metadata.drop_all(bind=engine)

def get_db_session() -> Session:
    """Get a database session for direct use"""
    return SessionLocal()

# Database health check
def check_database_health() -> dict:
    """Check database connection health"""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            return {
                "status": "healthy",
                "database_url": DATABASE_URL.split("@")[-1],  # Hide credentials
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Content hash utility
def generate_content_hash(content: str) -> str:
    """Generate a hash for content to avoid duplicates"""
    import hashlib
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

# Database statistics
def get_database_stats() -> dict:
    """Get database statistics"""
    try:
        with get_db_session() as db:
            stats = {
                "total_classifications": db.query(ContentClassification).count(),
                "total_tags": db.query(ContentTag).count(),
                "total_analyses": db.query(ContentAnalysis).count(),
                "total_logs": db.query(ProcessingLog).count(),
                "recent_classifications": db.query(ContentClassification)
                    .filter(ContentClassification.created_at >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0))
                    .count(),
                "ai_service_usage": db.query(ContentClassification.ai_service_used, 
                    db.func.count(ContentClassification.id)).group_by(ContentClassification.ai_service_used).all()
            }
            return stats
    except Exception as e:
        return {"error": str(e)}

