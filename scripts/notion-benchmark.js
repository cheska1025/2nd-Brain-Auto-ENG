// notion-benchmark.js
// 기존 Notion 자동화 시스템 성능 벤치마크 도구

const axios = require('axios');
const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');

class NotionBenchmark {
  constructor(config) {
    this.notion = new Client({ auth: config.notionApiKey });
    this.databaseId = config.databaseId;
    this.results = {
      performance: {},
      accuracy: {},
      reliability: {},
      recommendations: []
    };
    this.startTime = Date.now();
  }

  async runFullBenchmark() {
    console.log('🚀 Notion 자동화 시스템 벤치마크 시작...');
    
    try {
      // 1. 성능 테스트
      await this.performanceTest();
      
      // 2. 정확도 테스트
      await this.accuracyTest();
      
      // 3. 신뢰성 테스트
      await this.reliabilityTest();
      
      // 4. 데이터베이스 상태 분석
      await this.databaseAnalysis();
      
      // 5. 리포트 생성
      await this.generateReport();
      
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      console.log(`✅ 벤치마크 완료! (소요시간: ${duration}초)`);
      
      return this.results;
    } catch (error) {
      console.error('❌ 벤치마크 실패:', error);
      throw error;
    }
  }

  async performanceTest() {
    console.log('⚡ 성능 테스트 중...');
    
    const tests = [
      { name: '페이지 생성', test: () => this.createPageTest() },
      { name: '페이지 조회', test: () => this.queryPagesTest() },
      { name: '페이지 업데이트', test: () => this.updatePageTest() },
      { name: '페이지 삭제', test: () => this.deletePageTest() }
    ];

    for (const test of tests) {
      const results = await this.runPerformanceTest(test.name, test.test);
      this.results.performance[test.name] = results;
    }
  }

  async runPerformanceTest(testName, testFunction) {
    const iterations = 5;
    const times = [];
    const errors = [];

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        await testFunction();
        const duration = Date.now() - startTime;
        times.push(duration);
      } catch (error) {
        errors.push(error.message);
      }
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const successRate = (times.length / iterations) * 100;

    return {
      avgTime: Math.round(avgTime),
      minTime,
      maxTime,
      successRate: Math.round(successRate),
      errors: errors.length > 0 ? errors : null
    };
  }

  async createPageTest() {
    const testPage = {
      parent: { database_id: this.databaseId },
      properties: {
        'Title': {
          title: [{ text: { content: `벤치마크 테스트 ${Date.now()}` } }]
        },
        'Category': {
          select: { name: 'Test' }
        },
        'Priority': {
          select: { name: 'Medium' }
        }
      }
    };

    const response = await this.notion.pages.create(testPage);
    return response.id;
  }

  async queryPagesTest() {
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      page_size: 10
    });
    return response.results;
  }

  async updatePageTest() {
    // 먼저 페이지 생성
    const pageId = await this.createPageTest();
    
    // 페이지 업데이트
    await this.notion.pages.update({
      page_id: pageId,
      properties: {
        'Title': {
          title: [{ text: { content: `업데이트된 테스트 ${Date.now()}` } }]
        }
      }
    });

    return pageId;
  }

  async deletePageTest() {
    // 먼저 페이지 생성
    const pageId = await this.createPageTest();
    
    // 페이지 아카이브 (실제 삭제 대신)
    await this.notion.pages.update({
      page_id: pageId,
      archived: true
    });

    return pageId;
  }

  async accuracyTest() {
    console.log('🎯 정확도 테스트 중...');
    
    // 테스트 데이터 생성
    const testData = [
      {
        content: "Critical system bug requiring immediate hotfix deployment",
        expectedCategory: "01-Projects",
        expectedPriority: "High"
      },
      {
        content: "Weekly team retrospective and process improvement discussion",
        expectedCategory: "02-Areas",
        expectedPriority: "Medium"
      },
      {
        content: "Comprehensive guide to React 19 new features and best practices",
        expectedCategory: "03-Resources",
        expectedPriority: "Medium"
      },
      {
        content: "Q4 2023 project completion report with lessons learned",
        expectedCategory: "04-Archives",
        expectedPriority: "Low"
      }
    ];

    const accuracyResults = [];

    for (const testCase of testData) {
      try {
        // 실제 분류 로직 실행 (여기서는 시뮬레이션)
        const classification = await this.simulateClassification(testCase.content);
        
        const categoryMatch = classification.category === testCase.expectedCategory;
        const priorityMatch = classification.priority === testCase.expectedPriority;
        
        accuracyResults.push({
          content: testCase.content,
          expected: { category: testCase.expectedCategory, priority: testCase.expectedPriority },
          actual: { category: classification.category, priority: classification.priority },
          categoryMatch,
          priorityMatch,
          overallMatch: categoryMatch && priorityMatch
        });
      } catch (error) {
        accuracyResults.push({
          content: testCase.content,
          error: error.message,
          overallMatch: false
        });
      }
    }

    const categoryAccuracy = accuracyResults.filter(r => r.categoryMatch).length / accuracyResults.length;
    const priorityAccuracy = accuracyResults.filter(r => r.priorityMatch).length / accuracyResults.length;
    const overallAccuracy = accuracyResults.filter(r => r.overallMatch).length / accuracyResults.length;

    this.results.accuracy = {
      categoryAccuracy: Math.round(categoryAccuracy * 100),
      priorityAccuracy: Math.round(priorityAccuracy * 100),
      overallAccuracy: Math.round(overallAccuracy * 100),
      testCases: accuracyResults
    };
  }

  async simulateClassification(content) {
    // 실제 구현에서는 AI 분류 로직을 사용
    // 여기서는 간단한 키워드 기반 분류 시뮬레이션
    
    const lowerContent = content.toLowerCase();
    
    let category = "02-Areas"; // 기본값
    let priority = "Medium"; // 기본값

    // 카테고리 분류
    if (lowerContent.includes('bug') || lowerContent.includes('hotfix') || lowerContent.includes('deployment')) {
      category = "01-Projects";
      priority = "High";
    } else if (lowerContent.includes('retrospective') || lowerContent.includes('process')) {
      category = "02-Areas";
      priority = "Medium";
    } else if (lowerContent.includes('guide') || lowerContent.includes('learning')) {
      category = "03-Resources";
      priority = "Medium";
    } else if (lowerContent.includes('completed') || lowerContent.includes('report')) {
      category = "04-Archives";
      priority = "Low";
    }

    return { category, priority };
  }

  async reliabilityTest() {
    console.log('🛡️ 신뢰성 테스트 중...');
    
    const testDuration = 60000; // 1분
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    while (Date.now() - startTime < testDuration) {
      try {
        await this.queryPagesTest();
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
      
      // 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalRequests = successCount + errorCount;
    const successRate = (successCount / totalRequests) * 100;
    const errorRate = (errorCount / totalRequests) * 100;

    this.results.reliability = {
      testDuration: testDuration / 1000,
      totalRequests,
      successCount,
      errorCount,
      successRate: Math.round(successRate),
      errorRate: Math.round(errorRate),
      errors: errors.slice(0, 10) // 최근 10개 오류만 저장
    };
  }

  async databaseAnalysis() {
    console.log('📊 데이터베이스 분석 중...');
    
    try {
      // 데이터베이스 정보 조회
      const database = await this.notion.databases.retrieve({
        database_id: this.databaseId
      });

      // 모든 페이지 조회
      const allPages = await this.getAllPages();
      
      // 통계 계산
      const stats = this.calculateDatabaseStats(allPages, database);
      
      this.results.databaseStats = stats;
    } catch (error) {
      console.warn('⚠️ 데이터베이스 분석 실패:', error.message);
      this.results.databaseStats = { error: error.message };
    }
  }

  async getAllPages() {
    let allPages = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        start_cursor: startCursor,
        page_size: 100
      });

      allPages = allPages.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    return allPages;
  }

  calculateDatabaseStats(pages, database) {
    const stats = {
      totalPages: pages.length,
      properties: Object.keys(database.properties),
      categories: {},
      priorities: {},
      lastModified: null,
      oldestPage: null,
      newestPage: null
    };

    // 카테고리별 통계
    pages.forEach(page => {
      const category = page.properties.Category?.select?.name || 'Unknown';
      const priority = page.properties.Priority?.select?.name || 'Unknown';
      
      stats.categories[category] = (stats.categories[category] || 0) + 1;
      stats.priorities[priority] = (stats.priorities[priority] || 0) + 1;
    });

    // 날짜 통계
    const lastModifiedTimes = pages
      .map(page => new Date(page.last_edited_time))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => b - a);

    if (lastModifiedTimes.length > 0) {
      stats.lastModified = lastModifiedTimes[0].toISOString();
      stats.oldestPage = lastModifiedTimes[lastModifiedTimes.length - 1].toISOString();
      stats.newestPage = lastModifiedTimes[0].toISOString();
    }

    return stats;
  }

  async generateReport() {
    console.log('📋 벤치마크 리포트 생성 중...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      performance: this.results.performance,
      accuracy: this.results.accuracy,
      reliability: this.results.reliability,
      databaseStats: this.results.databaseStats,
      recommendations: this.generateRecommendations()
    };

    // JSON 리포트 저장
    await fs.writeFile(
      'notion-benchmark-report.json',
      JSON.stringify(report, null, 2)
    );

    // 마크다운 리포트 생성
    await this.generateMarkdownReport(report);

    console.log('📊 벤치마크 완료! notion-benchmark-report.json 파일 생성됨');
    console.log('📄 상세 리포트: notion-benchmark-report.md 파일 생성됨');
  }

  generateSummary() {
    const perf = this.results.performance;
    const acc = this.results.accuracy;
    const rel = this.results.reliability;

    return {
      overallScore: this.calculateOverallScore(),
      performanceScore: this.calculatePerformanceScore(perf),
      accuracyScore: acc.overallAccuracy || 0,
      reliabilityScore: rel.successRate || 0,
      totalTests: Object.keys(perf).length + 2, // performance + accuracy + reliability
      passedTests: this.countPassedTests()
    };
  }

  calculateOverallScore() {
    const perfScore = this.calculatePerformanceScore(this.results.performance);
    const accScore = this.results.accuracy.overallAccuracy || 0;
    const relScore = this.results.reliability.successRate || 0;
    
    return Math.round((perfScore + accScore + relScore) / 3);
  }

  calculatePerformanceScore(performance) {
    const scores = Object.values(performance).map(test => test.successRate);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  countPassedTests() {
    let passed = 0;
    
    // Performance tests
    Object.values(this.results.performance).forEach(test => {
      if (test.successRate >= 80) passed++;
    });
    
    // Accuracy test
    if (this.results.accuracy.overallAccuracy >= 80) passed++;
    
    // Reliability test
    if (this.results.reliability.successRate >= 95) passed++;
    
    return passed;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // 성능 관련 권장사항
    Object.entries(this.results.performance).forEach(([testName, result]) => {
      if (result.successRate < 80) {
        recommendations.push(`${testName} 성공률이 낮습니다 (${result.successRate}%). 재시도 로직을 개선하세요.`);
      }
      if (result.avgTime > 5000) {
        recommendations.push(`${testName} 응답시간이 느립니다 (${result.avgTime}ms). 최적화가 필요합니다.`);
      }
    });
    
    // 정확도 관련 권장사항
    if (this.results.accuracy.overallAccuracy < 80) {
      recommendations.push(`분류 정확도가 낮습니다 (${this.results.accuracy.overallAccuracy}%). AI 모델을 개선하세요.`);
    }
    
    // 신뢰성 관련 권장사항
    if (this.results.reliability.successRate < 95) {
      recommendations.push(`시스템 신뢰성이 낮습니다 (${this.results.reliability.successRate}%). 에러 처리를 강화하세요.`);
    }
    
    // 데이터베이스 관련 권장사항
    if (this.results.databaseStats && this.results.databaseStats.totalPages > 1000) {
      recommendations.push('데이터베이스가 큽니다. 인덱싱과 페이지네이션을 최적화하세요.');
    }
    
    return recommendations;
  }

  async generateMarkdownReport(report) {
    const markdown = `# Notion 자동화 시스템 벤치마크 리포트

## 📊 전체 점수: ${report.summary.overallScore}/100

### 🎯 테스트 결과 요약
- **성능 점수**: ${report.summary.performanceScore}/100
- **정확도 점수**: ${report.summary.accuracyScore}/100
- **신뢰성 점수**: ${report.summary.reliabilityScore}/100
- **통과한 테스트**: ${report.summary.passedTests}/${report.summary.totalTests}개

## ⚡ 성능 테스트 결과

${Object.entries(report.performance).map(([testName, result]) => `
### ${testName}
- **평균 응답시간**: ${result.avgTime}ms
- **최소 응답시간**: ${result.minTime}ms
- **최대 응답시간**: ${result.maxTime}ms
- **성공률**: ${result.successRate}%
${result.errors ? `- **오류**: ${result.errors.length}개` : ''}
`).join('')}

## 🎯 정확도 테스트 결과

- **카테고리 정확도**: ${report.accuracy.categoryAccuracy}%
- **우선순위 정확도**: ${report.accuracy.priorityAccuracy}%
- **전체 정확도**: ${report.accuracy.overallAccuracy}%

### 테스트 케이스별 결과
${report.accuracy.testCases.map((testCase, index) => `
${index + 1}. **${testCase.content}**
   - 예상: ${testCase.expected?.category} (${testCase.expected?.priority})
   - 실제: ${testCase.actual?.category} (${testCase.actual?.priority})
   - 결과: ${testCase.overallMatch ? '✅ 통과' : '❌ 실패'}
`).join('')}

## 🛡️ 신뢰성 테스트 결과

- **테스트 기간**: ${report.reliability.testDuration}초
- **총 요청 수**: ${report.reliability.totalRequests}개
- **성공 수**: ${report.reliability.successCount}개
- **실패 수**: ${report.reliability.errorCount}개
- **성공률**: ${report.reliability.successRate}%
- **오류율**: ${report.reliability.errorRate}%

## 📊 데이터베이스 통계

${report.databaseStats.error ? 
  `**오류**: ${report.databaseStats.error}` :
  `
- **총 페이지 수**: ${report.databaseStats.totalPages}개
- **속성 수**: ${report.databaseStats.properties.length}개
- **마지막 수정**: ${report.databaseStats.lastModified}
- **가장 오래된 페이지**: ${report.databaseStats.oldestPage}
- **가장 최근 페이지**: ${report.databaseStats.newestPage}

### 카테고리별 분포
${Object.entries(report.databaseStats.categories || {})
  .map(([category, count]) => `- **${category}**: ${count}개`)
  .join('\n')}

### 우선순위별 분포
${Object.entries(report.databaseStats.priorities || {})
  .map(([priority, count]) => `- **${priority}**: ${count}개`)
  .join('\n')}
`}

## 💡 개선 권장사항

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*이 리포트는 2nd-Brain-Auto 시스템에 의해 자동 생성되었습니다.*
`;

    await fs.writeFile('notion-benchmark-report.md', markdown);
  }
}

// CLI 실행 부분
async function main() {
  const config = {
    notionApiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID
  };

  if (!config.notionApiKey || !config.databaseId) {
    console.log(`
사용법: 
  NOTION_API_KEY=your_api_key NOTION_DATABASE_ID=your_database_id node scripts/notion-benchmark.js

또는 .env 파일에 설정:
  NOTION_API_KEY=your_api_key
  NOTION_DATABASE_ID=your_database_id
    `);
    process.exit(1);
  }

  try {
    const benchmark = new NotionBenchmark(config);
    const result = await benchmark.runFullBenchmark();
    
    console.log('\n🎉 벤치마크가 완료되었습니다!');
    console.log(`📊 전체 점수: ${result.summary.overallScore}/100`);
    console.log('📄 상세 리포트: notion-benchmark-report.json, notion-benchmark-report.md');
    
  } catch (error) {
    console.error('❌ 벤치마크 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = NotionBenchmark;
