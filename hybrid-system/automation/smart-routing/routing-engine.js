/**
 * 지능형 라우팅 엔진 - 2nd-Brain-Auto 하이브리드 시스템
 * 사용자 입력을 분석하여 최적의 처리 경로를 결정하는 엔진
 */

class SmartRoutingEngine {
  constructor(config = {}) {
    this.config = {
      enableLearning: true,
      confidenceThreshold: 70,
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    // 라우팅 규칙 저장소
    this.routingRules = new Map();
    
    // 사용자 패턴 학습 데이터
    this.userPatterns = {
      preferences: {},
      history: [],
      successRates: {},
      responseTimes: {}
    };

    // 라우팅 통계
    this.routingStats = {
      totalRequests: 0,
      successfulRoutes: 0,
      failedRoutes: 0,
      avgResponseTime: 0,
      routeAccuracy: 0
    };

    // 초기화
    this.initializeRoutingRules();
  }

  /**
   * 라우팅 규칙 초기화
   */
  initializeRoutingRules() {
    // 기본 라우팅 규칙 설정
    const defaultRules = [
      {
        id: 'headline_routing',
        name: '헤드라인 기반 라우팅',
        priority: 100,
        condition: (input) => input.userHeadline && this.isValidHeadline(input.userHeadline),
        route: (input) => this.routeByHeadline(input),
        timeout: 5000
      },
      {
        id: 'content_type_routing',
        name: '콘텐츠 타입 기반 라우팅',
        priority: 80,
        condition: (input) => this.detectContentType(input.input),
        route: (input) => this.routeByContentType(input),
        timeout: 10000
      },
      {
        id: 'user_preference_routing',
        name: '사용자 선호도 기반 라우팅',
        priority: 60,
        condition: (input) => this.hasUserPreferences(input),
        route: (input) => this.routeByUserPreference(input),
        timeout: 8000
      },
      {
        id: 'ai_analysis_routing',
        name: 'AI 분석 기반 라우팅',
        priority: 40,
        condition: (input) => input.enableAI !== false,
        route: (input) => this.routeByAIAnalysis(input),
        timeout: 15000
      },
      {
        id: 'fallback_routing',
        name: '기본 라우팅',
        priority: 20,
        condition: () => true,
        route: (input) => this.routeByDefault(input),
        timeout: 10000
      }
    ];

    defaultRules.forEach(rule => {
      this.routingRules.set(rule.id, rule);
    });
  }

  /**
   * 메인 라우팅 함수
   */
  async route(input) {
    const startTime = Date.now();
    this.routingStats.totalRequests++;

    try {
      // 입력 검증
      this.validateInput(input);

      // 라우팅 규칙 적용
      const route = await this.findBestRoute(input);
      
      // 라우팅 실행
      const result = await this.executeRoute(route, input);

      // 성공 통계 업데이트
      this.updateSuccessStats(startTime);
      
      // 사용자 패턴 학습
      if (this.config.enableLearning) {
        await this.learnFromRoute(input, route, result);
      }

      return {
        success: true,
        route: route.id,
        result: result,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('라우팅 실패:', error);
      this.updateFailureStats(startTime);
      
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 입력 검증
   */
  validateInput(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('유효하지 않은 입력 데이터');
    }

    if (!input.input || typeof input.input !== 'string') {
      throw new Error('입력 내용이 필요합니다');
    }

    if (input.input.length > 10000) {
      throw new Error('입력 내용이 너무 깁니다 (최대 10,000자)');
    }

    if (input.input.length < 3) {
      throw new Error('입력 내용이 너무 짧습니다 (최소 3자)');
    }
  }

  /**
   * 최적 라우팅 규칙 찾기
   */
  async findBestRoute(input) {
    const applicableRules = [];

    // 적용 가능한 규칙 찾기
    for (const [id, rule] of this.routingRules) {
      try {
        if (await rule.condition(input)) {
          applicableRules.push(rule);
        }
      } catch (error) {
        console.warn(`규칙 ${id} 조건 확인 실패:`, error);
      }
    }

    if (applicableRules.length === 0) {
      throw new Error('적용 가능한 라우팅 규칙이 없습니다');
    }

    // 우선순위별 정렬
    applicableRules.sort((a, b) => b.priority - a.priority);

    // 사용자 패턴 고려
    const bestRule = this.selectBestRule(applicableRules, input);

    return bestRule;
  }

  /**
   * 최적 규칙 선택
   */
  selectBestRule(rules, input) {
    // 사용자 선호도가 있는 경우 우선 적용
    const userPreference = this.getUserPreference(input);
    if (userPreference) {
      const preferredRule = rules.find(rule => rule.id === userPreference);
      if (preferredRule) {
        return preferredRule;
      }
    }

    // 성공률이 높은 규칙 우선 선택
    const rulesWithSuccessRate = rules.map(rule => ({
      ...rule,
      successRate: this.getRuleSuccessRate(rule.id)
    }));

    rulesWithSuccessRate.sort((a, b) => b.successRate - a.successRate);

    return rulesWithSuccessRate[0];
  }

  /**
   * 라우팅 실행
   */
  async executeRoute(route, input) {
    const startTime = Date.now();
    
    try {
      // 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('라우팅 타임아웃')), route.timeout);
      });

      // 라우팅 실행
      const routePromise = route.route(input);
      
      const result = await Promise.race([routePromise, timeoutPromise]);
      
      // 실행 시간 기록
      const executionTime = Date.now() - startTime;
      this.recordExecutionTime(route.id, executionTime);

      return result;

    } catch (error) {
      console.error(`라우팅 실행 실패 (${route.id}):`, error);
      throw error;
    }
  }

  /**
   * 헤드라인 기반 라우팅
   */
  async routeByHeadline(input) {
    const headline = input.userHeadline;
    
    const headlineMapping = {
      '[프로젝트-업무]': {
        meceCategory: '업무-핵심',
        processingType: 'project_analysis',
        priority: 'high',
        enableAI: true,
        enableSync: true
      },
      '[프로젝트-개인]': {
        meceCategory: '개인-필수',
        processingType: 'personal_management',
        priority: 'medium',
        enableAI: true,
        enableSync: true
      },
      '[영역-업무]': {
        meceCategory: '업무-지원',
        processingType: 'document_processing',
        priority: 'medium',
        enableAI: true,
        enableSync: true
      },
      '[영역-개인]': {
        meceCategory: '개인-필수',
        processingType: 'personal_management',
        priority: 'medium',
        enableAI: true,
        enableSync: false
      },
      '[학습-전문]': {
        meceCategory: '학습-업무',
        processingType: 'knowledge_extraction',
        priority: 'medium',
        enableAI: true,
        enableSync: true
      },
      '[학습-교양]': {
        meceCategory: '학습-교양',
        processingType: 'content_enhancement',
        priority: 'low',
        enableAI: true,
        enableSync: false
      },
      '[자료-업무]': {
        meceCategory: '업무-지원',
        processingType: 'document_processing',
        priority: 'low',
        enableAI: false,
        enableSync: true
      },
      '[자료-개인]': {
        meceCategory: '개인-선택',
        processingType: 'content_enhancement',
        priority: 'low',
        enableAI: false,
        enableSync: false
      },
      '[임시]': {
        meceCategory: 'temporary',
        processingType: 'general_processing',
        priority: 'low',
        enableAI: false,
        enableSync: false
      }
    };

    const mapping = headlineMapping[headline];
    if (!mapping) {
      throw new Error(`알 수 없는 헤드라인: ${headline}`);
    }

    return {
      type: 'headline_routing',
      confidence: 95,
      mapping: mapping,
      reasoning: `헤드라인 "${headline}"에 따른 직접 라우팅`
    };
  }

  /**
   * 콘텐츠 타입 기반 라우팅
   */
  async routeByContentType(input) {
    const content = input.input.toLowerCase();
    
    // 프로젝트 관련 키워드
    if (this.containsKeywords(content, ['프로젝트', '기획', '개발', '출시', '런칭', 'KPI', '목표'])) {
      return {
        type: 'content_type_routing',
        confidence: 85,
        mapping: {
          meceCategory: '업무-핵심',
          processingType: 'project_analysis',
          priority: 'high',
          enableAI: true,
          enableSync: true
        },
        reasoning: '프로젝트 관련 키워드 감지'
      };
    }

    // 학습 관련 키워드
    if (this.containsKeywords(content, ['학습', '공부', '교육', '강의', '책', '독서', '연구'])) {
      return {
        type: 'content_type_routing',
        confidence: 80,
        mapping: {
          meceCategory: '학습-업무',
          processingType: 'knowledge_extraction',
          priority: 'medium',
          enableAI: true,
          enableSync: true
        },
        reasoning: '학습 관련 키워드 감지'
      };
    }

    // 개인 관리 관련 키워드
    if (this.containsKeywords(content, ['건강', '운동', '식단', '의료', '재정', '돈', '저축', '투자'])) {
      return {
        type: 'content_type_routing',
        confidence: 80,
        mapping: {
          meceCategory: '개인-필수',
          processingType: 'personal_management',
          priority: 'high',
          enableAI: true,
          enableSync: true
        },
        reasoning: '개인 관리 관련 키워드 감지'
      };
    }

    // 회의/문서 관련 키워드
    if (this.containsKeywords(content, ['회의', '보고서', '문서', '정리', '요약', '분석'])) {
      return {
        type: 'content_type_routing',
        confidence: 75,
        mapping: {
          meceCategory: '업무-지원',
          processingType: 'document_processing',
          priority: 'medium',
          enableAI: true,
          enableSync: true
        },
        reasoning: '문서/회의 관련 키워드 감지'
      };
    }

    throw new Error('콘텐츠 타입을 식별할 수 없습니다');
  }

  /**
   * 사용자 선호도 기반 라우팅
   */
  async routeByUserPreference(input) {
    const userId = input.userId || 'default';
    const preferences = this.userPatterns.preferences[userId] || {};

    if (preferences.defaultProcessingType) {
      return {
        type: 'user_preference_routing',
        confidence: 70,
        mapping: {
          meceCategory: preferences.defaultMECECategory || '업무-지원',
          processingType: preferences.defaultProcessingType,
          priority: preferences.defaultPriority || 'medium',
          enableAI: preferences.enableAI !== false,
          enableSync: preferences.enableSync !== false
        },
        reasoning: '사용자 선호도에 따른 라우팅'
      };
    }

    throw new Error('사용자 선호도 정보가 없습니다');
  }

  /**
   * AI 분석 기반 라우팅
   */
  async routeByAIAnalysis(input) {
    // 간단한 AI 분석 (실제로는 외부 AI 서비스 호출)
    const analysis = await this.performQuickAnalysis(input.input);
    
    return {
      type: 'ai_analysis_routing',
      confidence: analysis.confidence,
      mapping: {
        meceCategory: analysis.meceCategory,
        processingType: analysis.processingType,
        priority: analysis.priority,
        enableAI: true,
        enableSync: analysis.enableSync
      },
      reasoning: `AI 분석 결과: ${analysis.reasoning}`
    };
  }

  /**
   * 기본 라우팅
   */
  async routeByDefault(input) {
    return {
      type: 'default_routing',
      confidence: 50,
      mapping: {
        meceCategory: '업무-지원',
        processingType: 'general_processing',
        priority: 'medium',
        enableAI: input.enableAI !== false,
        enableSync: input.enableSync !== false
      },
      reasoning: '기본 라우팅 규칙 적용'
    };
  }

  /**
   * 빠른 AI 분석
   */
  async performQuickAnalysis(content) {
    // 간단한 키워드 기반 분석
    const keywords = {
      '업무-핵심': ['프로젝트', '기획', '개발', '출시', 'KPI', '목표', '전략'],
      '업무-지원': ['회의', '보고서', '문서', '정리', '요약', '분석', '협업'],
      '개인-필수': ['건강', '운동', '식단', '의료', '재정', '돈', '저축', '투자'],
      '개인-선택': ['취미', '관계', '여가', '여행', '문화', '예술'],
      '학습-업무': ['학습', '공부', '교육', '강의', '기술', '스킬', '인증'],
      '학습-교양': ['독서', '책', '문화', '예술', '역사', '철학', '교양']
    };

    const contentLower = content.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const score = categoryKeywords.reduce((acc, keyword) => {
        return acc + (contentLower.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    const confidence = Math.min(60 + (maxScore * 10), 90);
    
    return {
      meceCategory: bestMatch || '업무-지원',
      processingType: this.getProcessingTypeByCategory(bestMatch),
      priority: this.getPriorityByCategory(bestMatch),
      enableSync: ['업무-핵심', '업무-지원', '개인-필수', '학습-업무'].includes(bestMatch),
      confidence: confidence,
      reasoning: `키워드 매칭 점수: ${maxScore}`
    };
  }

  /**
   * 카테고리별 처리 타입 반환
   */
  getProcessingTypeByCategory(category) {
    const typeMapping = {
      '업무-핵심': 'project_analysis',
      '업무-지원': 'document_processing',
      '개인-필수': 'personal_management',
      '개인-선택': 'content_enhancement',
      '학습-업무': 'knowledge_extraction',
      '학습-교양': 'content_enhancement'
    };
    return typeMapping[category] || 'general_processing';
  }

  /**
   * 카테고리별 우선순위 반환
   */
  getPriorityByCategory(category) {
    const priorityMapping = {
      '업무-핵심': 'high',
      '업무-지원': 'medium',
      '개인-필수': 'high',
      '개인-선택': 'low',
      '학습-업무': 'medium',
      '학습-교양': 'low'
    };
    return priorityMapping[category] || 'medium';
  }

  /**
   * 유틸리티 함수들
   */
  isValidHeadline(headline) {
    const validHeadlines = [
      '[프로젝트-업무]', '[프로젝트-개인]',
      '[영역-업무]', '[영역-개인]',
      '[학습-전문]', '[학습-교양]',
      '[자료-업무]', '[자료-개인]',
      '[임시]'
    ];
    return validHeadlines.includes(headline);
  }

  detectContentType(content) {
    return content.length > 10; // 기본적으로 모든 콘텐츠에 적용
  }

  hasUserPreferences(input) {
    return input.userId && this.userPatterns.preferences[input.userId];
  }

  containsKeywords(content, keywords) {
    return keywords.some(keyword => content.includes(keyword));
  }

  getUserPreference(input) {
    const userId = input.userId || 'default';
    return this.userPatterns.preferences[userId]?.preferredRoute;
  }

  getRuleSuccessRate(ruleId) {
    const stats = this.userPatterns.successRates[ruleId];
    return stats ? stats.successRate : 0.5; // 기본 50%
  }

  recordExecutionTime(ruleId, executionTime) {
    if (!this.userPatterns.responseTimes[ruleId]) {
      this.userPatterns.responseTimes[ruleId] = [];
    }
    
    this.userPatterns.responseTimes[ruleId].push(executionTime);
    
    // 최근 100개만 유지
    if (this.userPatterns.responseTimes[ruleId].length > 100) {
      this.userPatterns.responseTimes[ruleId] = 
        this.userPatterns.responseTimes[ruleId].slice(-100);
    }
  }

  /**
   * 학습 함수들
   */
  async learnFromRoute(input, route, result) {
    const userId = input.userId || 'default';
    
    // 사용자 패턴 기록
    this.userPatterns.history.push({
      userId,
      input: input.input.substring(0, 100), // 처음 100자만 저장
      route: route.id,
      success: result.success !== false,
      timestamp: new Date().toISOString()
    });

    // 성공률 업데이트
    this.updateSuccessRate(route.id, result.success !== false);

    // 최근 1000개만 유지
    if (this.userPatterns.history.length > 1000) {
      this.userPatterns.history = this.userPatterns.history.slice(-1000);
    }
  }

  updateSuccessRate(ruleId, success) {
    if (!this.userPatterns.successRates[ruleId]) {
      this.userPatterns.successRates[ruleId] = {
        total: 0,
        successful: 0,
        successRate: 0
      };
    }

    const stats = this.userPatterns.successRates[ruleId];
    stats.total++;
    if (success) {
      stats.successful++;
    }
    stats.successRate = stats.successful / stats.total;
  }

  updateSuccessStats(startTime) {
    this.routingStats.successfulRoutes++;
    const executionTime = Date.now() - startTime;
    this.routingStats.avgResponseTime = 
      (this.routingStats.avgResponseTime * (this.routingStats.successfulRoutes - 1) + executionTime) / 
      this.routingStats.successfulRoutes;
  }

  updateFailureStats(startTime) {
    this.routingStats.failedRoutes++;
  }

  /**
   * 통계 조회
   */
  getStats() {
    const total = this.routingStats.totalRequests;
    const successRate = total > 0 ? this.routingStats.successfulRoutes / total : 0;
    
    return {
      ...this.routingStats,
      successRate: Math.round(successRate * 100),
      routeAccuracy: Math.round(this.calculateRouteAccuracy() * 100)
    };
  }

  calculateRouteAccuracy() {
    const recentHistory = this.userPatterns.history.slice(-100);
    if (recentHistory.length === 0) return 0;

    const successful = recentHistory.filter(entry => entry.success).length;
    return successful / recentHistory.length;
  }

  /**
   * 사용자 선호도 설정
   */
  setUserPreference(userId, preferences) {
    this.userPatterns.preferences[userId] = {
      ...this.userPatterns.preferences[userId],
      ...preferences
    };
  }

  /**
   * 라우팅 규칙 추가
   */
  addRoutingRule(rule) {
    this.routingRules.set(rule.id, rule);
  }

  /**
   * 라우팅 규칙 제거
   */
  removeRoutingRule(ruleId) {
    this.routingRules.delete(ruleId);
  }
}

module.exports = SmartRoutingEngine;
