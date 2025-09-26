/**
 * MECE 분류 엔진 - 2nd-Brain-Auto 하이브리드 시스템
 * 상호 배타적이고 전체를 포괄하는 분류 시스템
 */

class MECEClassifier {
  constructor(config = {}) {
    this.config = {
      confidenceThreshold: 70,
      enableLearning: true,
      fallbackCategory: '업무-지원',
      ...config
    };

    // MECE 분류 매트릭스 (6가지 핵심 카테고리)
    this.meceMatrix = {
      '업무-핵심': {
        description: '핵심 업무 프로젝트, KPI, 전략적 목표',
        keywords: ['프로젝트', '핵심업무', 'KPI', '성과', '목표', '전략', '기획', '개발', '출시', '런칭'],
        patterns: [/프로젝트.*기획/, /전략.*수립/, /KPI.*관리/, /성과.*목표/],
        destinations: ['notion', 'obsidian', 'localPC'],
        priority: '1Q',
        paraCategory: 'Projects'
      },
      '업무-지원': {
        description: '보고서, 회의록, 협업 문서, 지원 업무',
        keywords: ['회의', '보고서', '지원', '협업', '문서', '양식', '정리', '요약', '분석'],
        patterns: [/회의.*록/, /보고서.*작성/, /문서.*정리/, /협업.*지원/],
        destinations: ['notion', 'localPC'],
        priority: '2Q',
        paraCategory: 'Areas'
      },
      '개인-필수': {
        description: '건강관리, 재정관리, 생활 필수사항',
        keywords: ['건강', '재정', '관리', '필수', '생활', '유지', '의료', '금융', '보험'],
        patterns: [/건강.*관리/, /재정.*계획/, /의료.*예약/, /보험.*관리/],
        destinations: ['obsidian', 'localPC'],
        priority: '1Q',
        paraCategory: 'Areas'
      },
      '개인-선택': {
        description: '취미, 인간관계, 자기계발, 여가활동',
        keywords: ['취미', '관계', '자기계발', '여가', '흥미', '친구', '가족', '여행'],
        patterns: [/취미.*활동/, /자기계발/, /여가.*시간/, /관계.*관리/],
        destinations: ['obsidian'],
        priority: '4Q',
        paraCategory: 'Areas'
      },
      '학습-업무': {
        description: '업무 관련 전문기술, 직무교육, 산업지식',
        keywords: ['학습', '전문', '업무', '기술', '스킬', '교육', '훈련', '인증', '자격'],
        patterns: [/업무.*학습/, /전문.*기술/, /직무.*교육/, /인증.*취득/],
        destinations: ['obsidian', 'notion'],
        priority: '2Q',
        paraCategory: 'Resources'
      },
      '학습-교양': {
        description: '일반교양, 개인흥미, 문화예술, 독서',
        keywords: ['교양', '일반', '흥미', '독서', '문화', '예술', '역사', '철학'],
        patterns: [/독서.*활동/, /문화.*체험/, /교양.*학습/, /예술.*감상/],
        destinations: ['obsidian'],
        priority: '4Q',
        paraCategory: 'Resources'
      }
    };

    // 학습 데이터 저장소
    this.learningData = {
      userCorrections: [],
      patternWeights: {},
      accuracyHistory: []
    };

    // 헤드라인 라우팅 규칙
    this.headlineRules = {
      '[프로젝트-업무]': '업무-핵심',
      '[프로젝트-개인]': '개인-필수',
      '[영역-업무]': '업무-지원',
      '[영역-개인]': '개인-필수',
      '[학습-전문]': '학습-업무',
      '[학습-교양]': '학습-교양',
      '[자료-업무]': '업무-지원',
      '[자료-개인]': '개인-선택',
      '[임시]': 'temporary'
    };
  }

  /**
   * 메인 분류 함수
   * @param {string} input - 분류할 입력 텍스트
   * @param {string} userHeadline - 사용자 헤드라인 (선택사항)
   * @param {Object} context - 추가 컨텍스트 정보
   * @returns {Object} 분류 결과
   */
  async classify(input, userHeadline = null, context = {}) {
    try {
      // 1. 사용자 헤드라인 우선 처리
      if (userHeadline) {
        const headlineResult = this.processHeadline(userHeadline, input);
        if (headlineResult) {
          return this.formatResult(headlineResult, input, 'headline');
        }
      }

      // 2. 키워드 기반 1차 분류
      const keywordResult = this.classifyByKeywords(input);
      
      // 3. 패턴 매칭 2차 분류
      const patternResult = this.classifyByPatterns(input);
      
      // 4. 컨텍스트 분석 3차 분류
      const contextResult = this.classifyByContext(input, context);

      // 5. 결과 통합 및 신뢰도 계산
      const finalResult = this.integrateResults([keywordResult, patternResult, contextResult], input);

      // 6. MECE 원칙 검증
      const validation = this.validateMECE(finalResult);
      
      if (!validation.isValid) {
        console.warn(`MECE 위반 감지: ${validation.error}`);
        return this.handleMECEViolation(finalResult, validation, input);
      }

      // 7. 학습 데이터 업데이트
      if (this.config.enableLearning) {
        await this.updateLearningData(finalResult, input);
      }

      return this.formatResult(finalResult, input, 'ai_classification');

    } catch (error) {
      console.error('MECE 분류 오류:', error);
      return this.getFallbackResult(input, error);
    }
  }

  /**
   * 헤드라인 기반 분류
   */
  processHeadline(headline, input) {
    const normalizedHeadline = headline.toLowerCase().trim();
    const category = this.headlineRules[normalizedHeadline];
    
    if (category && category !== 'temporary') {
      const matrixData = this.meceMatrix[category];
      return {
        meceCategory: category,
        confidence: 95,
        source: 'headline',
        reasoning: `사용자 헤드라인 "${headline}"에 따른 분류`,
        ...matrixData
      };
    }
    
    return null;
  }

  /**
   * 키워드 기반 분류
   */
  classifyByKeywords(input) {
    const scores = {};
    const inputLower = input.toLowerCase();

    for (const [category, data] of Object.entries(this.meceMatrix)) {
      let score = 0;
      let matchedKeywords = [];

      // 키워드 매칭
      for (const keyword of data.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          score += 10;
          matchedKeywords.push(keyword);
        }
      }

      // 가중치 적용
      const weight = this.learningData.patternWeights[category] || 1;
      score *= weight;

      scores[category] = {
        score,
        matchedKeywords,
        confidence: Math.min(score, 100)
      };
    }

    // 최고 점수 카테고리 선택
    const bestCategory = Object.keys(scores).reduce((a, b) => 
      scores[a].score > scores[b].score ? a : b
    );

    return {
      meceCategory: bestCategory,
      confidence: scores[bestCategory].confidence,
      source: 'keywords',
      reasoning: `키워드 매칭: ${scores[bestCategory].matchedKeywords.join(', ')}`,
      matchedKeywords: scores[bestCategory].matchedKeywords
    };
  }

  /**
   * 패턴 기반 분류
   */
  classifyByPatterns(input) {
    const scores = {};

    for (const [category, data] of Object.entries(this.meceMatrix)) {
      let score = 0;
      let matchedPatterns = [];

      for (const pattern of data.patterns) {
        if (pattern.test(input)) {
          score += 15;
          matchedPatterns.push(pattern.toString());
        }
      }

      scores[category] = {
        score,
        matchedPatterns,
        confidence: Math.min(score, 100)
      };
    }

    const bestCategory = Object.keys(scores).reduce((a, b) => 
      scores[a].score > scores[b].score ? a : b
    );

    return {
      meceCategory: bestCategory,
      confidence: scores[bestCategory].confidence,
      source: 'patterns',
      reasoning: `패턴 매칭: ${scores[bestCategory].matchedPatterns.length}개 패턴 일치`,
      matchedPatterns: scores[bestCategory].matchedPatterns
    };
  }

  /**
   * 컨텍스트 기반 분류
   */
  classifyByContext(input, context) {
    // 시간대, 요일, 사용자 패턴 등을 고려한 분류
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    let contextScore = {};
    
    // 업무 시간대 (9-18시, 월-금) 가중치
    if (hour >= 9 && hour <= 18 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      contextScore['업무-핵심'] = 1.2;
      contextScore['업무-지원'] = 1.1;
    }
    
    // 개인 시간대 (18시 이후, 주말) 가중치
    if (hour >= 18 || dayOfWeek === 0 || dayOfWeek === 6) {
      contextScore['개인-필수'] = 1.2;
      contextScore['개인-선택'] = 1.1;
    }

    // 사용자 이전 패턴 고려
    if (context.userHistory) {
      const recentCategories = context.userHistory.slice(-10);
      const categoryFrequency = {};
      
      recentCategories.forEach(cat => {
        categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
      });
      
      Object.keys(categoryFrequency).forEach(cat => {
        contextScore[cat] = (contextScore[cat] || 1) * (1 + categoryFrequency[cat] * 0.1);
      });
    }

    // 컨텍스트 점수 적용
    const scores = {};
    for (const [category, data] of Object.entries(this.meceMatrix)) {
      const baseScore = 50; // 기본 점수
      const contextMultiplier = contextScore[category] || 1;
      scores[category] = {
        score: baseScore * contextMultiplier,
        confidence: Math.min(baseScore * contextMultiplier, 100)
      };
    }

    const bestCategory = Object.keys(scores).reduce((a, b) => 
      scores[a].score > scores[b].score ? a : b
    );

    return {
      meceCategory: bestCategory,
      confidence: scores[bestCategory].confidence,
      source: 'context',
      reasoning: `컨텍스트 분석: 시간대 ${hour}시, 요일 ${dayOfWeek}`
    };
  }

  /**
   * 분류 결과 통합
   */
  integrateResults(results, input) {
    const weights = {
      keywords: 0.4,
      patterns: 0.4,
      context: 0.2
    };

    const categoryScores = {};
    
    // 각 방법의 점수를 가중 평균으로 통합
    results.forEach((result, index) => {
      const method = result.source;
      const weight = weights[method] || 0.33;
      
      if (!categoryScores[result.meceCategory]) {
        categoryScores[result.meceCategory] = {
          totalScore: 0,
          totalWeight: 0,
          methods: []
        };
      }
      
      categoryScores[result.meceCategory].totalScore += result.confidence * weight;
      categoryScores[result.meceCategory].totalWeight += weight;
      categoryScores[result.meceCategory].methods.push(method);
    });

    // 최종 카테고리 선택
    const bestCategory = Object.keys(categoryScores).reduce((a, b) => 
      categoryScores[a].totalScore > categoryScores[b].totalScore ? a : b
    );

    const finalConfidence = categoryScores[bestCategory].totalScore / categoryScores[bestCategory].totalWeight;
    const matrixData = this.meceMatrix[bestCategory];

    return {
      meceCategory: bestCategory,
      confidence: Math.round(finalConfidence),
      source: 'integrated',
      reasoning: `통합 분석: ${categoryScores[bestCategory].methods.join(', ')} 방법 사용`,
      methods: categoryScores[bestCategory].methods,
      ...matrixData
    };
  }

  /**
   * MECE 원칙 검증
   */
  validateMECE(result) {
    // ME (상호 배타성) 검증
    const meValidation = this.validateMutualExclusivity(result);
    
    // CE (전체 포괄성) 검증
    const ceValidation = this.validateCollectiveExhaustiveness(result);

    return {
      isValid: meValidation.valid && ceValidation.valid,
      error: meValidation.error || ceValidation.error,
      meScore: meValidation.score,
      ceScore: ceValidation.score,
      overallScore: (meValidation.score + ceValidation.score) / 2
    };
  }

  /**
   * 상호 배타성 검증
   */
  validateMutualExclusivity(result) {
    // 하나의 카테고리에만 명확히 속하는지 확인
    if (!result.meceCategory || !this.meceMatrix[result.meceCategory]) {
      return {
        valid: false,
        error: '유효하지 않은 카테고리',
        score: 0
      };
    }

    // 신뢰도가 임계값 이상인지 확인
    if (result.confidence < this.config.confidenceThreshold) {
      return {
        valid: false,
        error: `신뢰도 부족 (${result.confidence}% < ${this.config.confidenceThreshold}%)`,
        score: result.confidence
      };
    }

    return {
      valid: true,
      score: result.confidence
    };
  }

  /**
   * 전체 포괄성 검증
   */
  validateCollectiveExhaustiveness(result) {
    // 분류된 카테고리가 MECE 매트릭스에 존재하는지 확인
    if (!this.meceMatrix[result.meceCategory]) {
      return {
        valid: false,
        error: '알 수 없는 카테고리',
        score: 0
      };
    }

    return {
      valid: true,
      score: 100
    };
  }

  /**
   * MECE 위반 처리
   */
  handleMECEViolation(result, validation, input) {
    console.warn('MECE 위반 감지, 대체 분류 시도:', validation.error);
    
    // 대체 분류 시도
    const fallbackResult = {
      meceCategory: this.config.fallbackCategory,
      confidence: 50,
      source: 'fallback',
      reasoning: `MECE 위반으로 인한 대체 분류: ${validation.error}`,
      ...this.meceMatrix[this.config.fallbackCategory]
    };

    return this.formatResult(fallbackResult, input, 'fallback');
  }

  /**
   * 결과 포맷팅
   */
  formatResult(result, input, source) {
    const timestamp = new Date().toISOString();
    
    return {
      // 기본 정보
      input: input,
      timestamp: timestamp,
      source: source,
      
      // MECE 분류
      meceCategory: result.meceCategory,
      confidence: result.confidence,
      reasoning: result.reasoning,
      
      // P.A.R.A 분류
      paraCategory: result.paraCategory || this.meceMatrix[result.meceCategory]?.paraCategory,
      priority: result.priority || this.meceMatrix[result.meceCategory]?.priority,
      
      // 플랫폼 정보
      destinations: result.destinations || this.meceMatrix[result.meceCategory]?.destinations,
      
      // 메타데이터
      keywords: result.matchedKeywords || [],
      patterns: result.matchedPatterns || [],
      methods: result.methods || [source],
      
      // 폴더 경로 생성
      folderPaths: this.generateFolderPaths(result.meceCategory, result.paraCategory),
      
      // 고유 ID
      id: `mece_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * 폴더 경로 생성
   */
  generateFolderPaths(meceCategory, paraCategory) {
    const basePaths = {
      obsidian: process.env.OBSIDIAN_VAULT_PATH || './vault',
      notion: process.env.NOTION_WORKSPACE_ID || 'workspace',
      localPC: process.env.LOCAL_PC_PATH || './local'
    };

    const folderMappings = {
      '업무-핵심': {
        obsidian: '001_활성-프로젝트',
        notion: 'Projects',
        localPC: '001_활성업무_2024'
      },
      '업무-지원': {
        obsidian: '002_책임-영역/업무영역',
        notion: 'Areas',
        localPC: '001_활성업무_2024/영역별_지속업무'
      },
      '개인-필수': {
        obsidian: '002_책임-영역/개인영역',
        notion: 'Areas',
        localPC: '003_개인업무외'
      },
      '개인-선택': {
        obsidian: '002_책임-영역/개인영역',
        notion: null,
        localPC: '003_개인업무외'
      },
      '학습-업무': {
        obsidian: '003_지식-자원/제텔카스텐/영구노트',
        notion: 'Resources',
        localPC: null
      },
      '학습-교양': {
        obsidian: '003_지식-자원/제텔카스텐/영구노트',
        notion: null,
        localPC: null
      }
    };

    const mapping = folderMappings[meceCategory] || {};
    const paths = {};

    Object.keys(basePaths).forEach(platform => {
      if (mapping[platform]) {
        paths[platform] = `${basePaths[platform]}/${mapping[platform]}`;
      } else {
        paths[platform] = null;
      }
    });

    return paths;
  }

  /**
   * 학습 데이터 업데이트
   */
  async updateLearningData(result, input) {
    // 사용자 수정 기록 저장
    this.learningData.userCorrections.push({
      timestamp: new Date().toISOString(),
      input: input,
      originalCategory: result.meceCategory,
      confidence: result.confidence
    });

    // 패턴 가중치 업데이트
    if (!this.learningData.patternWeights[result.meceCategory]) {
      this.learningData.patternWeights[result.meceCategory] = 1;
    }

    // 정확도 기록
    this.learningData.accuracyHistory.push({
      timestamp: new Date().toISOString(),
      category: result.meceCategory,
      confidence: result.confidence
    });

    // 최근 1000개만 유지
    if (this.learningData.userCorrections.length > 1000) {
      this.learningData.userCorrections = this.learningData.userCorrections.slice(-1000);
    }
    if (this.learningData.accuracyHistory.length > 1000) {
      this.learningData.accuracyHistory = this.learningData.accuracyHistory.slice(-1000);
    }
  }

  /**
   * 대체 결과 생성
   */
  getFallbackResult(input, error) {
    return {
      input: input,
      timestamp: new Date().toISOString(),
      source: 'error_fallback',
      meceCategory: this.config.fallbackCategory,
      confidence: 30,
      reasoning: `오류 발생으로 인한 대체 분류: ${error.message}`,
      paraCategory: 'Areas',
      priority: '4Q',
      destinations: ['obsidian'],
      folderPaths: this.generateFolderPaths(this.config.fallbackCategory, 'Areas'),
      id: `fallback_${Date.now()}`,
      error: error.message
    };
  }

  /**
   * 사용자 수정 처리
   */
  async handleUserCorrection(originalResult, correctedCategory) {
    if (!this.meceMatrix[correctedCategory]) {
      throw new Error(`유효하지 않은 수정 카테고리: ${correctedCategory}`);
    }

    // 수정 기록 저장
    this.learningData.userCorrections.push({
      timestamp: new Date().toISOString(),
      input: originalResult.input,
      originalCategory: originalResult.meceCategory,
      correctedCategory: correctedCategory,
      confidence: originalResult.confidence
    });

    // 패턴 가중치 조정
    const penalty = 0.1;
    const bonus = 0.2;
    
    this.learningData.patternWeights[originalResult.meceCategory] = 
      Math.max(0.1, (this.learningData.patternWeights[originalResult.meceCategory] || 1) - penalty);
    
    this.learningData.patternWeights[correctedCategory] = 
      (this.learningData.patternWeights[correctedCategory] || 1) + bonus;

    console.log(`사용자 수정 처리 완료: ${originalResult.meceCategory} → ${correctedCategory}`);
  }

  /**
   * 시스템 건강도 계산
   */
  getSystemHealth() {
    const recentCorrections = this.learningData.userCorrections.slice(-100);
    const recentAccuracy = this.learningData.accuracyHistory.slice(-100);
    
    const correctionRate = recentCorrections.length / 100;
    const avgConfidence = recentAccuracy.reduce((sum, item) => sum + item.confidence, 0) / recentAccuracy.length;
    
    return {
      correctionRate: Math.round(correctionRate * 100),
      avgConfidence: Math.round(avgConfidence),
      totalClassifications: this.learningData.accuracyHistory.length,
      systemHealth: Math.round((100 - correctionRate * 100 + avgConfidence) / 2)
    };
  }

  /**
   * 분류 통계 조회
   */
  getClassificationStats() {
    const stats = {};
    
    this.learningData.accuracyHistory.forEach(item => {
      if (!stats[item.category]) {
        stats[item.category] = { count: 0, totalConfidence: 0 };
      }
      stats[item.category].count++;
      stats[item.category].totalConfidence += item.confidence;
    });

    Object.keys(stats).forEach(category => {
      stats[category].avgConfidence = Math.round(
        stats[category].totalConfidence / stats[category].count
      );
    });

    return stats;
  }
}

module.exports = MECEClassifier;
