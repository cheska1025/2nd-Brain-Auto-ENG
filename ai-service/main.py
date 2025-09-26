"""
2nd-Brain-Auto AI 서비스 (Ver. KOR)
AI 기반 고급 콘텐츠 분류 및 스마트 태깅 시스템
"""

import os
import json
import logging
import time
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import openai
import anthropic
import httpx
from dotenv import load_dotenv

# Import database modules
from database import get_db, initialize_database, check_database_health
from db_utils import db_manager, generate_content_hash

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="2nd-Brain-Auto AI 서비스",
    description="P.A.R.A 방법론을 위한 AI 기반 콘텐츠 분류 및 스마트 태깅",
    version="1.0.0"
)

# 시작 시 데이터베이스 초기화
@app.on_event("startup")
async def startup_event():
    """시작 시 데이터베이스 초기화"""
    try:
        initialize_database()
        logger.info("데이터베이스 초기화 완료")
    except Exception as e:
        logger.error(f"데이터베이스 초기화 실패: {str(e)}")
        raise

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI 서비스 설정
openai.api_key = os.getenv("OPENAI_API_KEY")
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
primary_ai_service = os.getenv("PRIMARY_AI_SERVICE", "anthropic")
fallback_ai_service = os.getenv("FALLBACK_AI_SERVICE", "openai")

# P.A.R.A 분류 모델
PARA_CLASSIFICATION_MODEL = {
    "01-Projects": {
        "keywords": ["project", "development", "build", "create", "task", "deadline", "work", "urgent", "launch", "release"],
        "ai_patterns": ["timeline", "milestone", "deliverable", "completion", "deadline", "launch"],
        "priority_keywords": ["urgent", "important", "deadline", "critical", "launch", "release"],
        "complexity_threshold": 0.7
    },
    "02-Areas": {
        "keywords": ["management", "area", "business", "routine", "daily", "health", "finance", "manage", "process"],
        "ai_patterns": ["ongoing", "continuous", "regular", "maintenance", "process", "management"],
        "priority_keywords": ["daily", "regular", "management", "routine", "process"],
        "complexity_threshold": 0.5
    },
    "03-Resources": {
        "keywords": ["material", "reference", "learning", "study", "information", "trend", "resource", "guide", "tutorial"],
        "ai_patterns": ["educational", "informational", "reference", "learning", "study", "guide"],
        "priority_keywords": ["important", "reference", "learning", "valuable", "useful"],
        "complexity_threshold": 0.6
    },
    "04-Archives": {
        "keywords": ["completed", "archive", "organize", "done", "finished", "past", "historical"],
        "ai_patterns": ["completed", "finished", "archived", "historical", "past", "final"],
        "priority_keywords": ["completed", "archived", "historical", "final", "done"],
        "complexity_threshold": 0.3
    }
}

# Pydantic 모델
class ClassificationRequest(BaseModel):
    content: str = Field(..., description="Content to classify")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class ClassificationResponse(BaseModel):
    category: str = Field(..., description="P.A.R.A category")
    confidence: float = Field(..., description="Classification confidence (0-1)")
    priority: str = Field(..., description="Priority level")
    status: str = Field(..., description="Status")
    complexity: str = Field(..., description="Content complexity")
    estimated_time: str = Field(..., description="Estimated processing time")
    reasoning: str = Field(..., description="Classification reasoning")

class TaggingRequest(BaseModel):
    content: str = Field(..., description="Content to tag")
    title: Optional[str] = Field(None, description="Content title")
    category: Optional[str] = Field(None, description="P.A.R.A category")
    confidence: Optional[float] = Field(None, description="Classification confidence")
    analysis: Optional[Dict[str, Any]] = Field(None, description="Previous analysis results")

class TaggingResponse(BaseModel):
    smart_tags: List[str] = Field(..., description="AI-generated smart tags")
    confidence: float = Field(..., description="Tagging confidence (0-1)")
    semantic_groups: Dict[str, List[str]] = Field(..., description="Semantically grouped tags")
    related_topics: List[str] = Field(..., description="Related topics")

class AnalysisRequest(BaseModel):
    content: str = Field(..., description="Content to analyze")
    title: Optional[str] = Field(None, description="Content title")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class AnalysisResponse(BaseModel):
    entities: List[str] = Field(..., description="Extracted entities")
    sentiment: str = Field(..., description="Sentiment analysis")
    complexity_score: float = Field(..., description="Complexity score (0-1)")
    key_concepts: List[str] = Field(..., description="Key concepts")
    summary: str = Field(..., description="Content summary")
    language: str = Field(..., description="Detected language")

# AI 서비스 함수
class AIClassificationService:
    def __init__(self):
        self.primary_service = primary_ai_service
        self.fallback_service = fallback_ai_service
        self.max_tokens = 1000
        
    async def classify_content(self, content: str, context: Optional[Dict] = None) -> ClassificationResponse:
        """AI와 P.A.R.A 방법론을 사용하여 콘텐츠 분류"""
        start_time = time.time()
        content_hash = generate_content_hash(content)
        
        # 분류가 이미 존재하는지 확인
        existing_classification = db_manager.get_classification_history(content_hash)
        if existing_classification:
            logger.info(f"캐시된 분류 사용: {content_hash}")
            return ClassificationResponse(
                category=existing_classification['category'],
                confidence=existing_classification['confidence'],
                priority=existing_classification['priority'],
                status=existing_classification['status'],
                complexity=existing_classification['complexity'],
                estimated_time=existing_classification['estimated_time'],
                reasoning=existing_classification['reasoning']
            )
        
        try:
            # 프롬프트 준비
            prompt = self._create_classification_prompt(content, context)
            
            # 주 AI 서비스 먼저 시도
            response = await self._call_ai_service(prompt, self.primary_service)
            
            # 응답 파싱
            classification = self._parse_classification_response(response)
            
            # 데이터베이스에 저장
            processing_time = int((time.time() - start_time) * 1000)
            classification_id = db_manager.save_classification(
                content, classification, self.primary_service, processing_time
            )
            
            # AI 서비스 상태 업데이트
            db_manager.update_ai_service_status(
                self.primary_service, 'active', processing_time, success_count=1
            )
            
            return ClassificationResponse(**classification)
            
        except Exception as e:
            logger.error(f"주 AI 서비스 오류: {str(e)}")
            try:
                # 대체 AI 서비스 시도
                response = await self._call_ai_service(prompt, self.fallback_service)
                classification = self._parse_classification_response(response)
                
                # 데이터베이스에 저장
                processing_time = int((time.time() - start_time) * 1000)
                classification_id = db_manager.save_classification(
                    content, classification, self.fallback_service, processing_time
                )
                
                # AI 서비스 상태 업데이트
                db_manager.update_ai_service_status(
                    self.fallback_service, 'active', processing_time, success_count=1
                )
                
                return ClassificationResponse(**classification)
            except Exception as fallback_error:
                logger.error(f"대체 AI 서비스 오류: {str(fallback_error)}")
                # 규칙 기반 분류로 대체
                fallback_result = self._fallback_classification(content)
                
                # 대체 결과 저장
                processing_time = int((time.time() - start_time) * 1000)
                classification_id = db_manager.save_classification(
                    content, fallback_result.dict(), 'fallback', processing_time
                )
                
                # AI 서비스 상태 업데이트
                db_manager.update_ai_service_status(
                    'fallback', 'active', processing_time, success_count=1
                )
                
                return fallback_result
    
    def _create_classification_prompt(self, content: str, context: Optional[Dict] = None) -> str:
        """OpenAI용 분류 프롬프트 생성"""
        prompt = f"""
        Analyze the following content and classify it according to the P.A.R.A methodology:
        
        Content: {content}
        
        Context: {context or "None"}
        
        P.A.R.A Categories:
        1. 01-Projects: Tasks with clear deadlines and specific deliverables
        2. 02-Areas: Areas that need ongoing maintenance and management
        3. 03-Resources: Information that may be useful in the future
        4. 04-Archives: Completed projects or inactive areas
        
        Please respond with a JSON object containing:
        - category: The P.A.R.A category (01-Projects, 02-Areas, 03-Resources, 04-Archives)
        - confidence: Confidence score (0-1)
        - priority: Priority level (urgent, important, normal)
        - status: Status (active, completed, on-hold)
        - complexity: Complexity level (low, medium, high)
        - estimated_time: Estimated time to complete/process (e.g., "30 minutes", "2 hours", "1 day")
        - reasoning: Brief explanation of the classification decision
        """
        return prompt
    
    async def _call_ai_service(self, prompt: str, service: str) -> str:
        """Call AI service based on configuration"""
        if service == "anthropic":
            return await self._call_anthropic(prompt)
        elif service == "perplexity":
            return await self._call_perplexity(prompt)
        elif service == "openai":
            return await self._call_openai(prompt)
        else:
            raise ValueError(f"Unsupported AI service: {service}")
    
    async def _call_anthropic(self, prompt: str) -> str:
        """Anthropic Claude API 호출"""
        try:
            response = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=self.max_tokens,
                temperature=0.3,
                system="You are an expert in knowledge management and the P.A.R.A methodology. Provide accurate, structured responses.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Anthropic API temporarily unavailable")
    
    async def _call_perplexity(self, prompt: str) -> str:
        """Perplexity API 호출"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {perplexity_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-sonar-small-128k-online",
                        "messages": [
                            {"role": "system", "content": "You are an expert in knowledge management and the P.A.R.A methodology. Provide accurate, structured responses."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": self.max_tokens,
                        "temperature": 0.3
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Perplexity API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Perplexity API temporarily unavailable")
    
    async def _call_openai(self, prompt: str) -> str:
        """OpenAI API 호출"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in knowledge management and the P.A.R.A methodology. Provide accurate, structured responses."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise HTTPException(status_code=500, detail="OpenAI API temporarily unavailable")
    
    def _parse_classification_response(self, response: str) -> Dict:
        """OpenAI 응답 파싱"""
        try:
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            logger.error(f"Response parsing error: {str(e)}")
            return self._fallback_classification_data()
    
    def _fallback_classification(self, content: str) -> ClassificationResponse:
        """규칙 기반 분류로 대체"""
        content_lower = content.lower()
        
        # Simple keyword-based classification
        for category, rules in PARA_CLASSIFICATION_MODEL.items():
            if any(keyword in content_lower for keyword in rules["keywords"]):
                return ClassificationResponse(
                    category=category,
                    confidence=0.6,
                    priority="normal",
                    status="active",
                    complexity="medium",
                    estimated_time="1 hour",
                    reasoning="Rule-based classification fallback"
                )
        
        # Default to Areas
        return ClassificationResponse(
            category="02-Areas",
            confidence=0.5,
            priority="normal",
            status="active",
            complexity="medium",
            estimated_time="1 hour",
            reasoning="Default classification to Areas"
        )
    
    def _fallback_classification_data(self) -> Dict:
        """대체 분류 데이터"""
        return {
            "category": "02-Areas",
            "confidence": 0.5,
            "priority": "normal",
            "status": "active",
            "complexity": "medium",
            "estimated_time": "1 hour",
            "reasoning": "Fallback classification due to parsing error"
        }

class AITaggingService:
    def __init__(self):
        self.primary_service = primary_ai_service
        self.fallback_service = fallback_ai_service
        self.max_tokens = 500
    
    async def generate_smart_tags(self, content: str, title: Optional[str] = None, 
                                category: Optional[str] = None, analysis: Optional[Dict] = None) -> TaggingResponse:
        """Generate smart tags using AI"""
        start_time = time.time()
        content_hash = generate_content_hash(content)
        
        # Check if classification exists and has tags
        existing_classification = db_manager.get_classification_history(content_hash)
        if existing_classification and existing_classification.get('tags'):
            logger.info(f"Using cached tags for content hash: {content_hash}")
            tags = existing_classification['tags']
            return TaggingResponse(
                smart_tags=[tag['tag'] for tag in tags],
                confidence=sum(tag['confidence'] for tag in tags) / len(tags) if tags else 0.5,
                semantic_groups={tag['group']: [tag['tag']] for tag in tags},
                related_topics=[]
            )
        
        try:
            prompt = self._create_tagging_prompt(content, title, category, analysis)
            response = await self._call_ai_service(prompt, self.primary_service)
            tags_data = self._parse_tagging_response(response)
            
            # Save tags to database if classification exists
            if existing_classification:
                processing_time = int((time.time() - start_time) * 1000)
                db_manager.save_tags(
                    existing_classification['id'], tags_data, self.primary_service, processing_time
                )
            
            # Update AI service status
            db_manager.update_ai_service_status(
                self.primary_service, 'active', int((time.time() - start_time) * 1000), success_count=1
            )
            
            return TaggingResponse(**tags_data)
        except Exception as e:
            logger.error(f"Primary AI service tagging error: {str(e)}")
            try:
                response = await self._call_ai_service(prompt, self.fallback_service)
                tags_data = self._parse_tagging_response(response)
                
                # Save tags to database if classification exists
                if existing_classification:
                    processing_time = int((time.time() - start_time) * 1000)
                    db_manager.save_tags(
                        existing_classification['id'], tags_data, self.fallback_service, processing_time
                    )
                
                # Update AI service status
                db_manager.update_ai_service_status(
                    self.fallback_service, 'active', int((time.time() - start_time) * 1000), success_count=1
                )
                
                return TaggingResponse(**tags_data)
            except Exception as fallback_error:
                logger.error(f"Fallback AI service tagging error: {str(fallback_error)}")
                fallback_result = self._fallback_tagging(content)
                
                # Save fallback tags if classification exists
                if existing_classification:
                    processing_time = int((time.time() - start_time) * 1000)
                    db_manager.save_tags(
                        existing_classification['id'], fallback_result.dict(), 'fallback', processing_time
                    )
                
                return fallback_result
    
    def _create_tagging_prompt(self, content: str, title: Optional[str], 
                             category: Optional[str], analysis: Optional[Dict]) -> str:
        """Create tagging prompt for OpenAI"""
        prompt = f"""
        Generate smart tags for the following content:
        
        Title: {title or "No title"}
        Content: {content[:500]}...
        Category: {category or "Unknown"}
        Analysis: {analysis or "None"}
        
        Please respond with a JSON object containing:
        - smart_tags: List of 5-10 relevant, specific tags
        - confidence: Confidence score (0-1)
        - semantic_groups: Object grouping related tags (e.g., {{"technical": ["api", "database"], "business": ["strategy", "planning"]}})
        - related_topics: List of 3-5 related topics for further exploration
        
        Focus on:
        - Specific, actionable tags
        - Technical terms when appropriate
        - Business context
        - Time sensitivity
        - Complexity indicators
        """
        return prompt
    
    async def _call_ai_service(self, prompt: str, service: str) -> str:
        """Call AI service based on configuration"""
        if service == "anthropic":
            return await self._call_anthropic(prompt)
        elif service == "perplexity":
            return await self._call_perplexity(prompt)
        elif service == "openai":
            return await self._call_openai(prompt)
        else:
            raise ValueError(f"Unsupported AI service: {service}")
    
    async def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic Claude API for tagging"""
        try:
            response = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=self.max_tokens,
                temperature=0.4,
                system="You are an expert in content tagging and knowledge organization. Generate precise, useful tags.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Anthropic API temporarily unavailable")
    
    async def _call_perplexity(self, prompt: str) -> str:
        """Call Perplexity API for tagging"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {perplexity_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-sonar-small-128k-online",
                        "messages": [
                            {"role": "system", "content": "You are an expert in content tagging and knowledge organization. Generate precise, useful tags."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": self.max_tokens,
                        "temperature": 0.4
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Perplexity API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Perplexity API temporarily unavailable")
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API for tagging"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in content tagging and knowledge organization. Generate precise, useful tags."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=0.4
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
    
    def _parse_tagging_response(self, response: str) -> Dict:
        """Parse tagging response"""
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            logger.error(f"Tagging response parsing error: {str(e)}")
            return self._fallback_tagging_data()
    
    def _fallback_tagging(self, content: str) -> TaggingResponse:
        """Fallback tagging based on content analysis"""
        # Simple keyword extraction
        words = content.lower().split()
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        unique_words = [word for word in words if word not in common_words and len(word) > 3]
        
        return TaggingResponse(
            smart_tags=unique_words[:5],
            confidence=0.4,
            semantic_groups={"general": unique_words[:3]},
            related_topics=["content analysis", "knowledge management"]
        )
    
    def _fallback_tagging_data(self) -> Dict:
        """Fallback tagging data"""
        return {
            "smart_tags": ["content", "analysis", "knowledge"],
            "confidence": 0.3,
            "semantic_groups": {"general": ["content", "analysis"]},
            "related_topics": ["knowledge management"]
        }

class AIAnalysisService:
    def __init__(self):
        self.primary_service = primary_ai_service
        self.fallback_service = fallback_ai_service
        self.max_tokens = 800
    
    async def analyze_content(self, content: str, title: Optional[str] = None, 
                            context: Optional[Dict] = None) -> AnalysisResponse:
        """Analyze content for insights"""
        start_time = time.time()
        content_hash = generate_content_hash(content)
        
        # Check if classification exists and has analysis
        existing_classification = db_manager.get_classification_history(content_hash)
        if existing_classification and existing_classification.get('analysis'):
            logger.info(f"Using cached analysis for content hash: {content_hash}")
            analysis = existing_classification['analysis']
            return AnalysisResponse(
                entities=analysis['entities'],
                sentiment=analysis['sentiment'],
                complexity_score=analysis['complexity_score'],
                key_concepts=analysis['key_concepts'],
                summary=analysis['summary'],
                language=analysis['language']
            )
        
        try:
            prompt = self._create_analysis_prompt(content, title, context)
            response = await self._call_ai_service(prompt, self.primary_service)
            analysis_data = self._parse_analysis_response(response)
            
            # Save analysis to database if classification exists
            if existing_classification:
                processing_time = int((time.time() - start_time) * 1000)
                db_manager.save_analysis(
                    existing_classification['id'], analysis_data, self.primary_service, processing_time
                )
            
            # Update AI service status
            db_manager.update_ai_service_status(
                self.primary_service, 'active', int((time.time() - start_time) * 1000), success_count=1
            )
            
            return AnalysisResponse(**analysis_data)
        except Exception as e:
            logger.error(f"Primary AI service analysis error: {str(e)}")
            try:
                response = await self._call_ai_service(prompt, self.fallback_service)
                analysis_data = self._parse_analysis_response(response)
                
                # Save analysis to database if classification exists
                if existing_classification:
                    processing_time = int((time.time() - start_time) * 1000)
                    db_manager.save_analysis(
                        existing_classification['id'], analysis_data, self.fallback_service, processing_time
                    )
                
                # Update AI service status
                db_manager.update_ai_service_status(
                    self.fallback_service, 'active', int((time.time() - start_time) * 1000), success_count=1
                )
                
                return AnalysisResponse(**analysis_data)
            except Exception as fallback_error:
                logger.error(f"Fallback AI service analysis error: {str(fallback_error)}")
                fallback_result = self._fallback_analysis(content)
                
                # Save fallback analysis if classification exists
                if existing_classification:
                    processing_time = int((time.time() - start_time) * 1000)
                    db_manager.save_analysis(
                        existing_classification['id'], fallback_result.dict(), 'fallback', processing_time
                    )
                
                return fallback_result
    
    def _create_analysis_prompt(self, content: str, title: Optional[str], context: Optional[Dict]) -> str:
        """Create analysis prompt for OpenAI"""
        prompt = f"""
        Analyze the following content and provide insights:
        
        Title: {title or "No title"}
        Content: {content[:1000]}...
        Context: {context or "None"}
        
        Please respond with a JSON object containing:
        - entities: List of important entities (people, places, organizations, concepts)
        - sentiment: Overall sentiment (positive, negative, neutral)
        - complexity_score: Complexity score (0-1, where 1 is most complex)
        - key_concepts: List of 3-5 key concepts or themes
        - summary: Brief 2-3 sentence summary
        - language: Detected language (e.g., "English", "Spanish")
        """
        return prompt
    
    async def _call_ai_service(self, prompt: str, service: str) -> str:
        """Call AI service based on configuration"""
        if service == "anthropic":
            return await self._call_anthropic(prompt)
        elif service == "perplexity":
            return await self._call_perplexity(prompt)
        elif service == "openai":
            return await self._call_openai(prompt)
        else:
            raise ValueError(f"Unsupported AI service: {service}")
    
    async def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic Claude API for analysis"""
        try:
            response = anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=self.max_tokens,
                temperature=0.2,
                system="You are an expert content analyst. Provide detailed, accurate analysis.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Anthropic API temporarily unavailable")
    
    async def _call_perplexity(self, prompt: str) -> str:
        """Call Perplexity API for analysis"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {perplexity_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-sonar-small-128k-online",
                        "messages": [
                            {"role": "system", "content": "You are an expert content analyst. Provide detailed, accurate analysis."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": self.max_tokens,
                        "temperature": 0.2
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Perplexity API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Perplexity API temporarily unavailable")
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API for analysis"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert content analyst. Provide detailed, accurate analysis."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
    
    def _parse_analysis_response(self, response: str) -> Dict:
        """Parse analysis response"""
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            logger.error(f"Analysis response parsing error: {str(e)}")
            return self._fallback_analysis_data()
    
    def _fallback_analysis(self, content: str) -> AnalysisResponse:
        """Fallback analysis"""
        return AnalysisResponse(
            entities=["content"],
            sentiment="neutral",
            complexity_score=0.5,
            key_concepts=["knowledge", "management"],
            summary="Content analysis completed with basic processing.",
            language="English"
        )
    
    def _fallback_analysis_data(self) -> Dict:
        """Fallback analysis data"""
        return {
            "entities": ["content"],
            "sentiment": "neutral",
            "complexity_score": 0.5,
            "key_concepts": ["knowledge", "management"],
            "summary": "Basic content analysis completed.",
            "language": "English"
        }

# 서비스 초기화
classification_service = AIClassificationService()
tagging_service = AITaggingService()
analysis_service = AIAnalysisService()

# API 엔드포인트
@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/classify", response_model=ClassificationResponse)
async def classify_content(request: ClassificationRequest):
    """AI와 P.A.R.A 방법론을 사용하여 콘텐츠 분류"""
    try:
        result = await classification_service.classify_content(request.content, request.context)
        return result
    except Exception as e:
        logger.error(f"Classification endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tag", response_model=TaggingResponse)
async def generate_tags(request: TaggingRequest):
    """콘텐츠용 스마트 태그 생성"""
    try:
        result = await tagging_service.generate_smart_tags(
            request.content, 
            request.title, 
            request.category, 
            request.analysis
        )
        return result
    except Exception as e:
        logger.error(f"Tagging endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    """콘텐츠 인사이트 분석"""
    try:
        result = await analysis_service.analyze_content(
            request.content, 
            request.title, 
            request.context
        )
        return result
    except Exception as e:
        logger.error(f"Analysis endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/status")
async def get_models_status():
    """AI 모델 상태 조회"""
    return {
        "classification": "active",
        "tagging": "active", 
        "analysis": "active",
        "primary_service": primary_ai_service,
        "fallback_service": fallback_ai_service,
        "openai_status": "connected" if openai.api_key else "disconnected",
        "anthropic_status": "connected" if os.getenv("ANTHROPIC_API_KEY") else "disconnected",
        "perplexity_status": "connected" if os.getenv("PERPLEXITY_API_KEY") else "disconnected"
    }

@app.get("/api/database/health")
async def database_health():
    """데이터베이스 상태 확인"""
    return await db_manager.health_check()

@app.get("/api/database/stats")
async def database_stats():
    """데이터베이스 통계 조회"""
    return db_manager.get_statistics()

@app.get("/api/classification/history/{content_hash}")
async def get_classification_history(content_hash: str):
    """콘텐츠 분류 히스토리 조회"""
    result = db_manager.get_classification_history(content_hash)
    if not result:
        raise HTTPException(status_code=404, detail="Classification not found")
    return result

@app.post("/api/classification/complete")
async def complete_classification(request: ClassificationRequest):
    """모든 AI 서비스로 완전한 분류 수행 (분류, 태깅, 분석)"""
    try:
        # 콘텐츠 분류
        classification_result = await classification_service.classify_content(request.content, request.context)
        
        # 태그 생성
        tagging_result = await tagging_service.generate_smart_tags(
            request.content, 
            category=classification_result.category,
            analysis={"confidence": classification_result.confidence}
        )
        
        # 콘텐츠 분석
        analysis_result = await analysis_service.analyze_content(
            request.content,
            context=request.context
        )
        
        return {
            "classification": classification_result,
            "tags": tagging_result,
            "analysis": analysis_result,
            "content_hash": generate_content_hash(request.content)
        }
    except Exception as e:
        logger.error(f"Complete classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
