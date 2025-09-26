/**
 * 2nd-Brain-Auto 하이브리드 시스템 - 메인 애플리케이션
 * MECE 원칙 기반의 한국어 인터페이스와 AI 자동화를 결합한 지능형 지식 관리 시스템
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// 핵심 모듈
const MECEClassifier = require('./core/mece-classifier');
const AIHub = require('./core/ai-hub');
const SyncManager = require('./core/sync-manager');
const SmartRoutingEngine = require('./automation/smart-routing/routing-engine');

// 미들웨어
const errorHandler = require('./middleware/error-handler');
const requestLogger = require('./middleware/request-logger');
const authMiddleware = require('./middleware/auth');

class SecondBrainHybridSystem {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // 핵심 컴포넌트 초기화
    this.meceClassifier = null;
    this.aiHub = null;
    this.syncManager = null;
    this.routingEngine = null;
    
    // 시스템 상태
    this.isInitialized = false;
    this.startTime = new Date();
    
    this.initialize();
  }

  /**
   * 시스템 초기화
   */
  async initialize() {
    try {
      console.log('🚀 2nd-Brain-Auto 하이브리드 시스템 초기화 시작...');
      
      // Express 설정
      this.setupExpress();
      
      // 미들웨어 설정
      this.setupMiddleware();
      
      // 핵심 컴포넌트 초기화
      await this.initializeComponents();
      
      // 라우트 설정
      this.setupRoutes();
      
      // 에러 핸들러 설정
      this.setupErrorHandlers();
      
      // 서버 시작
      await this.startServer();
      
      this.isInitialized = true;
      console.log('✅ 2nd-Brain-Auto 하이브리드 시스템 초기화 완료');
      
    } catch (error) {
      console.error('❌ 시스템 초기화 실패:', error);
      process.exit(1);
    }
  }

  /**
   * Express 설정
   */
  setupExpress() {
    this.app.set('trust proxy', 1);
    this.app.set('json spaces', 2);
  }

  /**
   * 미들웨어 설정
   */
  setupMiddleware() {
    // 보안 미들웨어
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
          scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      }
    }));

    // CORS 설정
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // 압축
    this.app.use(compression());

    // 요청 크기 제한
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // 최대 100 요청
      message: {
        error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
    });
    this.app.use('/api', limiter);

    // 요청 로깅
    this.app.use(requestLogger);

    // 정적 파일 서빙
    this.app.use(express.static('./interfaces/web-dashboard'));
  }

  /**
   * 핵심 컴포넌트 초기화
   */
  async initializeComponents() {
    console.log('🔧 핵심 컴포넌트 초기화...');

    // MECE 분류기 초기화
    this.meceClassifier = new MECEClassifier({
      confidenceThreshold: process.env.MECE_CONFIDENCE_THRESHOLD || 70,
      enableLearning: process.env.ENABLE_LEARNING !== 'false'
    });

    // AI 허브 초기화
    this.aiHub = new AIHub({
      primaryProvider: process.env.PRIMARY_AI_PROVIDER || 'claude',
      fallbackProvider: process.env.FALLBACK_AI_PROVIDER || 'perplexity',
      enableLearning: process.env.ENABLE_LEARNING !== 'false'
    });

    // 동기화 관리자 초기화
    this.syncManager = new SyncManager({
      syncInterval: process.env.SYNC_INTERVAL || 5000,
      enableRealTimeSync: process.env.ENABLE_REAL_TIME_SYNC !== 'false'
    });

    // 라우팅 엔진 초기화
    this.routingEngine = new SmartRoutingEngine({
      enableLearning: process.env.ENABLE_LEARNING !== 'false',
      confidenceThreshold: process.env.ROUTING_CONFIDENCE_THRESHOLD || 70
    });

    console.log('✅ 핵심 컴포넌트 초기화 완료');
  }

  /**
   * 라우트 설정
   */
  setupRoutes() {
    // 헬스체크
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        components: {
          meceClassifier: !!this.meceClassifier,
          aiHub: !!this.aiHub,
          syncManager: !!this.syncManager,
          routingEngine: !!this.routingEngine
        }
      });
    });

    // API 라우트
    this.app.use('/api', this.createAPIRoutes());

    // 웹 대시보드
    this.app.get('/', (req, res) => {
      res.sendFile('./interfaces/web-dashboard/index.html', { root: __dirname });
    });

    // 404 핸들러
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: '요청한 리소스를 찾을 수 없습니다.',
        path: req.originalUrl
      });
    });
  }

  /**
   * API 라우트 생성
   */
  createAPIRoutes() {
    const router = express.Router();

    // 메인 처리 엔드포인트
    router.post('/process', async (req, res) => {
      try {
        const result = await this.processInput(req.body);
        res.json(result);
      } catch (error) {
        console.error('입력 처리 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // MECE 분류 엔드포인트
    router.post('/mece/classify', async (req, res) => {
      try {
        const { input, userHeadline, context } = req.body;
        const result = await this.meceClassifier.classify(input, userHeadline, context);
        res.json(result);
      } catch (error) {
        console.error('MECE 분류 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // AI 처리 엔드포인트
    router.post('/ai/process', async (req, res) => {
      try {
        const { input, meceResult, processingType, provider } = req.body;
        const result = await this.aiHub.processInput(input, {
          meceResult,
          processingType,
          provider
        });
        res.json(result);
      } catch (error) {
        console.error('AI 처리 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 동기화 실행 엔드포인트
    router.post('/sync/execute', async (req, res) => {
      try {
        const { content, meceResult, aiResult } = req.body;
        const result = await this.syncManager.syncContent(content, meceResult, aiResult);
        res.json(result);
      } catch (error) {
        console.error('동기화 실행 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 시스템 상태 조회
    router.get('/system/status', async (req, res) => {
      try {
        const status = await this.getSystemStatus();
        res.json(status);
      } catch (error) {
        console.error('시스템 상태 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 동기화 상태 조회
    router.get('/sync/status', async (req, res) => {
      try {
        const status = this.syncManager.getSyncStatus();
        res.json(status);
      } catch (error) {
        console.error('동기화 상태 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 최근 활동 조회
    router.get('/activity/recent', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = await this.getRecentActivity(limit);
        res.json(activities);
      } catch (error) {
        console.error('최근 활동 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 히스토리 조회
    router.get('/history', async (req, res) => {
      try {
        const { category, date, limit = 50 } = req.query;
        const history = await this.getHistory({ category, date, limit });
        res.json(history);
      } catch (error) {
        console.error('히스토리 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 분석 데이터 조회
    router.get('/analytics', async (req, res) => {
      try {
        const period = parseInt(req.query.period) || 7;
        const analytics = await this.getAnalytics(period);
        res.json(analytics);
      } catch (error) {
        console.error('분석 데이터 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 사용자 수정 처리
    router.post('/correction', async (req, res) => {
      try {
        const { resultId, correctedCategory } = req.body;
        const result = await this.aiHub.handleUserCorrection(resultId, correctedCategory);
        res.json(result);
      } catch (error) {
        console.error('사용자 수정 처리 오류:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    return router;
  }

  /**
   * 에러 핸들러 설정
   */
  setupErrorHandlers() {
    this.app.use(errorHandler);
  }

  /**
   * 서버 시작
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🌐 서버가 포트 ${this.port}에서 실행 중입니다`);
          console.log(`📊 웹 대시보드: http://localhost:${this.port}`);
          console.log(`🔗 API 엔드포인트: http://localhost:${this.port}/api`);
          resolve();
        }
      });
    });
  }

  /**
   * 메인 입력 처리 함수
   */
  async processInput(input) {
    try {
      // 1. 라우팅 결정
      const routingResult = await this.routingEngine.route(input);
      
      if (!routingResult.success) {
        throw new Error(`라우팅 실패: ${routingResult.error}`);
      }

      // 2. MECE 분류 실행
      const meceResult = await this.meceClassifier.classify(
        input.input,
        input.userHeadline,
        input.context
      );

      // 3. AI 처리 실행 (라우팅 결과에 따라)
      let aiResult = null;
      if (routingResult.result.mapping.enableAI) {
        aiResult = await this.aiHub.processInput(input.input, {
          meceResult,
          processingType: routingResult.result.mapping.processingType,
          provider: input.provider
        });
      }

      // 4. 동기화 실행 (라우팅 결과에 따라)
      let syncResult = null;
      if (routingResult.result.mapping.enableSync) {
        syncResult = await this.syncManager.syncContent(
          input.input,
          meceResult,
          aiResult
        );
      }

      // 5. 결과 통합
      const finalResult = this.integrateResults(input, meceResult, aiResult, syncResult, routingResult);

      return finalResult;

    } catch (error) {
      console.error('입력 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 결과 통합
   */
  integrateResults(input, meceResult, aiResult, syncResult, routingResult) {
    return {
      // 기본 정보
      input: input.input,
      timestamp: new Date().toISOString(),
      id: `hybrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      
      // 라우팅 정보
      routing: {
        route: routingResult.route,
        confidence: routingResult.result.confidence,
        reasoning: routingResult.result.reasoning,
        executionTime: routingResult.executionTime
      },
      
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
      ai: aiResult ? {
        processingType: aiResult.ai.processingType,
        provider: aiResult.ai.provider,
        response: aiResult.ai.response,
        timestamp: aiResult.ai.timestamp
      } : null,
      
      // 동기화 결과
      sync: syncResult ? {
        status: syncResult.status,
        platforms: syncResult.platforms,
        syncId: syncResult.syncId,
        timestamp: syncResult.timestamp
      } : null,
      
      // 통합 결과
      integrated: {
        title: aiResult?.integrated.title || meceResult.title || '제목 없음',
        summary: aiResult?.integrated.summary || '요약 없음',
        actionItems: aiResult?.integrated.actionItems || ['액션 아이템 없음'],
        tags: aiResult?.integrated.tags || [
          meceResult.meceCategory.replace('-', '_'),
          meceResult.paraCategory.toLowerCase(),
          'hybrid_system'
        ],
        metadata: {
          meceId: meceResult.id,
          routingId: routingResult.route,
          processingType: routingResult.result.mapping.processingType,
          provider: aiResult?.ai.provider || 'none',
          confidence: meceResult.confidence,
          source: meceResult.source,
          methods: meceResult.methods || [],
          createdAt: meceResult.timestamp,
          processedAt: aiResult?.ai.timestamp || null,
          syncedAt: syncResult?.timestamp || null
        }
      },
      
      // 처리 옵션
      options: {
        enableAI: routingResult.result.mapping.enableAI,
        enableSync: routingResult.result.mapping.enableSync,
        userHeadline: input.userHeadline,
        processingType: routingResult.result.mapping.processingType,
        priority: routingResult.result.mapping.priority
      }
    };
  }

  /**
   * 시스템 상태 조회
   */
  async getSystemStatus() {
    const [aiStatus, meceHealth, classificationStats] = await Promise.all([
      this.aiHub.getSystemStatus(),
      this.meceClassifier.getSystemHealth(),
      this.meceClassifier.getClassificationStats()
    ]);

    return {
      performance: aiStatus.performance,
      meceHealth: meceHealth,
      classificationStats: classificationStats,
      routingStats: this.routingEngine.getStats(),
      syncStatus: this.syncManager.getSyncStatus(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 최근 활동 조회
   */
  async getRecentActivity(limit = 10) {
    // 실제로는 데이터베이스에서 조회해야 함
    return [
      {
        type: 'classification',
        title: 'MECE 분류 완료',
        description: '새로운 입력이 성공적으로 분류되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        type: 'ai_processing',
        title: 'AI 처리 완료',
        description: 'Claude를 통한 AI 분석이 완료되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        type: 'sync',
        title: '동기화 완료',
        description: '3개 플랫폼 동기화가 완료되었습니다',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ].slice(0, limit);
  }

  /**
   * 히스토리 조회
   */
  async getHistory({ category, date, limit = 50 }) {
    // 실제로는 데이터베이스에서 조회해야 함
    return [];
  }

  /**
   * 분석 데이터 조회
   */
  async getAnalytics(period = 7) {
    // 실제로는 데이터베이스에서 조회해야 함
    return {
      totalProcessed: 150,
      avgConfidence: 85,
      mostUsedCategory: '업무-핵심',
      categoryStats: {
        labels: ['업무-핵심', '업무-지원', '개인-필수', '학습-업무', '학습-교양', '개인-선택'],
        data: [45, 30, 25, 20, 15, 10]
      },
      providerStats: {
        labels: ['Claude', 'Perplexity', 'Ollama'],
        data: [95, 88, 75]
      }
    };
  }

  /**
   * 서버 종료
   */
  async shutdown() {
    console.log('🛑 서버 종료 중...');
    
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
    
    console.log('✅ 서버가 안전하게 종료되었습니다');
  }
}

// 애플리케이션 시작
const app = new SecondBrainHybridSystem();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호 수신');
  await app.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT 신호 수신');
  await app.shutdown();
  process.exit(0);
});

// 예상치 못한 오류 처리
process.on('uncaughtException', (error) => {
  console.error('예상치 못한 오류:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  process.exit(1);
});

module.exports = SecondBrainHybridSystem;
