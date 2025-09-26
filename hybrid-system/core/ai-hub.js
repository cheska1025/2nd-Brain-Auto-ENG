/**
 * AI 통합 허브 - 2nd-Brain-Auto 하이브리드 시스템
 * Claude, Perplexity, 로컬 AI를 통합 관리하는 중앙 허브
 */

const MECEClassifier = require('./mece-classifier');
const Redis = require('ioredis');

class AIHub {
  constructor(config = {}) {
    this.config = {
      primaryProvider: 'claude',
      fallbackProvider: 'perplexity',
      localProvider: 'ollama',
      enableLearning: true,
      maxRetries: 3,
      timeout: 30000,
      enableCaching: true,
      cacheExpiry: 3600, // 1시간
      ...config
    };

    // AI 제공자 인스턴스
    this.providers = {};
    this.meceClassifier = new MECEClassifier(config.mece);

    // 캐시 시스템 (ai-integration에서 가져온 기능)
    this.redis = this.config.enableCaching ? new Redis(config.redis || {}) : null;

    // 성능 추적
    this.performance = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      providerStats: {}
    };

    // 초기화
    this.initializeProviders();
  }

  /**
   * AI 제공자 초기화
   */
  async initializeProviders() {
    try {
      // Claude 제공자 초기화
      this.providers.claude = await this.createClaudeProvider();
      
      // Perplexity 제공자 초기화
      this.providers.perplexity = await this.createPerplexityProvider();
      
      // 로컬 AI 제공자 초기화
      this.providers.ollama = await this.createOllamaProvider();

      // 추가 제공자들 (ai-integration에서 가져온 기능)
      this.providers.cursor = await this.createCursorProvider();

      console.log('✅ AI 제공자 초기화 완료');
    } catch (error) {
      console.error('❌ AI 제공자 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * Claude 제공자 생성
   */
  async createClaudeProvider() {
    const { ClaudeProvider } = require('../providers/claude-provider');
    return new ClaudeProvider({
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.7
    });
  }

  /**
   * Perplexity 제공자 생성
   */
  async createPerplexityProvider() {
    const { PerplexityProvider } = require('../ai-providers/perplexity-provider');
    return new PerplexityProvider({
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: 'llama-3.1-sonar-large-128k-online',
      maxTokens: 4000,
      temperature: 0.7
    });
  }

  /**
   * Ollama 제공자 생성
   */
  async createOllamaProvider() {
    const { LocalAIProvider } = require('../providers/local-ai-provider');
    return new LocalAIProvider({
      endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: 'llama3.1:8b',
      maxTokens: 4000,
      temperature: 0.7
    });
  }

  /**
   * Cursor 제공자 생성 (ai-integration에서 가져온 기능)
   */
  async createCursorProvider() {
    // Cursor AI는 현재 구현되지 않았으므로 기본 구조만 제공
    return {
      name: 'cursor',
      completion: async (prompt, options) => {
        throw new Error('Cursor AI 제공자가 아직 구현되지 않았습니다');
      },
      healthCheck: async () => {
        return { status: 'not_implemented', available: false };
      }
    };
  }

  /**
   * 메인 처리 함수 - MECE 분류 + AI 처리
   */
  async processInput(input, options = {}) {
    const startTime = Date.now();
    this.performance.totalRequests++;

    try {
      // 1. MECE 분류 실행
      const meceResult = await this.meceClassifier.classify(
        input, 
        options.userHeadline, 
        options.context
      );

      // 2. AI 처리 실행
      const aiResult = await this.processWithAI(input, meceResult, options);

      // 3. 결과 통합
      const finalResult = this.integrateResults(meceResult, aiResult, options);

      // 4. 성능 추적 업데이트
      this.updatePerformance(startTime, true);

      return finalResult;

    } catch (error) {
      console.error('AI 처리 오류:', error);
      this.updatePerformance(startTime, false);
      
      // 오류 시 대체 처리
      return this.handleError(input, error, options);
    }
  }

  /**
   * AI 처리 실행 (하이브리드 분류 기능 통합)
   */
  async processWithAI(input, meceResult, options) {
    const { meceCategory, paraCategory, confidence } = meceResult;
    
    // AI 처리 타입 결정
    const processingType = this.determineProcessingType(meceCategory, paraCategory, options);
    
    // 지능형 라우팅으로 최적 제공자 선택
    const providerName = await this.intelligentRouting(input, meceResult);
    const provider = this.providers[providerName];
    
    // 캐시 확인
    const cacheKey = this.generateCacheKey(input, providerName, meceResult);
    if (this.redis) {
      const cachedResult = await this.redis.get(cacheKey);
      if (cachedResult) {
        console.log('🚀 캐시에서 결과 반환');
        return JSON.parse(cachedResult);
      }
    }
    
    // AI 프롬프트 생성
    const prompt = this.generatePrompt(input, meceResult, processingType, options);
    
    // AI 요청 실행
    const aiResponse = await this.executeAIRequest(provider, prompt, options);
    
    const result = {
      processingType,
      provider: provider.name || providerName,
      response: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    // 결과 캐싱
    if (this.redis) {
      await this.redis.setex(cacheKey, this.config.cacheExpiry, JSON.stringify(result));
    }
    
    return result;
  }

  /**
   * 캐시 키 생성
   */
  generateCacheKey(content, provider, context) {
    const crypto = require('crypto');
    const contentHash = crypto
      .createHash('md5')
      .update(content + provider + JSON.stringify(context))
      .digest('hex');
    return `ai:${contentHash}`;
  }

  /**
   * 하이브리드 분류 (ai-integration에서 가져온 기능)
   */
  async intelligentClassification(content) {
    const startTime = Date.now();
    
    try {
      // 1차: 로컬 AI로 빠른 분류 시도
      console.log('🏠 로컬 AI로 1차 분류 시도...');
      const localResult = await this.providers.ollama.classifyContent(content);
      
      if (localResult.confidence > 0.8) {
        console.log(`✅ 로컬 AI 분류 완료 (${Date.now() - startTime}ms)`);
        return localResult;
      }
      
      // 2차: 신뢰도가 낮으면 Claude로 재분류
      console.log('🌐 클라우드 AI로 재분류 중...');
      const cloudResult = await this.providers.claude.classifyContent(content);
      
      // 3차: 두 결과를 조합하여 최종 결정
      const combinedResult = this.combineClassificationResults(localResult, cloudResult);
      
      console.log(`🎯 하이브리드 분류 완료 (${Date.now() - startTime}ms)`);
      return combinedResult;
      
    } catch (localError) {
      console.warn('로컬 AI 실패, 클라우드로 전환:', localError.message);
      return await this.providers.claude.classifyContent(content);
    }
  }

  /**
   * 분류 결과 조합
   */
  combineClassificationResults(localResult, cloudResult) {
    // 가중 평균으로 결과 조합
    const localWeight = 0.3;
    const cloudWeight = 0.7;
    
    const combinedConfidence = (localResult.confidence * localWeight) + 
                              (cloudResult.confidence * cloudWeight);
    
    // 더 높은 신뢰도의 결과를 기본으로 사용
    const primaryResult = cloudResult.confidence > localResult.confidence ? 
                         cloudResult : localResult;
    
    return {
      ...primaryResult,
      confidence: combinedConfidence,
      sources: ['local', 'cloud'],
      reasoning: `로컬 AI 신뢰도: ${localResult.confidence}, 클라우드 AI 신뢰도: ${cloudResult.confidence}`
    };
  }

  /**
   * 처리 타입 결정
   */
  determineProcessingType(meceCategory, paraCategory, options) {
    // 사용자 지정 처리 타입
    if (options.processingType) {
      return options.processingType;
    }

    // MECE 카테고리 기반 자동 결정
    const typeMapping = {
      '업무-핵심': 'project_analysis',
      '업무-지원': 'document_processing',
      '개인-필수': 'personal_management',
      '개인-선택': 'content_creation',
      '학습-업무': 'knowledge_extraction',
      '학습-교양': 'content_enhancement'
    };

    return typeMapping[meceCategory] || 'general_processing';
  }

  /**
   * AI 제공자 선택 (ai-integration의 고급 라우팅 기능 통합)
   */
  selectProvider(processingType, options) {
    // 사용자 지정 제공자
    if (options.provider) {
      return this.providers[options.provider];
    }

    // 처리 타입별 최적 제공자 선택
    const providerMapping = {
      'project_analysis': 'claude',      // 프로젝트 분석은 Claude
      'document_processing': 'claude',   // 문서 처리도 Claude
      'knowledge_extraction': 'perplexity', // 지식 추출은 Perplexity
      'content_enhancement': 'claude',   // 콘텐츠 향상은 Claude
      'personal_management': 'ollama',   // 개인 관리는 로컬 AI
      'content_creation': 'claude',      // 콘텐츠 생성은 Claude
      'general_processing': 'claude'     // 기본은 Claude
    };

    const selectedProvider = providerMapping[processingType] || this.config.primaryProvider;
    return this.providers[selectedProvider];
  }

  /**
   * 지능형 AI 라우팅 (ai-integration에서 가져온 기능)
   */
  async intelligentRouting(content, context = {}) {
    const contentLength = content.length;
    const complexity = this.assessComplexity(content);
    const urgency = context.priority || 'medium';
    
    // 간단하고 빠른 작업 → 로컬 AI
    if (contentLength < 1000 && complexity < 0.5) {
      return 'ollama';
    }
    
    // 긴급하고 중요한 작업 → Claude Pro
    if (urgency === 'high' && complexity > 0.7) {
      return 'claude';
    }
    
    // 리서치가 필요한 작업 → Perplexity
    if (this.needsResearch(content)) {
      return 'perplexity';
    }
    
    // 코드 관련 작업 → Cursor AI
    if (this.isCodeRelated(content)) {
      return 'cursor';
    }
    
    // 기본값: Claude
    return 'claude';
  }

  /**
   * 콘텐츠 복잡도 평가
   */
  assessComplexity(content) {
    const factors = {
      length: Math.min(content.length / 10000, 1),
      technicalTerms: this.countTechnicalTerms(content) / 100,
      questionMarks: (content.match(/\?/g) || []).length / 10,
      codeBlocks: (content.match(/```/g) || []).length / 4
    };
    
    return (factors.length + factors.technicalTerms + factors.questionMarks + factors.codeBlocks) / 4;
  }

  /**
   * 기술 용어 개수 계산
   */
  countTechnicalTerms(content) {
    const technicalTerms = [
      'algorithm', 'database', 'API', 'framework', 'architecture',
      '알고리즘', '데이터베이스', '프레임워크', '아키텍처'
    ];
    
    return technicalTerms.reduce((count, term) => {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * 리서치 필요성 확인
   */
  needsResearch(content) {
    const researchKeywords = [
      '최신', '현재', '트렌드', '비교', '분석', '조사',
      'latest', 'current', 'trends', 'research', 'compare'
    ];
    
    return researchKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 코드 관련 콘텐츠 확인
   */
  isCodeRelated(content) {
    const codeIndicators = [
      'function', 'class', 'import', 'export', 'const', 'let', 'var',
      'def ', 'print(', 'console.log', '#!/', '<?php', '<script>',
      '코드', '함수', '클래스', '프로그래밍', '개발'
    ];
    
    return codeIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * AI 프롬프트 생성
   */
  generatePrompt(input, meceResult, processingType, options) {
    const { meceCategory, paraCategory, confidence } = meceResult;
    
    const basePrompt = `
다음 입력을 처리해주세요:

입력: "${input}"

MECE 분류 정보:
- 카테고리: ${meceCategory}
- P.A.R.A: ${paraCategory}
- 신뢰도: ${confidence}%

처리 타입: ${processingType}
`;

    const typeSpecificPrompts = {
      'project_analysis': `
프로젝트 분석을 수행해주세요:
1. 프로젝트 목표 및 범위 정의
2. 주요 마일스톤 및 일정 제안
3. 필요한 리소스 및 팀 구성
4. 위험 요소 및 대응 방안
5. 성공 지표 및 측정 방법

JSON 형식으로 응답해주세요:
{
  "title": "프로젝트 제목",
  "objectives": ["목표1", "목표2"],
  "scope": "프로젝트 범위",
  "milestones": [{"name": "마일스톤", "date": "YYYY-MM-DD"}],
  "resources": ["필요한 리소스"],
  "risks": [{"risk": "위험요소", "mitigation": "대응방안"}],
  "success_metrics": ["성공지표"]
}
`,

      'document_processing': `
문서 처리를 수행해주세요:
1. 핵심 내용 요약
2. 액션 아이템 추출
3. 관련 문서 제안
4. 후속 작업 제안

JSON 형식으로 응답해주세요:
{
  "summary": "핵심 내용 요약",
  "action_items": ["액션1", "액션2"],
  "related_docs": ["관련문서1", "관련문서2"],
  "next_steps": ["후속작업1", "후속작업2"]
}
`,

      'knowledge_extraction': `
지식 추출을 수행해주세요:
1. 핵심 개념 정리
2. 학습 포인트 식별
3. 실무 적용 방안
4. 추가 학습 자료 제안

JSON 형식으로 응답해주세요:
{
  "core_concepts": ["개념1", "개념2"],
  "learning_points": ["학습포인트1", "학습포인트2"],
  "practical_applications": ["적용방안1", "적용방안2"],
  "additional_resources": ["추가자료1", "추가자료2"]
}
`,

      'content_enhancement': `
콘텐츠 향상을 수행해주세요:
1. 구조 개선 제안
2. 내용 보완 제안
3. 가독성 향상
4. 시각적 요소 제안

JSON 형식으로 응답해주세요:
{
  "structure_improvements": ["구조개선1", "구조개선2"],
  "content_additions": ["내용보완1", "내용보완2"],
  "readability_tips": ["가독성팁1", "가독성팁2"],
  "visual_elements": ["시각요소1", "시각요소2"]
}
`
    };

    const specificPrompt = typeSpecificPrompts[processingType] || `
일반 처리를 수행해주세요:
1. 입력 내용 분석
2. 핵심 포인트 추출
3. 개선 제안
4. 후속 액션 제안

JSON 형식으로 응답해주세요:
{
  "analysis": "분석 결과",
  "key_points": ["핵심포인트1", "핵심포인트2"],
  "improvements": ["개선제안1", "개선제안2"],
  "next_actions": ["후속액션1", "후속액션2"]
}
`;

    return basePrompt + specificPrompt;
  }

  /**
   * AI 요청 실행
   */
  async executeAIRequest(provider, prompt, options) {
    const maxRetries = options.maxRetries || this.config.maxRetries;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI 요청 시도 ${attempt}/${maxRetries} (${provider.name})`);
        
        const response = await provider.completion(prompt, {
          timeout: this.config.timeout,
          ...options
        });

        // 성공 시 제공자 통계 업데이트
        this.updateProviderStats(provider.name, true);
        
        return response;

      } catch (error) {
        lastError = error;
        console.warn(`AI 요청 실패 (시도 ${attempt}/${maxRetries}):`, error.message);
        
        // 재시도 전 대기
        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    // 모든 시도 실패 시 대체 제공자 시도
    return this.tryFallbackProvider(prompt, options);
  }

  /**
   * 대체 제공자 시도
   */
  async tryFallbackProvider(prompt, options) {
    const fallbackProvider = this.providers[this.config.fallbackProvider];
    
    if (!fallbackProvider) {
      throw new Error('모든 AI 제공자 사용 불가');
    }

    try {
      console.log(`대체 제공자 사용: ${fallbackProvider.name}`);
      const response = await fallbackProvider.completion(prompt, options);
      this.updateProviderStats(fallbackProvider.name, true);
      return response;
    } catch (error) {
      console.error('대체 제공자도 실패:', error);
      throw new Error(`모든 AI 제공자 실패: ${error.message}`);
    }
  }

  /**
   * 결과 통합
   */
  integrateResults(meceResult, aiResult, options) {
    return {
      // 기본 정보
      input: meceResult.input,
      timestamp: meceResult.timestamp,
      id: meceResult.id,
      
      // MECE 분류 결과
      mece: {
        category: meceResult.meceCategory,
        confidence: meceResult.confidence,
        reasoning: meceResult.reasoning,
        paraCategory: meceResult.paraCategory,
        priority: meceResult.priority,
        destinations: meceResult.destinations,
        folderPaths: meceResult.folderPaths
      },
      
      // AI 처리 결과
      ai: {
        processingType: aiResult.processingType,
        provider: aiResult.provider,
        response: aiResult.response,
        timestamp: aiResult.timestamp
      },
      
      // 통합 결과
      integrated: {
        title: this.extractTitle(aiResult.response),
        summary: this.extractSummary(aiResult.response),
        actionItems: this.extractActionItems(aiResult.response),
        tags: this.generateTags(meceResult, aiResult.response),
        metadata: this.generateMetadata(meceResult, aiResult)
      },
      
      // 처리 옵션
      options: options
    };
  }

  /**
   * 제목 추출
   */
  extractTitle(aiResponse) {
    try {
      if (aiResponse.title) return aiResponse.title;
      if (aiResponse.response?.title) return aiResponse.response.title;
      return '제목 없음';
    } catch {
      return '제목 추출 실패';
    }
  }

  /**
   * 요약 추출
   */
  extractSummary(aiResponse) {
    try {
      if (aiResponse.summary) return aiResponse.summary;
      if (aiResponse.response?.summary) return aiResponse.response.summary;
      if (aiResponse.analysis) return aiResponse.analysis;
      return '요약 없음';
    } catch {
      return '요약 추출 실패';
    }
  }

  /**
   * 액션 아이템 추출
   */
  extractActionItems(aiResponse) {
    try {
      const items = [];
      
      if (aiResponse.action_items) {
        items.push(...aiResponse.action_items);
      }
      if (aiResponse.next_actions) {
        items.push(...aiResponse.next_actions);
      }
      if (aiResponse.next_steps) {
        items.push(...aiResponse.next_steps);
      }
      
      return items.length > 0 ? items : ['액션 아이템 없음'];
    } catch {
      return ['액션 아이템 추출 실패'];
    }
  }

  /**
   * 태그 생성
   */
  generateTags(meceResult, aiResponse) {
    const tags = [];
    
    // MECE 카테고리 태그
    tags.push(meceResult.meceCategory.replace('-', '_'));
    tags.push(meceResult.paraCategory.toLowerCase());
    
    // AI 응답에서 키워드 추출
    if (aiResponse.keywords) {
      tags.push(...aiResponse.keywords);
    }
    
    // 고유 태그
    tags.push('ai_processed', 'mece_classified');
    
    return [...new Set(tags)]; // 중복 제거
  }

  /**
   * 메타데이터 생성
   */
  generateMetadata(meceResult, aiResult) {
    return {
      meceId: meceResult.id,
      processingType: aiResult.processingType,
      provider: aiResult.provider,
      confidence: meceResult.confidence,
      source: meceResult.source,
      methods: meceResult.methods || [],
      createdAt: meceResult.timestamp,
      processedAt: aiResult.timestamp
    };
  }

  /**
   * 오류 처리
   */
  handleError(input, error, options) {
    console.error('AI 처리 오류:', error);
    
    return {
      input: input,
      timestamp: new Date().toISOString(),
      id: `error_${Date.now()}`,
      error: {
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      },
      mece: {
        category: '업무-지원', // 기본 분류
        confidence: 30,
        reasoning: '오류 발생으로 인한 기본 분류',
        paraCategory: 'Areas',
        priority: '4Q',
        destinations: ['obsidian'],
        folderPaths: this.meceClassifier.generateFolderPaths('업무-지원', 'Areas')
      },
      ai: {
        processingType: 'error_fallback',
        provider: 'none',
        response: null,
        timestamp: new Date().toISOString()
      },
      integrated: {
        title: '처리 실패',
        summary: 'AI 처리 중 오류가 발생했습니다.',
        actionItems: ['오류 로그 확인', '수동 처리 필요'],
        tags: ['error', 'manual_processing_required'],
        metadata: {
          error: true,
          errorMessage: error.message
        }
      },
      options: options
    };
  }

  /**
   * 성능 추적 업데이트
   */
  updatePerformance(startTime, success) {
    const responseTime = Date.now() - startTime;
    
    if (success) {
      this.performance.successfulRequests++;
    } else {
      this.performance.failedRequests++;
    }
    
    // 평균 응답 시간 업데이트
    const totalRequests = this.performance.successfulRequests + this.performance.failedRequests;
    this.performance.avgResponseTime = 
      (this.performance.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  /**
   * 제공자 통계 업데이트
   */
  updateProviderStats(providerName, success) {
    if (!this.performance.providerStats[providerName]) {
      this.performance.providerStats[providerName] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0
      };
    }
    
    const stats = this.performance.providerStats[providerName];
    stats.totalRequests++;
    
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }
  }

  /**
   * 사용자 수정 처리
   */
  async handleUserCorrection(resultId, correctedCategory) {
    try {
      // MECE 분류기에서 수정 처리
      await this.meceClassifier.handleUserCorrection(
        { meceCategory: 'temp' }, // 실제로는 저장된 결과에서 가져와야 함
        correctedCategory
      );
      
      console.log(`사용자 수정 처리 완료: ${resultId} → ${correctedCategory}`);
      return { success: true };
    } catch (error) {
      console.error('사용자 수정 처리 실패:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 시스템 상태 조회
   */
  getSystemStatus() {
    const health = this.meceClassifier.getSystemHealth();
    const stats = this.meceClassifier.getClassificationStats();
    
    return {
      performance: this.performance,
      meceHealth: health,
      classificationStats: stats,
      providers: Object.keys(this.providers).map(name => ({
        name,
        available: !!this.providers[name],
        stats: this.performance.providerStats[name] || {}
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 유틸리티 함수들
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * AI 제공자 상태 확인
   */
  async checkProviderHealth() {
    const health = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        const startTime = Date.now();
        await provider.healthCheck();
        const responseTime = Date.now() - startTime;
        
        health[name] = {
          status: 'healthy',
          responseTime,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        health[name] = {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return health;
  }
}

module.exports = AIHub;
