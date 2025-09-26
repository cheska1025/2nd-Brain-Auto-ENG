/**
 * 2nd-Brain-Auto 하이브리드 시스템 테스트 스크립트
 */

const axios = require('axios');
const colors = require('colors');

class SystemTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * 테스트 실행
   */
  async runTests() {
    console.log('🧪 2nd-Brain-Auto 하이브리드 시스템 테스트 시작...\n');

    const tests = [
      { name: '시스템 헬스체크', test: this.testHealthCheck },
      { name: 'MECE 분류 테스트', test: this.testMECEClassification },
      { name: 'AI 처리 테스트', test: this.testAIProcessing },
      { name: '동기화 테스트', test: this.testSync },
      { name: '라우팅 엔진 테스트', test: this.testRouting },
      { name: '통합 처리 테스트', test: this.testIntegratedProcessing },
      { name: '에러 처리 테스트', test: this.testErrorHandling }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test);
    }

    this.printResults();
  }

  /**
   * 개별 테스트 실행
   */
  async runTest(name, testFunction) {
    this.testResults.total++;
    console.log(`\n🔍 ${name} 실행 중...`);

    try {
      const result = await testFunction.call(this);
      if (result.success) {
        console.log(`✅ ${name} 통과`.green);
        this.testResults.passed++;
        this.testResults.details.push({
          name,
          status: 'PASSED',
          duration: result.duration || 0,
          details: result.details || ''
        });
      } else {
        console.log(`❌ ${name} 실패: ${result.error}`.red);
        this.testResults.failed++;
        this.testResults.details.push({
          name,
          status: 'FAILED',
          duration: result.duration || 0,
          error: result.error
        });
      }
    } catch (error) {
      console.log(`❌ ${name} 오류: ${error.message}`.red);
      this.testResults.failed++;
      this.testResults.details.push({
        name,
        status: 'ERROR',
        duration: 0,
        error: error.message
      });
    }
  }

  /**
   * 헬스체크 테스트
   */
  async testHealthCheck() {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${this.baseUrl.replace('/api', '')}/health`);
      
      if (response.status === 200 && response.data.status === 'healthy') {
        return {
          success: true,
          duration: Date.now() - startTime,
          details: `Uptime: ${response.data.uptime}s, Components: ${Object.keys(response.data.components).length}`
        };
      } else {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: '헬스체크 응답이 올바르지 않습니다'
        };
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: `헬스체크 요청 실패: ${error.message}`
      };
    }
  }

  /**
   * MECE 분류 테스트
   */
  async testMECEClassification() {
    const startTime = Date.now();
    
    const testCases = [
      {
        input: '새로운 웹사이트 프로젝트를 기획하고 있습니다',
        expectedCategory: '업무-핵심',
        userHeadline: '[프로젝트-업무]'
      },
      {
        input: 'React 19의 새로운 기능을 학습하고 있습니다',
        expectedCategory: '학습-업무',
        userHeadline: '[학습-전문]'
      },
      {
        input: '건강 관리를 위해 운동 계획을 세우고 있습니다',
        expectedCategory: '개인-필수',
        userHeadline: '[영역-개인]'
      }
    ];

    let passed = 0;
    let total = testCases.length;

    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${this.baseUrl}/mece/classify`, {
          input: testCase.input,
          userHeadline: testCase.userHeadline
        });

        if (response.data.meceCategory === testCase.expectedCategory) {
          passed++;
        } else {
          console.log(`  ⚠️  예상: ${testCase.expectedCategory}, 실제: ${response.data.meceCategory}`);
        }
      } catch (error) {
        console.log(`  ❌ MECE 분류 실패: ${error.message}`);
      }
    }

    return {
      success: passed === total,
      duration: Date.now() - startTime,
      details: `${passed}/${total} 테스트 케이스 통과`
    };
  }

  /**
   * AI 처리 테스트
   */
  async testAIProcessing() {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.baseUrl}/ai/process`, {
        input: '프로젝트 관리 방법론에 대해 분석해주세요',
        meceResult: {
          meceCategory: '학습-업무',
          confidence: 85,
          paraCategory: 'Resources'
        },
        processingType: 'knowledge_extraction'
      });

      if (response.data && response.data.ai) {
        return {
          success: true,
          duration: Date.now() - startTime,
          details: `Provider: ${response.data.ai.provider}, Type: ${response.data.ai.processingType}`
        };
      } else {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: 'AI 처리 응답이 올바르지 않습니다'
        };
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: `AI 처리 요청 실패: ${error.message}`
      };
    }
  }

  /**
   * 동기화 테스트
   */
  async testSync() {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.baseUrl}/sync/execute`, {
        content: '테스트 동기화 내용입니다',
        meceResult: {
          meceCategory: '업무-지원',
          destinations: ['obsidian', 'notion'],
          folderPaths: {
            obsidian: '002_책임-영역/업무영역',
            notion: 'Areas'
          }
        },
        aiResult: {
          processingType: 'document_processing',
          provider: 'claude'
        }
      });

      if (response.data && response.data.syncId) {
        return {
          success: true,
          duration: Date.now() - startTime,
          details: `Sync ID: ${response.data.syncId}, Status: ${response.data.status}`
        };
      } else {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: '동기화 응답이 올바르지 않습니다'
        };
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: `동기화 요청 실패: ${error.message}`
      };
    }
  }

  /**
   * 라우팅 엔진 테스트
   */
  async testRouting() {
    const startTime = Date.now();
    
    const testCases = [
      {
        input: { input: '프로젝트 기획서 작성', userHeadline: '[프로젝트-업무]' },
        expectedRoute: 'headline_routing'
      },
      {
        input: { input: 'React 학습 자료 정리', enableAI: true },
        expectedRoute: 'content_type_routing'
      }
    ];

    let passed = 0;
    let total = testCases.length;

    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${this.baseUrl}/process`, testCase.input);
        
        if (response.data.routing && response.data.routing.route) {
          passed++;
        } else {
          console.log(`  ⚠️  라우팅 정보가 없습니다`);
        }
      } catch (error) {
        console.log(`  ❌ 라우팅 테스트 실패: ${error.message}`);
      }
    }

    return {
      success: passed === total,
      duration: Date.now() - startTime,
      details: `${passed}/${total} 라우팅 테스트 통과`
    };
  }

  /**
   * 통합 처리 테스트
   */
  async testIntegratedProcessing() {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.baseUrl}/process`, {
        input: '팀 워크샵 결과를 정리하고 다음 단계를 계획하겠습니다',
        userHeadline: '[프로젝트-업무]',
        enableAI: true,
        enableSync: true
      });

      const requiredFields = ['mece', 'routing', 'integrated'];
      const hasAllFields = requiredFields.every(field => response.data[field]);

      if (hasAllFields) {
        return {
          success: true,
          duration: Date.now() - startTime,
          details: `MECE: ${response.data.mece.category}, AI: ${!!response.data.ai}, Sync: ${!!response.data.sync}`
        };
      } else {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: '통합 처리 결과에 필수 필드가 누락되었습니다'
        };
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: `통합 처리 요청 실패: ${error.message}`
      };
    }
  }

  /**
   * 에러 처리 테스트
   */
  async testErrorHandling() {
    const startTime = Date.now();
    
    const errorTestCases = [
      {
        input: { input: '' }, // 빈 입력
        expectedError: true
      },
      {
        input: { input: 'a'.repeat(10001) }, // 너무 긴 입력
        expectedError: true
      },
      {
        input: { input: '정상 입력', userHeadline: '[잘못된-헤드라인]' },
        expectedError: true
      }
    ];

    let passed = 0;
    let total = errorTestCases.length;

    for (const testCase of errorTestCases) {
      try {
        const response = await axios.post(`${this.baseUrl}/process`, testCase.input);
        
        if (testCase.expectedError && response.data.success === false) {
          passed++;
        } else if (!testCase.expectedError && response.data.success === true) {
          passed++;
        } else {
          console.log(`  ⚠️  예상: ${testCase.expectedError ? '에러' : '성공'}, 실제: ${response.data.success ? '성공' : '에러'}`);
        }
      } catch (error) {
        if (testCase.expectedError) {
          passed++;
        } else {
          console.log(`  ❌ 예상치 못한 에러: ${error.message}`);
        }
      }
    }

    return {
      success: passed === total,
      duration: Date.now() - startTime,
      details: `${passed}/${total} 에러 처리 테스트 통과`
    };
  }

  /**
   * 결과 출력
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약'.bold);
    console.log('='.repeat(60));
    
    const successRate = Math.round((this.testResults.passed / this.testResults.total) * 100);
    
    console.log(`총 테스트: ${this.testResults.total}`.white);
    console.log(`통과: ${this.testResults.passed}`.green);
    console.log(`실패: ${this.testResults.failed}`.red);
    console.log(`성공률: ${successRate}%`.bold);
    
    console.log('\n📋 상세 결과:');
    this.testResults.details.forEach(detail => {
      const status = detail.status === 'PASSED' ? '✅' : '❌';
      const duration = `${detail.duration}ms`;
      console.log(`  ${status} ${detail.name} (${duration})`);
      
      if (detail.error) {
        console.log(`     에러: ${detail.error}`.red);
      }
      if (detail.details) {
        console.log(`     상세: ${detail.details}`.gray);
      }
    });

    if (successRate >= 90) {
      console.log('\n🎉 시스템이 정상적으로 작동하고 있습니다!'.green.bold);
    } else if (successRate >= 70) {
      console.log('\n⚠️  일부 기능에 문제가 있습니다. 로그를 확인해주세요.'.yellow.bold);
    } else {
      console.log('\n❌ 시스템에 심각한 문제가 있습니다. 설정을 확인해주세요.'.red.bold);
    }
  }
}

// 테스트 실행
if (require.main === module) {
  const tester = new SystemTester();
  tester.runTests().catch(console.error);
}

module.exports = SystemTester;
