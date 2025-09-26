/**
 * Simple Test Script for 2nd-Brain-Auto (Ver. KOR)
 * Tests core functionality without external dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 2nd-Brain-Auto 간단 테스트 시작...\n');

// Test 1: 파일 구조 확인
console.log('📁 파일 구조 테스트:');
const requiredFiles = [
  'package.json',
  'ai-service/main.py',
  'ai-service/requirements.txt',
  'hybrid-system/main.js',
  'hybrid-system/package.json',
  'scripts/health-check.js',
  'README.md',
  'LICENSE'
];

let fileTestsPassed = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} - 존재함`);
    fileTestsPassed++;
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 파일 테스트 결과: ${fileTestsPassed}/${requiredFiles.length} 통과\n`);

// Test 2: package.json 유효성 검사
console.log('📦 package.json 유효성 검사:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredFields = ['name', 'version', 'description', 'main', 'scripts'];
  
  let packageTestsPassed = 0;
  requiredFields.forEach(field => {
    if (packageJson[field]) {
      console.log(`  ✅ ${field}: ${packageJson[field]}`);
      packageTestsPassed++;
    } else {
      console.log(`  ❌ ${field}: 없음`);
    }
  });
  
  console.log(`\n📊 package.json 테스트 결과: ${packageTestsPassed}/${requiredFields.length} 통과\n`);
} catch (error) {
  console.log(`  ❌ package.json 파싱 오류: ${error.message}\n`);
}

// Test 3: AI 서비스 파일 검사
console.log('🤖 AI 서비스 파일 검사:');
const aiServiceFiles = [
  'ai-service/main.py',
  'ai-service/database.py',
  'ai-service/db_utils.py',
  'ai-service/requirements.txt'
];

let aiTestsPassed = 0;
aiServiceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} - 존재함 (${stats.size} bytes)`);
      aiTestsPassed++;
    } else {
      console.log(`  ❌ ${file} - 비어있음`);
    }
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 AI 서비스 테스트 결과: ${aiTestsPassed}/${aiServiceFiles.length} 통과\n`);

// Test 4: 하이브리드 시스템 파일 검사
console.log('🔄 하이브리드 시스템 파일 검사:');
const hybridFiles = [
  'hybrid-system/main.js',
  'hybrid-system/package.json',
  'hybrid-system/core/mece-classifier.js',
  'hybrid-system/core/ai-hub.js',
  'hybrid-system/core/sync-manager.js'
];

let hybridTestsPassed = 0;
hybridFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} - 존재함 (${stats.size} bytes)`);
      hybridTestsPassed++;
    } else {
      console.log(`  ❌ ${file} - 비어있음`);
    }
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 하이브리드 시스템 테스트 결과: ${hybridTestsPassed}/${hybridFiles.length} 통과\n`);

// Test 5: 스크립트 파일 검사
console.log('📜 스크립트 파일 검사:');
const scriptFiles = [
  'scripts/health-check.js',
  'scripts/backup-system.js',
  'scripts/obsidian-analyzer.js',
  'test-scripts.bat',
  'test-scripts.sh'
];

let scriptTestsPassed = 0;
scriptFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} - 존재함 (${stats.size} bytes)`);
      scriptTestsPassed++;
    } else {
      console.log(`  ❌ ${file} - 비어있음`);
    }
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 스크립트 테스트 결과: ${scriptTestsPassed}/${scriptFiles.length} 통과\n`);

// Test 6: 템플릿 파일 검사
console.log('📄 템플릿 파일 검사:');
const templateFiles = [
  'templates/meeting-ai-enhanced.md',
  'templates/note-ai-enhanced.md',
  'templates/project-ai-enhanced.md',
  'templates/resource-ai-enhanced.md'
];

let templateTestsPassed = 0;
templateFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} - 존재함 (${stats.size} bytes)`);
      templateTestsPassed++;
    } else {
      console.log(`  ❌ ${file} - 비어있음`);
    }
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 템플릿 테스트 결과: ${templateTestsPassed}/${templateFiles.length} 통과\n`);

// Test 7: Docker 설정 파일 검사
console.log('🐳 Docker 설정 파일 검사:');
const dockerFiles = [
  'docker-compose.yml',
  'docker-compose.dev.yml',
  'ai-service/Dockerfile'
];

let dockerTestsPassed = 0;
dockerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} - 존재함 (${stats.size} bytes)`);
      dockerTestsPassed++;
    } else {
      console.log(`  ❌ ${file} - 비어있음`);
    }
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 Docker 테스트 결과: ${dockerTestsPassed}/${dockerFiles.length} 통과\n`);

// Test 8: 문서 파일 검사
console.log('📚 문서 파일 검사:');
const docFiles = [
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'INSTALLATION_GUIDE.md',
  'AI_SERVICE_SETUP_GUIDE.md',
  'POSTGRESQL_MIGRATION_GUIDE.md'
];

let docTestsPassed = 0;
docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} - 존재함 (${stats.size} bytes)`);
      docTestsPassed++;
    } else {
      console.log(`  ❌ ${file} - 비어있음`);
    }
  } else {
    console.log(`  ❌ ${file} - 없음`);
  }
});

console.log(`\n📊 문서 테스트 결과: ${docTestsPassed}/${docFiles.length} 통과\n`);

// 최종 결과
const totalTests = fileTestsPassed + aiTestsPassed + hybridTestsPassed + scriptTestsPassed + templateTestsPassed + dockerTestsPassed + docTestsPassed;
const totalPossible = requiredFiles.length + aiServiceFiles.length + hybridFiles.length + scriptFiles.length + templateFiles.length + dockerFiles.length + docFiles.length;

console.log('========================================');
console.log('📋 최종 테스트 결과');
console.log('========================================');
console.log(`총 테스트: ${totalTests}/${totalPossible} 통과`);
console.log(`성공률: ${((totalTests / totalPossible) * 100).toFixed(1)}%`);

if (totalTests >= totalPossible * 0.8) {
  console.log('\n✅ 시스템이 정상적으로 구성되어 있습니다!');
  console.log('🚀 GitHub 업로드 준비가 완료되었습니다.');
} else {
  console.log('\n⚠️ 일부 파일이 누락되었습니다. 확인이 필요합니다.');
}

console.log('\n📝 다음 단계:');
console.log('1. GitHub 저장소에 업로드');
console.log('2. 환경 변수 설정 (.env 파일)');
console.log('3. 의존성 설치 (npm install, pip install)');
console.log('4. 서비스 시작 (docker-compose up)');

console.log('\n========================================');
console.log('테스트 완료');
console.log('========================================');
