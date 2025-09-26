// backup-system.js - 시스템 백업
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = util.promisify(exec);

class SystemBackup {
  constructor() {
    this.backupPath = './backups';
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async createFullBackup() {
    console.log('💾 전체 시스템 백업 시작...');
    
    await this.ensureBackupDirectory();
    
    const backupTasks = [
      this.backupDatabase(),
      this.backupRedis(),
      this.backupN8nWorkflows(),
      this.backupConfiguration(),
      this.backupLogs()
    ];

    const results = await Promise.allSettled(backupTasks);
    this.reportBackupResults(results);
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      console.log(`📁 백업 디렉토리 생성: ${this.backupPath}`);
    } catch (error) {
      console.error('백업 디렉토리 생성 실패:', error);
      throw error;
    }
  }

  async backupDatabase() {
    try {
      const backupFile = `${this.backupPath}/postgres_${this.timestamp}.sql`;
      await execAsync(`docker exec 2nd-brain-postgres pg_dump -U n8n n8n > ${backupFile}`);
      console.log('✅ PostgreSQL 백업 완료');
      return { component: 'PostgreSQL', status: 'success', file: backupFile };
    } catch (error) {
      console.error('❌ PostgreSQL 백업 실패:', error);
      return { component: 'PostgreSQL', status: 'failed', error: error.message };
    }
  }

  async backupRedis() {
    try {
      const backupFile = `${this.backupPath}/redis_${this.timestamp}.rdb`;
      await execAsync(`docker exec 2nd-brain-redis redis-cli --rdb ${backupFile}`);
      console.log('✅ Redis 백업 완료');
      return { component: 'Redis', status: 'success', file: backupFile };
    } catch (error) {
      console.error('❌ Redis 백업 실패:', error);
      return { component: 'Redis', status: 'failed', error: error.message };
    }
  }

  async backupN8nWorkflows() {
    try {
      const workflowsDir = './n8n-data/workflows';
      const backupFile = `${this.backupPath}/workflows_${this.timestamp}.tar.gz`;
      
      await execAsync(`tar -czf ${backupFile} -C ${workflowsDir} .`);
      console.log('✅ n8n 워크플로우 백업 완료');
      return { component: 'n8n Workflows', status: 'success', file: backupFile };
    } catch (error) {
      console.error('❌ n8n 워크플로우 백업 실패:', error);
      return { component: 'n8n Workflows', status: 'failed', error: error.message };
    }
  }

  async backupConfiguration() {
    try {
      const configFiles = [
        '.env',
        'docker-compose.yml',
        'docker-compose.dev.yml',
        'package.json',
        'env.example'
      ];
      
      const backupFile = `${this.backupPath}/config_${this.timestamp}.tar.gz`;
      const filesToBackup = configFiles.filter(file => {
        try {
          require('fs').accessSync(file);
          return true;
        } catch {
          return false;
        }
      });
      
      if (filesToBackup.length > 0) {
        await execAsync(`tar -czf ${backupFile} ${filesToBackup.join(' ')}`);
        console.log('✅ 설정 파일 백업 완료');
        return { component: 'Configuration', status: 'success', file: backupFile };
      } else {
        return { component: 'Configuration', status: 'skipped', message: '설정 파일 없음' };
      }
    } catch (error) {
      console.error('❌ 설정 파일 백업 실패:', error);
      return { component: 'Configuration', status: 'failed', error: error.message };
    }
  }

  async backupLogs() {
    try {
      const logsDir = './logs';
      const backupFile = `${this.backupPath}/logs_${this.timestamp}.tar.gz`;
      
      // 로그 디렉토리가 존재하는지 확인
      try {
        await fs.access(logsDir);
        await execAsync(`tar -czf ${backupFile} -C ${logsDir} .`);
        console.log('✅ 로그 파일 백업 완료');
        return { component: 'Logs', status: 'success', file: backupFile };
      } catch {
        return { component: 'Logs', status: 'skipped', message: '로그 디렉토리 없음' };
      }
    } catch (error) {
      console.error('❌ 로그 파일 백업 실패:', error);
      return { component: 'Logs', status: 'failed', error: error.message };
    }
  }

  reportBackupResults(results) {
    console.log('\n📊 백업 결과 요약:');
    
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        const statusIcon = data.status === 'success' ? '✅' : 
                          data.status === 'skipped' ? '⏭️' : '❌';
        
        console.log(`  ${statusIcon} ${data.component}: ${data.status}`);
        
        if (data.file) {
          console.log(`     파일: ${data.file}`);
        }
        if (data.error) {
          console.log(`     오류: ${data.error}`);
        }
        if (data.message) {
          console.log(`     메시지: ${data.message}`);
        }
        
        if (data.status === 'success') successCount++;
        else if (data.status === 'failed') failedCount++;
        else if (data.status === 'skipped') skippedCount++;
      } else {
        console.log(`  ❌ 백업 실패: ${result.reason}`);
        failedCount++;
      }
    });
    
    console.log(`\n📈 백업 통계:`);
    console.log(`  성공: ${successCount}개`);
    console.log(`  실패: ${failedCount}개`);
    console.log(`  건너뜀: ${skippedCount}개`);
    
    if (failedCount === 0) {
      console.log('\n🎉 모든 백업이 성공적으로 완료되었습니다!');
    } else {
      console.log(`\n⚠️ ${failedCount}개의 백업이 실패했습니다. 로그를 확인하세요.`);
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupPath);
      const backupFiles = files.filter(file => file.endsWith('.sql') || file.endsWith('.rdb') || file.endsWith('.tar.gz'));
      
      console.log('📋 백업 파일 목록:');
      backupFiles.forEach(file => {
        const filePath = path.join(this.backupPath, file);
        const stats = require('fs').statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        const date = stats.mtime.toISOString().split('T')[0];
        console.log(`  ${file} (${size}MB, ${date})`);
      });
      
      return backupFiles;
    } catch (error) {
      console.error('백업 목록 조회 실패:', error);
      return [];
    }
  }

  async cleanupOldBackups(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.backupPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.backupPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`🗑️ 오래된 백업 삭제: ${file}`);
          deletedCount++;
        }
      }
      
      console.log(`✅ ${deletedCount}개의 오래된 백업 파일을 삭제했습니다.`);
      return deletedCount;
    } catch (error) {
      console.error('백업 정리 실패:', error);
      return 0;
    }
  }
}

// CLI 실행 부분
if (require.main === module) {
  const command = process.argv[2];
  const backup = new SystemBackup();
  
  switch (command) {
    case 'create':
      backup.createFullBackup();
      break;
      
    case 'list':
      backup.listBackups();
      break;
      
    case 'cleanup':
      const days = parseInt(process.argv[3]) || 30;
      backup.cleanupOldBackups(days);
      break;
      
    default:
      console.log(`
사용법: node scripts/backup-system.js <command>

명령어:
  create    - 전체 시스템 백업 생성
  list      - 백업 파일 목록 조회
  cleanup   - 오래된 백업 파일 정리 (기본 30일)

예제:
  node scripts/backup-system.js create
  node scripts/backup-system.js list
  node scripts/backup-system.js cleanup 7
      `);
  }
}

module.exports = SystemBackup;
