// health-check.js - 시스템 상태 체크
const axios = require('axios');
const Redis = require('ioredis');
const { Client } = require('pg');

class HealthChecker {
  constructor() {
    this.services = [
      { name: 'API Gateway', url: 'http://localhost:3000/health', critical: true },
      { name: 'n8n', url: 'http://localhost:5678/healthz', critical: true },
      { name: 'Obsidian Sync', url: 'http://localhost:3001/health', critical: true },
      { name: 'Claude Automation', url: 'http://localhost:3002/health', critical: false },
      { name: 'Perplexity Automation', url: 'http://localhost:3003/health', critical: false },
      { name: 'Local AI', url: 'http://localhost:11434/api/tags', critical: false },
      { name: 'Grafana', url: 'http://localhost:3004/api/health', critical: false }
    ];
  }

  async checkAll() {
    console.log('🔍 2nd-Brain-Auto 시스템 상태 체크 시작...\n');
    
    const results = await Promise.allSettled([
      this.checkServices(),
      this.checkDatabase(),
      this.checkRedis(),
      this.checkFileSystem(),
      this.checkAIModels()
    ]);

    this.printResults(results);
    return this.generateReport(results);
  }

  async checkServices() {
    const serviceResults = await Promise.allSettled(
      this.services.map(async (service) => {
        try {
          const response = await axios.get(service.url, { timeout: 5000 });
          return {
            name: service.name,
            status: 'healthy',
            responseTime: response.headers['x-response-time'] || 'N/A',
            critical: service.critical
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'unhealthy',
            error: error.message,
            critical: service.critical
          };
        }
      })
    );

    return serviceResults.map(result => result.status === 'fulfilled' ? result.value : result.reason);
  }

  async checkDatabase() {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'n8n',
      user: 'n8n',
      password: 'n8n_password'
    });

    try {
      await client.connect();
      const result = await client.query('SELECT version();');
      await client.end();
      
      return {
        name: 'PostgreSQL',
        status: 'healthy',
        version: result.rows[0].version.split(' ')[1]
      };
    } catch (error) {
      return {
        name: 'PostgreSQL',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkRedis() {
    const redis = new Redis({
      host: 'localhost',
      port: 6379,
      password: 'redis_password'
    });

    try {
      const pong = await redis.ping();
      const info = await redis.info('server');
      redis.disconnect();

      const version = info.match(/redis_version:([^\r\n]+)/)[1];
      
      return {
        name: 'Redis',
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        version: version
      };
    } catch (error) {
      return {
        name: 'Redis',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkFileSystem() {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // Obsidian vault 접근 확인
      const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
      if (vaultPath) {
        await fs.access(vaultPath);
        const stats = await fs.stat(vaultPath);
        
        return {
          name: 'File System',
          status: 'healthy',
          vaultPath: vaultPath,
          accessible: true,
          isDirectory: stats.isDirectory()
        };
      } else {
        return {
          name: 'File System',
          status: 'warning',
          message: 'OBSIDIAN_VAULT_PATH not configured'
        };
      }
    } catch (error) {
      return {
        name: 'File System',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkAIModels() {
    try {
      const response = await axios.get('http://localhost:11434/api/tags');
      const models = response.data.models || [];
      
      return {
        name: 'AI Models',
        status: models.length > 0 ? 'healthy' : 'warning',
        availableModels: models.map(m => m.name),
        count: models.length
      };
    } catch (error) {
      return {
        name: 'AI Models',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  printResults(results) {
    console.log('📊 상태 체크 결과:\n');
    
    results.forEach((category, index) => {
      const categoryName = ['Services', 'Database', 'Redis', 'File System', 'AI Models'][index];
      console.log(`\n🔹 ${categoryName}:`);
      
      if (category.status === 'fulfilled') {
        const data = category.value;
        if (Array.isArray(data)) {
          data.forEach(item => this.printServiceStatus(item));
        } else {
          this.printServiceStatus(data);
        }
      } else {
        console.log(`  ❌ 체크 실패: ${category.reason}`);
      }
    });
  }

  printServiceStatus(service) {
    const statusIcon = service.status === 'healthy' ? '✅' : 
                     service.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`  ${statusIcon} ${service.name}: ${service.status}`);
    
    if (service.version) console.log(`     버전: ${service.version}`);
    if (service.responseTime) console.log(`     응답시간: ${service.responseTime}`);
    if (service.error) console.log(`     오류: ${service.error}`);
    if (service.count !== undefined) console.log(`     개수: ${service.count}`);
  }

  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      overallStatus: 'healthy',
      services: {},
      recommendations: []
    };

    // 전체 상태 계산
    let criticalIssues = 0;
    let warnings = 0;

    results.forEach((category, index) => {
      if (category.status === 'fulfilled') {
        const data = category.value;
        if (Array.isArray(data)) {
          data.forEach(service => {
            if (service.critical && service.status === 'unhealthy') {
              criticalIssues++;
            } else if (service.status === 'warning') {
              warnings++;
            }
          });
        } else {
          if (data.status === 'unhealthy') {
            criticalIssues++;
          } else if (data.status === 'warning') {
            warnings++;
          }
        }
      }
    });

    if (criticalIssues > 0) {
      report.overallStatus = 'critical';
    } else if (warnings > 0) {
      report.overallStatus = 'warning';
    }

    // 권장사항 생성
    if (criticalIssues > 0) {
      report.recommendations.push('중요한 서비스에 문제가 있습니다. 즉시 확인이 필요합니다.');
    }
    if (warnings > 0) {
      report.recommendations.push('일부 서비스에 경고가 있습니다. 모니터링을 강화하세요.');
    }

    return report;
  }
}

// 실행 부분
if (require.main === module) {
  const healthChecker = new HealthChecker();
  healthChecker.checkAll()
    .then(report => {
      console.log(`\n📋 전체 상태: ${report.overallStatus.toUpperCase()}`);
      if (report.recommendations.length > 0) {
        console.log('\n💡 권장사항:');
        report.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
    })
    .catch(error => {
      console.error('❌ 헬스체크 실패:', error);
      process.exit(1);
    });
}

module.exports = HealthChecker;
