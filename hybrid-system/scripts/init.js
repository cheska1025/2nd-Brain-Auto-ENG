/**
 * 2nd-Brain-Auto 하이브리드 시스템 초기화 스크립트
 */

const fs = require('fs').promises;
const path = require('path');
const colors = require('colors');

class SystemInitializer {
  constructor() {
    this.config = {
      vaultPath: process.env.OBSIDIAN_VAULT_PATH || './vault',
      localPCPath: process.env.LOCAL_PC_PATH || './local',
      dataPath: process.env.DATA_PATH || './data'
    };
  }

  /**
   * 시스템 초기화 실행
   */
  async initialize() {
    console.log('🚀 2nd-Brain-Auto 하이브리드 시스템 초기화 시작...\n');

    try {
      // 1. 디렉토리 구조 생성
      await this.createDirectoryStructure();
      
      // 2. 설정 파일 생성
      await this.createConfigFiles();
      
      // 3. 템플릿 파일 생성
      await this.createTemplateFiles();
      
      // 4. 데이터베이스 초기화
      await this.initializeDatabase();
      
      // 5. 환경 변수 검증
      await this.validateEnvironment();
      
      console.log('\n✅ 시스템 초기화가 완료되었습니다!'.green.bold);
      console.log('\n📋 다음 단계:');
      console.log('1. .env 파일을 편집하여 API 키를 설정하세요');
      console.log('2. npm start 명령으로 시스템을 시작하세요');
      console.log('3. http://localhost:3000 에서 웹 대시보드에 접속하세요');
      
    } catch (error) {
      console.error('\n❌ 초기화 실패:', error.message);
      process.exit(1);
    }
  }

  /**
   * 디렉토리 구조 생성
   */
  async createDirectoryStructure() {
    console.log('📁 디렉토리 구조 생성 중...');
    
    const directories = [
      // Obsidian 볼트 구조
      `${this.config.vaultPath}/001_활성-프로젝트/2024년/Q1-2024`,
      `${this.config.vaultPath}/001_활성-프로젝트/2024년/Q2-2024`,
      `${this.config.vaultPath}/001_활성-프로젝트/2024년/Q3-2024`,
      `${this.config.vaultPath}/001_활성-프로젝트/2024년/Q4-2024`,
      `${this.config.vaultPath}/002_책임-영역/업무영역`,
      `${this.config.vaultPath}/002_책임-영역/개인영역`,
      `${this.config.vaultPath}/003_지식-자원/제텔카스텐/영구노트`,
      `${this.config.vaultPath}/003_지식-자원/제텔카스텐/문헌노트`,
      `${this.config.vaultPath}/003_지식-자원/제텔카스텐/순간노트`,
      `${this.config.vaultPath}/003_지식-자원/참조자료/001_업무자료`,
      `${this.config.vaultPath}/003_지식-자원/참조자료/002_학습자료`,
      `${this.config.vaultPath}/003_지식-자원/참조자료/003_개인자료`,
      `${this.config.vaultPath}/004_아카이브/완료프로젝트/2024년`,
      `${this.config.vaultPath}/999_임시작업방`,
      `${this.config.vaultPath}/.templates`,
      `${this.config.vaultPath}/.ai`,
      `${this.config.vaultPath}/.workflows`,

      // Local PC 구조
      `${this.config.localPCPath}/001_활성업무_2024/Q1_프로젝트`,
      `${this.config.localPCPath}/001_활성업무_2024/Q2_프로젝트`,
      `${this.config.localPCPath}/001_활성업무_2024/Q3_프로젝트`,
      `${this.config.localPCPath}/001_활성업무_2024/Q4_프로젝트`,
      `${this.config.localPCPath}/001_활성업무_2024/월별_정기업무`,
      `${this.config.localPCPath}/001_활성업무_2024/영역별_지속업무`,
      `${this.config.localPCPath}/002_참조자료`,
      `${this.config.localPCPath}/003_개인업무외`,
      `${this.config.localPCPath}/004_아카이브/2024년`,
      `${this.config.localPCPath}/999_임시작업방`,

      // 시스템 데이터 디렉토리
      `${this.config.dataPath}/logs`,
      `${this.config.dataPath}/cache`,
      `${this.config.dataPath}/backups`,
      `${this.config.dataPath}/sync-mappings`,
      `${this.config.dataPath}/user-patterns`
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }

    console.log('✅ 디렉토리 구조 생성 완료');
  }

  /**
   * 설정 파일 생성
   */
  async createConfigFiles() {
    console.log('⚙️ 설정 파일 생성 중...');

    // .env 파일 생성
    const envContent = `# 2nd-Brain-Auto 하이브리드 시스템 환경 변수

# 서버 설정
PORT=3000
NODE_ENV=development

# API 키 설정
CLAUDE_API_KEY=your_claude_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
NOTION_API_KEY=your_notion_api_key_here
NOTION_WORKSPACE_ID=your_notion_workspace_id_here

# AI 설정
PRIMARY_AI_PROVIDER=claude
FALLBACK_AI_PROVIDER=perplexity
MECE_CONFIDENCE_THRESHOLD=70
ROUTING_CONFIDENCE_THRESHOLD=70

# 동기화 설정
OBSIDIAN_VAULT_PATH=./vault
LOCAL_PC_PATH=./local
NOTION_PROJECTS_DB_ID=your_projects_db_id_here
NOTION_AREAS_DB_ID=your_areas_db_id_here
NOTION_RESOURCES_DB_ID=your_resources_db_id_here
NOTION_TASKS_DB_ID=your_tasks_db_id_here

# 시스템 설정
ENABLE_LEARNING=true
ENABLE_REAL_TIME_SYNC=true
SYNC_INTERVAL=5000
DATA_PATH=./data

# 로깅 설정
LOG_LEVEL=info
LOG_FILE=./data/logs/system.log

# 보안 설정
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
`;

    await fs.writeFile('.env', envContent);
    console.log('✅ .env 파일 생성 완료');

    // MECE 규칙 설정 파일 생성
    const meceRules = {
      "meceRules": {
        "업무-핵심": {
          "keywords": ["프로젝트", "핵심업무", "KPI", "성과", "목표", "전략", "기획", "개발", "출시", "런칭"],
          "destinations": ["notion", "obsidian", "localPC"],
          "priority": "high",
          "timeout": 30000
        },
        "업무-지원": {
          "keywords": ["회의", "보고서", "지원", "협업", "문서", "양식", "정리", "요약", "분석"],
          "destinations": ["notion", "localPC"],
          "priority": "medium",
          "timeout": 20000
        },
        "개인-필수": {
          "keywords": ["건강", "재정", "관리", "필수", "생활", "유지", "의료", "금융", "보험"],
          "destinations": ["obsidian", "localPC"],
          "priority": "high",
          "timeout": 25000
        },
        "개인-선택": {
          "keywords": ["취미", "관계", "자기계발", "여가", "흥미", "친구", "가족", "여행"],
          "destinations": ["obsidian"],
          "priority": "low",
          "timeout": 15000
        },
        "학습-업무": {
          "keywords": ["학습", "전문", "업무", "기술", "스킬", "교육", "훈련", "인증", "자격"],
          "destinations": ["obsidian", "notion"],
          "priority": "medium",
          "timeout": 20000
        },
        "학습-교양": {
          "keywords": ["교양", "일반", "흥미", "독서", "문화", "예술", "역사", "철학"],
          "destinations": ["obsidian"],
          "priority": "low",
          "timeout": 15000
        }
      }
    };

    await fs.writeFile('./config/mece-rules.json', JSON.stringify(meceRules, null, 2));
    console.log('✅ MECE 규칙 설정 파일 생성 완료');
  }

  /**
   * 템플릿 파일 생성
   */
  async createTemplateFiles() {
    console.log('📝 템플릿 파일 생성 중...');

    // Obsidian 템플릿들
    const obsidianTemplates = {
      'note.md': `# {{title}}

## 📋 MECE 분류 정보
- **분류**: {{meceCategory}}
- **P.A.R.A**: {{paraCategory}}
- **신뢰도**: {{confidence}}%
- **우선순위**: {{priority}}

## 📝 내용
{{content}}

## 🔗 연결
<!-- 관련 노트들이 자동으로 연결됩니다 -->

## 📊 액션 아이템
- [ ]

---
#{{meceCategory.replace('-', '_')}} #{{paraCategory.toLowerCase()}} #mece_compliant
Created: {{date}}
MECE-ID: {{id}}
`,

      'project.md': `# {{title}}

## 📋 프로젝트 정보
- **프로젝트 ID**: {{projectId}}
- **MECE 분류**: {{meceCategory}}
- **상태**: {{status}}
- **우선순위**: {{priority}}
- **목표 완료일**: {{targetDate}}

## 🎯 프로젝트 목표
{{objectives}}

## 📅 마일스톤
{{milestones}}

## 📊 성공 지표
{{successMetrics}}

## 🔗 관련 리소스
{{resources}}

## ⚠️ 위험 요소
{{risks}}

---
#project #{{meceCategory.replace('-', '_')}} #mece_compliant
Created: {{date}}
Project-ID: {{projectId}}
`,

      'meeting.md': `# {{title}}

## 📅 회의 정보
- **일시**: {{date}} {{time}}
- **참석자**: {{attendees}}
- **MECE 분류**: {{meceCategory}}

## 📝 회의 내용
{{content}}

## 📊 액션 아이템
{{actionItems}}

## 🔗 관련 문서
{{relatedDocs}}

---
#meeting #{{meceCategory.replace('-', '_')}} #mece_compliant
Created: {{date}}
Meeting-ID: {{id}}
`,

      'resource.md': `# {{title}}

## 📚 리소스 정보
- **타입**: {{resourceType}}
- **MECE 분류**: {{meceCategory}}
- **신뢰도**: {{confidence}}%

## 📖 핵심 내용
{{content}}

## 🔑 핵심 개념
{{coreConcepts}}

## 💡 실무 적용
{{practicalApplications}}

## 📚 추가 자료
{{additionalResources}}

---
#resource #{{meceCategory.replace('-', '_')}} #mece_compliant
Created: {{date}}
Resource-ID: {{id}}
`
    };

    for (const [filename, content] of Object.entries(obsidianTemplates)) {
      await fs.writeFile(`${this.config.vaultPath}/.templates/${filename}`, content);
    }

    console.log('✅ Obsidian 템플릿 파일 생성 완료');
  }

  /**
   * 데이터베이스 초기화
   */
  async initializeDatabase() {
    console.log('🗄️ 데이터베이스 초기화 중...');

    // SQLite 데이터베이스 초기화
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = `${this.config.dataPath}/system.db`;

    await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });

    // 테이블 생성 스크립트
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS processing_history (
        id TEXT PRIMARY KEY,
        input TEXT NOT NULL,
        mece_category TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        ai_provider TEXT,
        processing_type TEXT,
        sync_status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_mappings (
        id TEXT PRIMARY KEY,
        mece_category TEXT NOT NULL,
        platforms TEXT NOT NULL,
        sync_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_patterns (
        user_id TEXT PRIMARY KEY,
        preferences TEXT NOT NULL,
        success_rates TEXT NOT NULL,
        response_times TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        me_score INTEGER NOT NULL,
        ce_score INTEGER NOT NULL,
        overall_score INTEGER NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);
      db.exec(createTablesSQL, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
        db.close();
      });
    });

    console.log('✅ 데이터베이스 초기화 완료');
  }

  /**
   * 환경 변수 검증
   */
  async validateEnvironment() {
    console.log('🔍 환경 변수 검증 중...');

    const requiredEnvVars = [
      'CLAUDE_API_KEY',
      'PERPLEXITY_API_KEY',
      'NOTION_API_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.log('⚠️  다음 환경 변수가 설정되지 않았습니다:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('\n.env 파일을 편집하여 API 키를 설정해주세요.');
    } else {
      console.log('✅ 모든 필수 환경 변수가 설정되었습니다');
    }
  }
}

// 초기화 실행
if (require.main === module) {
  const initializer = new SystemInitializer();
  initializer.initialize().catch(console.error);
}

module.exports = SystemInitializer;
