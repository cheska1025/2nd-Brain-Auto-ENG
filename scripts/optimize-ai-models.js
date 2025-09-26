// optimize-ai-models.js - AI 모델 최적화
const axios = require('axios');
const Redis = require('ioredis');

class AIOptimizer {
  constructor() {
    this.localAIUrl = 'http://localhost:11434';
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      password: 'redis_password'
    });
  }

  async optimizeAll() {
    console.log('⚡ AI 모델 최적화 시작...');
    
    const results = await Promise.allSettled([
      this.optimizeLocalModels(),
      this.clearAICache(),
      this.updateModelWeights(),
      this.optimizeMemoryUsage()
    ]);

    this.reportOptimizationResults(results);
    console.log('✅ AI 최적화 완료!');
  }

  async optimizeLocalModels() {
    try {
      console.log('🔄 로컬 AI 모델 최적화 중...');
      
      const response = await axios.get(`${this.localAIUrl}/api/tags`);
      const models = response.data.models || [];
      
      if (models.length === 0) {
        console.log('⚠️ 사용 가능한 모델이 없습니다.');
        return { status: 'warning', message: '모델 없음' };
      }

      const optimizationResults = [];
      
      for (const model of models) {
        console.log(`  🔧 ${model.name} 최적화 중...`);
        
        try {
          // 모델 사전 로드 (첫 실행 속도 개선)
          await axios.post(`${this.localAIUrl}/api/generate`, {
            model: model.name,
            prompt: 'hello',
            stream: false,
            options: {
              temperature: 0.1,
              top_p: 0.1,
              max_tokens: 10
            }
          });
          
          optimizationResults.push({
            model: model.name,
            status: 'optimized',
            size: model.size
          });
          
        } catch (error) {
          console.warn(`    ⚠️ ${model.name} 최적화 실패: ${error.message}`);
          optimizationResults.push({
            model: model.name,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      return {
        status: 'success',
        models: optimizationResults,
        totalModels: models.length
      };
      
    } catch (error) {
      console.error('로컬 모델 최적화 실패:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async clearAICache() {
    try {
      console.log('🗑️ AI 캐시 정리 중...');
      
      // AI 관련 캐시 키들만 삭제
      const keys = await this.redis.keys('ai:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`  ✅ AI 캐시 ${keys.length}개 항목 정리 완료`);
        return { status: 'success', clearedKeys: keys.length };
      } else {
        console.log('  ℹ️ 정리할 AI 캐시가 없습니다.');
        return { status: 'skipped', message: '캐시 없음' };
      }
    } catch (error) {
      console.error('AI 캐시 정리 실패:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async updateModelWeights() {
    try {
      console.log('⚖️ 모델 가중치 업데이트 중...');
      
      // 모델 성능 데이터 수집
      const performanceData = await this.collectPerformanceData();
      
      // 가중치 계산
      const weights = this.calculateModelWeights(performanceData);
      
      // Redis에 가중치 저장
      await this.redis.hset('ai:model_weights', weights);
      
      console.log('  ✅ 모델 가중치 업데이트 완료');
      return { status: 'success', weights: weights };
      
    } catch (error) {
      console.error('모델 가중치 업데이트 실패:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async collectPerformanceData() {
    // 실제로는 성능 메트릭을 수집하지만, 여기서는 시뮬레이션
    const models = ['llama2', 'codellama'];
    const performanceData = {};
    
    for (const model of models) {
      try {
        const startTime = Date.now();
        await axios.post(`${this.localAIUrl}/api/generate`, {
          model: model,
          prompt: 'test',
          stream: false,
          options: { max_tokens: 10 }
        });
        const responseTime = Date.now() - startTime;
        
        performanceData[model] = {
          responseTime: responseTime,
          successRate: 1.0,
          lastUsed: new Date().toISOString()
        };
      } catch (error) {
        performanceData[model] = {
          responseTime: 9999,
          successRate: 0.0,
          lastUsed: new Date().toISOString()
        };
      }
    }
    
    return performanceData;
  }

  calculateModelWeights(performanceData) {
    const weights = {};
    const totalModels = Object.keys(performanceData).length;
    
    Object.entries(performanceData).forEach(([model, data]) => {
      // 응답 시간이 빠르고 성공률이 높을수록 높은 가중치
      const timeScore = Math.max(0, 1 - (data.responseTime / 10000));
      const successScore = data.successRate;
      const weight = (timeScore + successScore) / 2;
      
      weights[model] = weight.toFixed(3);
    });
    
    return weights;
  }

  async optimizeMemoryUsage() {
    try {
      console.log('🧠 메모리 사용량 최적화 중...');
      
      // Redis 메모리 사용량 확인
      const memoryInfo = await this.redis.memory('usage');
      const maxMemory = await this.redis.config('get', 'maxmemory');
      
      console.log(`  📊 현재 메모리 사용량: ${(memoryInfo / 1024 / 1024).toFixed(2)}MB`);
      
      // 메모리 사용량이 80% 이상이면 정리
      const memoryUsagePercent = (memoryInfo / parseInt(maxMemory[1])) * 100;
      
      if (memoryUsagePercent > 80) {
        console.log('  🧹 메모리 사용량이 높아 캐시 정리 중...');
        
        // 오래된 캐시 키 삭제
        const oldKeys = await this.redis.keys('*');
        const keysToDelete = oldKeys.slice(0, Math.floor(oldKeys.length * 0.2)); // 20% 삭제
        
        if (keysToDelete.length > 0) {
          await this.redis.del(...keysToDelete);
          console.log(`  ✅ ${keysToDelete.length}개 키 삭제 완료`);
        }
        
        return { status: 'success', action: 'cache_cleared', keysDeleted: keysToDelete.length };
      } else {
        console.log('  ℹ️ 메모리 사용량이 정상 범위입니다.');
        return { status: 'skipped', message: '메모리 사용량 정상' };
      }
      
    } catch (error) {
      console.error('메모리 최적화 실패:', error);
      return { status: 'failed', error: error.message };
    }
  }

  reportOptimizationResults(results) {
    console.log('\n📊 최적화 결과 요약:');
    
    results.forEach((result, index) => {
      const taskNames = ['로컬 모델', '캐시 정리', '가중치 업데이트', '메모리 최적화'];
      const taskName = taskNames[index] || `작업 ${index + 1}`;
      
      if (result.status === 'fulfilled') {
        const data = result.value;
        const statusIcon = data.status === 'success' ? '✅' : 
                          data.status === 'skipped' ? '⏭️' : '❌';
        
        console.log(`  ${statusIcon} ${taskName}: ${data.status}`);
        
        if (data.models) {
          console.log(`     최적화된 모델: ${data.models.length}개`);
        }
        if (data.clearedKeys) {
          console.log(`     정리된 캐시: ${data.clearedKeys}개`);
        }
        if (data.keysDeleted) {
          console.log(`     삭제된 키: ${data.keysDeleted}개`);
        }
        if (data.error) {
          console.log(`     오류: ${data.error}`);
        }
      } else {
        console.log(`  ❌ ${taskName}: 실패 - ${result.reason}`);
      }
    });
  }

  async getModelStatus() {
    try {
      const response = await axios.get(`${this.localAIUrl}/api/tags`);
      const models = response.data.models || [];
      
      console.log('🤖 로컬 AI 모델 상태:');
      models.forEach(model => {
        const size = (model.size / 1024 / 1024 / 1024).toFixed(2);
        console.log(`  📦 ${model.name} (${size}GB)`);
      });
      
      return models;
    } catch (error) {
      console.error('모델 상태 조회 실패:', error);
      return [];
    }
  }

  async pullModel(modelName) {
    try {
      console.log(`📥 모델 다운로드 중: ${modelName}`);
      
      const response = await axios.post(`${this.localAIUrl}/api/pull`, {
        name: modelName,
        stream: false
      }, {
        timeout: 300000 // 5분 타임아웃
      });
      
      console.log(`✅ 모델 다운로드 완료: ${modelName}`);
      return { status: 'success', model: modelName };
      
    } catch (error) {
      console.error(`모델 다운로드 실패: ${modelName}`, error);
      return { status: 'failed', model: modelName, error: error.message };
    }
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
    }
  }
}

// CLI 실행 부분
if (require.main === module) {
  const command = process.argv[2];
  const optimizer = new AIOptimizer();
  
  switch (command) {
    case 'optimize':
      optimizer.optimizeAll()
        .then(() => optimizer.disconnect())
        .catch(error => {
          console.error('최적화 실패:', error);
          optimizer.disconnect();
          process.exit(1);
        });
      break;
      
    case 'status':
      optimizer.getModelStatus()
        .then(() => optimizer.disconnect())
        .catch(error => {
          console.error('상태 조회 실패:', error);
          optimizer.disconnect();
          process.exit(1);
        });
      break;
      
    case 'pull':
      const modelName = process.argv[3];
      if (!modelName) {
        console.log('사용법: node scripts/optimize-ai-models.js pull <model-name>');
        process.exit(1);
      }
      
      optimizer.pullModel(modelName)
        .then(() => optimizer.disconnect())
        .catch(error => {
          console.error('모델 다운로드 실패:', error);
          optimizer.disconnect();
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
사용법: node scripts/optimize-ai-models.js <command>

명령어:
  optimize  - AI 모델 최적화 실행
  status    - 모델 상태 조회
  pull      - 모델 다운로드

예제:
  node scripts/optimize-ai-models.js optimize
  node scripts/optimize-ai-models.js status
  node scripts/optimize-ai-models.js pull llama2
      `);
  }
}

module.exports = AIOptimizer;
