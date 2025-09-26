// claude-provider.js
// Claude Pro 웹 자동화 제공자

const puppeteer = require('puppeteer');
const axios = require('axios');

class ClaudeProvider {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
    this.session = null;
    this.isLoggedIn = false;
    this.lastActivity = Date.now();
  }

  async initialize() {
    if (this.browser) return;

    try {
      this.browser = await puppeteer.launch({
        headless: false, // 디버깅을 위해 false, 프로덕션에서는 true
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      
      // User-Agent 설정
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // 뷰포트 설정
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      console.log('✅ Claude 브라우저 초기화 완료');
    } catch (error) {
      console.error('❌ Claude 브라우저 초기화 실패:', error);
      throw error;
    }
  }

  async login() {
    if (this.isLoggedIn) return true;

    try {
      await this.initialize();
      
      console.log('🔐 Claude 로그인 시도...');
      
      // Claude 웹사이트로 이동
      await this.page.goto('https://claude.ai', { waitUntil: 'networkidle2' });
      
      // 로그인 버튼 클릭
      await this.page.waitForSelector('button[data-testid="login-button"]', { timeout: 10000 });
      await this.page.click('button[data-testid="login-button"]');
      
      // 이메일 입력
      await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await this.page.type('input[type="email"]', this.config.email);
      
      // 다음 버튼 클릭
      await this.page.click('button[type="submit"]');
      
      // 비밀번호 입력 페이지 대기
      await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await this.page.type('input[type="password"]', this.config.password);
      
      // 로그인 완료
      await this.page.click('button[type="submit"]');
      
      // 로그인 성공 확인
      await this.page.waitForSelector('[data-testid="conversation-input"]', { timeout: 30000 });
      
      this.isLoggedIn = true;
      this.lastActivity = Date.now();
      
      console.log('✅ Claude 로그인 성공');
      return true;
      
    } catch (error) {
      console.error('❌ Claude 로그인 실패:', error);
      this.isLoggedIn = false;
      return false;
    }
  }

  async classifyContent(content, context = {}) {
    const prompt = this.buildClassificationPrompt(content, context);
    return await this.sendPrompt(prompt, 'classification');
  }

  async summarizeContent(content, context = {}) {
    const prompt = this.buildSummarizationPrompt(content, context);
    return await this.sendPrompt(prompt, 'summarization');
  }

  async enhanceContent(content, context = {}) {
    const prompt = this.buildEnhancementPrompt(content, context);
    return await this.sendPrompt(prompt, 'enhancement');
  }

  async generateContent(content, context = {}) {
    const prompt = this.buildGenerationPrompt(content, context);
    return await this.sendPrompt(prompt, 'generation');
  }

  async processGeneral(content, context = {}) {
    return await this.classifyContent(content, context);
  }

  async sendPrompt(prompt, taskType = 'general') {
    try {
      // 세션 유지 확인
      await this.maintainSession();
      
      // 로그인 확인
      if (!this.isLoggedIn) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Claude 로그인 실패');
        }
      }

      console.log(`🤖 Claude에게 ${taskType} 요청 전송...`);
      
      // 입력 필드 찾기
      const inputSelector = '[data-testid="conversation-input"]';
      await this.page.waitForSelector(inputSelector, { timeout: 10000 });
      
      // 기존 내용 지우기
      await this.page.click(inputSelector);
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyA');
      await this.page.keyboard.up('Control');
      await this.page.keyboard.press('Backspace');
      
      // 프롬프트 입력
      await this.page.type(inputSelector, prompt);
      
      // 전송 버튼 클릭
      await this.page.click('button[data-testid="send-button"]');
      
      // 응답 대기
      const response = await this.waitForResponse();
      
      // 결과 파싱
      const parsedResult = this.parseResponse(response, taskType);
      
      this.lastActivity = Date.now();
      
      return {
        ...parsedResult,
        provider: 'claude',
        taskType: taskType
      };
      
    } catch (error) {
      console.error(`Claude ${taskType} 처리 실패:`, error);
      throw new Error(`Claude ${taskType} 처리 실패: ${error.message}`);
    }
  }

  async waitForResponse() {
    try {
      // 응답이 완료될 때까지 대기
      await this.page.waitForFunction(() => {
        const messages = document.querySelectorAll('[data-testid="message"]');
        const lastMessage = messages[messages.length - 1];
        return lastMessage && !lastMessage.querySelector('[data-testid="loading"]');
      }, { timeout: 60000 });
      
      // 마지막 메시지의 텍스트 추출
      const lastMessage = await this.page.evaluate(() => {
        const messages = document.querySelectorAll('[data-testid="message"]');
        const lastMessage = messages[messages.length - 1];
        return lastMessage ? lastMessage.textContent : '';
      });
      
      return lastMessage.trim();
      
    } catch (error) {
      console.error('응답 대기 실패:', error);
      throw new Error('Claude 응답 대기 실패');
    }
  }

  parseResponse(response, taskType) {
    switch (taskType) {
      case 'classification':
        return this.parseClassificationResponse(response);
      case 'summarization':
        return this.parseSummarizationResponse(response);
      case 'enhancement':
        return this.parseEnhancementResponse(response);
      case 'generation':
        return this.parseGenerationResponse(response);
      default:
        return this.parseGeneralResponse(response);
    }
  }

  parseClassificationResponse(response) {
    try {
      // JSON 응답 파싱 시도
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || '02-Areas',
          confidence: parsed.confidence || 0.8,
          reason: parsed.reason || 'Claude AI 분류',
          suggestedTags: parsed.suggestedTags || [],
          priority: parsed.priority || 'medium'
        };
      }
    } catch (error) {
      console.warn('JSON 파싱 실패, 텍스트 분석으로 전환');
    }

    // 텍스트 분석으로 폴백
    return this.parseTextClassification(response);
  }

  parseTextClassification(response) {
    const lowerResponse = response.toLowerCase();
    
    let category = '02-Areas';
    let confidence = 0.8;
    let priority = 'medium';
    
    // 카테고리 추출
    if (lowerResponse.includes('project') || lowerResponse.includes('프로젝트')) {
      category = '01-Projects';
    } else if (lowerResponse.includes('resource') || lowerResponse.includes('자원')) {
      category = '03-Resources';
    } else if (lowerResponse.includes('archive') || lowerResponse.includes('아카이브')) {
      category = '04-Archives';
    }
    
    // 우선순위 추출
    if (lowerResponse.includes('high') || lowerResponse.includes('높음') || lowerResponse.includes('urgent')) {
      priority = 'high';
    } else if (lowerResponse.includes('low') || lowerResponse.includes('낮음')) {
      priority = 'low';
    }
    
    return {
      category,
      confidence,
      reason: 'Claude AI 텍스트 분석',
      suggestedTags: this.extractTagsFromResponse(response),
      priority
    };
  }

  parseSummarizationResponse(response) {
    return {
      summary: response.trim(),
      provider: 'claude'
    };
  }

  parseEnhancementResponse(response) {
    return {
      enhanced: response.trim(),
      provider: 'claude'
    };
  }

  parseGenerationResponse(response) {
    return {
      generated: response.trim(),
      provider: 'claude'
    };
  }

  parseGeneralResponse(response) {
    return {
      result: response.trim(),
      provider: 'claude'
    };
  }

  extractTagsFromResponse(response) {
    const tagRegex = /#([a-zA-Z0-9가-힣_-]+)/g;
    const matches = response.match(tagRegex) || [];
    return matches.map(tag => tag.substring(1));
  }

  buildClassificationPrompt(content, context) {
    return `
다음 내용을 P.A.R.A 방법론으로 정확히 분류하고, 적절한 태그와 우선순위를 제안해주세요:

${content}

JSON 형식으로 응답해주세요:
{
  "category": "분류 결과",
  "confidence": 0.95,
  "reason": "상세한 분류 이유",
  "suggestedTags": ["관련", "태그들"],
  "priority": "우선순위",
  "nextActions": ["제안할", "다음", "행동들"]
}
`;
  }

  buildSummarizationPrompt(content, context) {
    return `
다음 내용을 핵심을 유지하면서 간결하게 요약해주세요:

${content}

요약 요구사항:
- 3-5문장으로 핵심 내용 요약
- 중요한 키워드와 데이터 포함
- 한국어로 작성
- 실행 가능한 액션 아이템이 있다면 포함

요약:
`;
  }

  buildEnhancementPrompt(content, context) {
    return `
다음 내용을 개선하고 확장해주세요:

${content}

개선 방향:
- 구조화된 형식으로 정리
- 누락된 정보 보완
- 가독성 향상
- 관련 키워드와 태그 추가
- 실행 가능한 다음 단계 제안

개선된 내용:
`;
  }

  buildGenerationPrompt(content, context) {
    return `
다음 내용을 바탕으로 새로운 유용한 내용을 생성해주세요:

기존 내용: ${content}

생성 요구사항:
- 기존 내용과 연관성 유지
- 실용적이고 구체적인 내용
- 체계적인 구조
- 실행 가능한 가이드라인 포함

생성된 내용:
`;
  }

  async maintainSession() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    // 30분 이상 비활성 상태면 세션 갱신
    if (timeSinceLastActivity > 30 * 60 * 1000) {
      console.log('🔄 Claude 세션 갱신 중...');
      await this.refreshSession();
    }
  }

  async refreshSession() {
    try {
      if (this.page) {
        // 페이지 새로고침
        await this.page.reload({ waitUntil: 'networkidle2' });
        
        // 로그인 상태 확인
        const isStillLoggedIn = await this.page.evaluate(() => {
          return document.querySelector('[data-testid="conversation-input"]') !== null;
        });
        
        if (!isStillLoggedIn) {
          console.log('🔐 세션 만료, 재로그인 필요');
          this.isLoggedIn = false;
          await this.login();
        } else {
          console.log('✅ 세션 유지됨');
          this.lastActivity = Date.now();
        }
      }
    } catch (error) {
      console.error('세션 갱신 실패:', error);
      this.isLoggedIn = false;
    }
  }

  async checkHealth() {
    try {
      if (!this.browser) {
        return { status: 'not_initialized', available: false };
      }

      const pages = await this.browser.pages();
      if (pages.length === 0) {
        return { status: 'no_pages', available: false };
      }

      // 현재 페이지 상태 확인
      const isLoggedIn = await this.page.evaluate(() => {
        return document.querySelector('[data-testid="conversation-input"]') !== null;
      });

      return {
        status: isLoggedIn ? 'healthy' : 'not_logged_in',
        available: isLoggedIn,
        lastActivity: this.lastActivity
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        available: false
      };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
      console.log('🔒 Claude 브라우저 종료');
    }
  }
}

module.exports = ClaudeProvider;
