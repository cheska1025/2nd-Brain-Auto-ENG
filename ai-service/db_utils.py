"""
Database utilities and connection management for 2nd-Brain-Auto (Ver. ENG)
PostgreSQL connection handling and data operations
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import (
    get_db_session, ContentClassification, ContentTag, ContentAnalysis, 
    ProcessingLog, SystemMetrics, AIServiceStatus, generate_content_hash,
    check_database_health, get_database_stats
)

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self):
        self.health_check_interval = 300  # 5 minutes
        self.last_health_check = None
        self._health_status = None
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform database health check with caching"""
        now = datetime.utcnow()
        
        # Use cached result if recent
        if (self.last_health_check and 
            now - self.last_health_check < timedelta(seconds=self.health_check_interval)):
            return self._health_status
        
        self._health_status = check_database_health()
        self.last_health_check = now
        return self._health_status
    
    def save_classification(self, content: str, classification_data: Dict[str, Any], 
                          ai_service: str, processing_time_ms: int) -> str:
        """Save classification result to database"""
        try:
            with get_db_session() as db:
                content_hash = generate_content_hash(content)
                
                # Check if classification already exists
                existing = db.query(ContentClassification).filter(
                    ContentClassification.content_hash == content_hash
                ).first()
                
                if existing:
                    # Update existing classification
                    existing.category = classification_data.get('category', existing.category)
                    existing.confidence = classification_data.get('confidence', existing.confidence)
                    existing.priority = classification_data.get('priority', existing.priority)
                    existing.status = classification_data.get('status', existing.status)
                    existing.complexity = classification_data.get('complexity', existing.complexity)
                    existing.estimated_time = classification_data.get('estimated_time', existing.estimated_time)
                    existing.reasoning = classification_data.get('reasoning', existing.reasoning)
                    existing.ai_service_used = ai_service
                    existing.updated_at = datetime.utcnow()
                    classification_id = existing.id
                else:
                    # Create new classification
                    classification = ContentClassification(
                        content_hash=content_hash,
                        content_preview=content[:500] + "..." if len(content) > 500 else content,
                        category=classification_data.get('category', '02-Areas'),
                        confidence=classification_data.get('confidence', 0.5),
                        priority=classification_data.get('priority', 'normal'),
                        status=classification_data.get('status', 'active'),
                        complexity=classification_data.get('complexity', 'medium'),
                        estimated_time=classification_data.get('estimated_time', '1 hour'),
                        reasoning=classification_data.get('reasoning', ''),
                        ai_service_used=ai_service
                    )
                    db.add(classification)
                    db.flush()
                    classification_id = classification.id
                
                # Log processing
                self._log_processing(
                    db, content_hash, 'classification', 'success', 
                    processing_time_ms, ai_service
                )
                
                db.commit()
                return str(classification_id)
                
        except Exception as e:
            logger.error(f"Error saving classification: {str(e)}")
            raise
    
    def save_tags(self, classification_id: str, tags_data: Dict[str, Any], 
                  ai_service: str, processing_time_ms: int) -> None:
        """Save tags to database"""
        try:
            with get_db_session() as db:
                # Clear existing tags for this classification
                db.query(ContentTag).filter(
                    ContentTag.classification_id == classification_id
                ).delete()
                
                # Add new tags
                for tag in tags_data.get('smart_tags', []):
                    tag_obj = ContentTag(
                        classification_id=classification_id,
                        tag=tag,
                        confidence=tags_data.get('confidence', 0.5),
                        semantic_group=tags_data.get('semantic_groups', {}).get('general', 'general')
                    )
                    db.add(tag_obj)
                
                # Log processing
                self._log_processing(
                    db, None, 'tagging', 'success', 
                    processing_time_ms, ai_service, 
                    metadata={'tag_count': len(tags_data.get('smart_tags', []))}
                )
                
                db.commit()
                
        except Exception as e:
            logger.error(f"Error saving tags: {str(e)}")
            raise
    
    def save_analysis(self, classification_id: str, analysis_data: Dict[str, Any], 
                     ai_service: str, processing_time_ms: int) -> None:
        """Save analysis result to database"""
        try:
            with get_db_session() as db:
                # Check if analysis already exists
                existing = db.query(ContentAnalysis).filter(
                    ContentAnalysis.classification_id == classification_id
                ).first()
                
                if existing:
                    # Update existing analysis
                    existing.entities = analysis_data.get('entities', [])
                    existing.sentiment = analysis_data.get('sentiment', 'neutral')
                    existing.complexity_score = analysis_data.get('complexity_score', 0.5)
                    existing.key_concepts = analysis_data.get('key_concepts', [])
                    existing.summary = analysis_data.get('summary', '')
                    existing.language = analysis_data.get('language', 'English')
                    existing.ai_service_used = ai_service
                else:
                    # Create new analysis
                    analysis = ContentAnalysis(
                        classification_id=classification_id,
                        entities=analysis_data.get('entities', []),
                        sentiment=analysis_data.get('sentiment', 'neutral'),
                        complexity_score=analysis_data.get('complexity_score', 0.5),
                        key_concepts=analysis_data.get('key_concepts', []),
                        summary=analysis_data.get('summary', ''),
                        language=analysis_data.get('language', 'English'),
                        ai_service_used=ai_service
                    )
                    db.add(analysis)
                
                # Log processing
                self._log_processing(
                    db, None, 'analysis', 'success', 
                    processing_time_ms, ai_service,
                    metadata={'entities_count': len(analysis_data.get('entities', []))}
                )
                
                db.commit()
                
        except Exception as e:
            logger.error(f"Error saving analysis: {str(e)}")
            raise
    
    def _log_processing(self, db: Session, content_hash: Optional[str], 
                       processing_type: str, status: str, processing_time_ms: int,
                       ai_service: Optional[str] = None, error_message: Optional[str] = None,
                       metadata: Optional[Dict] = None) -> None:
        """Log processing information"""
        try:
            log_entry = ProcessingLog(
                content_hash=content_hash or '',
                processing_type=processing_type,
                status=status,
                processing_time_ms=processing_time_ms,
                ai_service_used=ai_service,
                error_message=error_message,
                metadata=metadata
            )
            db.add(log_entry)
        except Exception as e:
            logger.error(f"Error logging processing: {str(e)}")
    
    def get_classification_history(self, content_hash: str) -> Optional[Dict[str, Any]]:
        """Get classification history for content"""
        try:
            with get_db_session() as db:
                classification = db.query(ContentClassification).filter(
                    ContentClassification.content_hash == content_hash
                ).first()
                
                if not classification:
                    return None
                
                return {
                    'id': str(classification.id),
                    'category': classification.category,
                    'confidence': classification.confidence,
                    'priority': classification.priority,
                    'status': classification.status,
                    'complexity': classification.complexity,
                    'estimated_time': classification.estimated_time,
                    'reasoning': classification.reasoning,
                    'ai_service_used': classification.ai_service_used,
                    'created_at': classification.created_at.isoformat(),
                    'updated_at': classification.updated_at.isoformat(),
                    'tags': [{'tag': tag.tag, 'confidence': tag.confidence, 'group': tag.semantic_group} 
                            for tag in classification.tags],
                    'analysis': {
                        'entities': classification.analysis.entities if classification.analysis else [],
                        'sentiment': classification.analysis.sentiment if classification.analysis else 'neutral',
                        'complexity_score': classification.analysis.complexity_score if classification.analysis else 0.5,
                        'key_concepts': classification.analysis.key_concepts if classification.analysis else [],
                        'summary': classification.analysis.summary if classification.analysis else '',
                        'language': classification.analysis.language if classification.analysis else 'English'
                    } if classification.analysis else None
                }
        except Exception as e:
            logger.error(f"Error getting classification history: {str(e)}")
            return None
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            return get_database_stats()
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {"error": str(e)}
    
    def update_ai_service_status(self, service_name: str, status: str, 
                               response_time_ms: Optional[int] = None,
                               error_count: int = 0, success_count: int = 0) -> None:
        """Update AI service status"""
        try:
            with get_db_session() as db:
                service_status = db.query(AIServiceStatus).filter(
                    AIServiceStatus.service_name == service_name
                ).first()
                
                if service_status:
                    service_status.status = status
                    service_status.response_time_ms = response_time_ms
                    service_status.error_count += error_count
                    service_status.success_count += success_count
                    if status == 'active':
                        service_status.last_successful_call = datetime.utcnow()
                    service_status.updated_at = datetime.utcnow()
                else:
                    service_status = AIServiceStatus(
                        service_name=service_name,
                        status=status,
                        response_time_ms=response_time_ms,
                        error_count=error_count,
                        success_count=success_count,
                        last_successful_call=datetime.utcnow() if status == 'active' else None
                    )
                    db.add(service_status)
                
                db.commit()
        except Exception as e:
            logger.error(f"Error updating AI service status: {str(e)}")
    
    def record_metric(self, metric_name: str, metric_value: float, 
                     metric_unit: str = None, tags: Dict[str, Any] = None) -> None:
        """Record a system metric"""
        try:
            with get_db_session() as db:
                metric = SystemMetrics(
                    metric_name=metric_name,
                    metric_value=metric_value,
                    metric_unit=metric_unit,
                    tags=tags
                )
                db.add(metric)
                db.commit()
        except Exception as e:
            logger.error(f"Error recording metric: {str(e)}")

# Global database manager instance
db_manager = DatabaseManager()

# Async context manager for database operations
@asynccontextmanager
async def get_async_db():
    """Async context manager for database operations"""
    db = get_db_session()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def initialize_database():
    """Initialize database tables"""
    try:
        from database import create_tables
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def cleanup_old_data(days_to_keep: int = 30):
    """Clean up old data"""
    try:
        with get_db_session() as db:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Clean up old processing logs
            old_logs = db.query(ProcessingLog).filter(
                ProcessingLog.created_at < cutoff_date
            ).count()
            db.query(ProcessingLog).filter(
                ProcessingLog.created_at < cutoff_date
            ).delete()
            
            # Clean up old metrics
            old_metrics = db.query(SystemMetrics).filter(
                SystemMetrics.timestamp < cutoff_date
            ).count()
            db.query(SystemMetrics).filter(
                SystemMetrics.timestamp < cutoff_date
            ).delete()
            
            db.commit()
            logger.info(f"Cleaned up {old_logs} old logs and {old_metrics} old metrics")
    except Exception as e:
        logger.error(f"Error cleaning up old data: {str(e)}")
        raise

