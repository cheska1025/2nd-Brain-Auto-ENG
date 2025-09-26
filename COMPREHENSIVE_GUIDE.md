# 🧠 2nd-Brain-Auto (Ver. KOR) - 종합 가이드

AI 기반 지식 관리 시스템으로 Obsidian과 n8n을 통합한 P.A.R.A 방법론 기반의 두 번째 뇌 시스템입니다.

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [설치 및 환경 설정](#설치-및-환경-설정)
3. [AI 서비스 설정](#ai-서비스-설정)
4. [데이터베이스 설정](#데이터베이스-설정)
5. [n8n 워크플로우 설정](#n8n-워크플로우-설정)
6. [Obsidian 통합](#obsidian-통합)
7. [GitHub 업로드](#github-업로드)
8. [고급 기능](#고급-기능)
9. [문제 해결](#문제-해결)
10. [성능 최적화](#성능-최적화)
11. [기여하기](#기여하기)

---

## 🎯 시스템 개요

### 주요 기능

#### 🤖 AI 기반 자동화
- **P.A.R.A 분류**: AI가 콘텐츠를 자동으로 Projects, Areas, Resources, Archives로 분류
- **스마트 태깅**: AI가 생성한 지능형 태그로 콘텐츠 자동 태깅
- **콘텐츠 분석**: 감정 분석, 복잡도 평가, 핵심 개념 추출
- **다중 AI 제공자**: Claude, OpenAI, Perplexity 지원

#### 🔄 하이브리드 시스템
- **MECE 원칙**: 상호 배타적이고 완전 포괄적인 분류 체계
- **스마트 라우팅**: 입력 유형에 따른 자동 처리 경로 결정
- **실시간 동기화**: Obsidian, Notion, 기타 플랫폼과의 실시간 동기화

#### 📊 고급 기능
- **성능 모니터링**: 실시간 시스템 상태 및 성능 모니터링
- **백업 및 복원**: 자동 백업 및 데이터 복원 시스템
- **분석 대시보드**: 사용 패턴 및 생산성 분석

### 시스템 요구사항

#### 최소 요구사항
- **OS**: Windows 10/11, macOS 10.15+, 또는 Linux (Ubuntu 20.04+)
- **RAM**: 8GB (AI 기능을 위해 16GB 권장)
- **저장공간**: 5GB 여유 공간 (10GB 권장)
- **CPU**: 4코어 (AI 처리용 8코어 권장)
- **인터넷**: AI 서비스를 위한 안정적인 연결

#### 필수 소프트웨어
- **Node.js**: v18.0.0 이상
- **Python**: 3.8 이상 (3.9+ 권장)
- **npm**: v8.0.0 이상
- **Git**: 최신 버전
- **Obsidian**: 최신 버전
- **Cursor AI**: 최신 버전

#### 전체 기능을 위한 요구사항
- **PostgreSQL**: 13+ (데이터 지속성 및 고급 기능용)
- **Redis**: 캐싱 및 성능 향상용
- **Docker**: 컨테이너화된 서비스용 (권장)

---

## 🔧 설치 및 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/cheska1025/2nd-Brain-Auto-KOR.git
cd 2nd-Brain-Auto-KOR
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 생성
cp env.example .env

# 환경 변수 편집 (API 키 설정)
nano .env
```

**필수 환경 변수:**
```env
# AI 서비스 설정
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
PERPLEXITY_API_KEY=your_perplexity_key

# 데이터베이스 설정
DATABASE_URL=postgresql://user:password@localhost:5432/n8n
REDIS_URL=redis://localhost:6379

# Obsidian 설정
OBSIDIAN_VAULT_PATH=/path/to/your/vault

# n8n 설정
N8N_URL=http://localhost:5678
```

### 3. 의존성 설치

#### Node.js 의존성
```bash
npm install
```

#### Python 의존성
```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 4. 시스템 시작

#### 개발 환경
```bash
npm run dev
```

#### 프로덕션 환경
```bash
npm run prod
```

#### Docker를 사용한 시작 (권장)
```bash
# 모든 서비스 시작
docker-compose up -d

# 상태 확인
docker-compose ps
```

---

## 🤖 AI 서비스 설정

### API 키 획득 방법

#### 1. Anthropic Claude API
1. [Anthropic Console](https://console.anthropic.com/) 방문
2. 계정 생성 또는 로그인
3. API Keys 섹션에서 새 키 생성
4. `ANTHROPIC_API_KEY`에 키 입력

#### 2. Perplexity API
1. [Perplexity Pro](https://www.perplexity.ai/pro) 가입
2. API 섹션에서 키 생성
3. `PERPLEXITY_API_KEY`에 키 입력

#### 3. OpenAI API (백업용)
1. [OpenAI Platform](https://platform.openai.com/) 방문
2. API Keys 섹션에서 새 키 생성
3. `OPENAI_API_KEY`에 키 입력

### AI 서비스 선택

#### Primary Service 설정
- `anthropic`: Claude Pro 사용 (권장)
- `perplexity`: Perplexity Pro 사용
- `openai`: OpenAI GPT 사용

#### Fallback Service 설정
- Primary 서비스가 실패할 때 사용할 백업 서비스

### AI 서비스 실행

```bash
cd ai-service
python main.py
```

### 서비스 상태 확인

```bash
curl http://localhost:8000/api/models/status
```

### 성능 비교

| 서비스 | 속도 | 정확도 | 비용 | 특징 |
|--------|------|--------|------|------|
| Claude Pro | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 가장 정확한 분석 |
| Perplexity | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 실시간 정보 활용 |
| OpenAI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 안정적인 성능 |

---

## 🐘 데이터베이스 설정

### PostgreSQL 설치

#### Windows
```powershell
# Chocolatey 사용
choco install postgresql

# 또는 https://www.postgresql.org/download/windows/ 에서 다운로드
```

#### macOS
```bash
# Homebrew 사용
brew install postgresql@15
brew services start postgresql@15

# PATH에 추가
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 추가 도구 설치
sudo apt install postgresql-client postgresql-server-dev-all
```

### 데이터베이스 생성 및 설정

```sql
-- postgres 사용자로 연결
sudo -u postgres psql

-- 데이터베이스 생성
CREATE DATABASE second_brain_auto;

-- 사용자 생성 (선택사항, postgres 사용자 사용 가능)
CREATE USER second_brain_user WITH PASSWORD 'secure_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE second_brain_auto TO second_brain_user;
GRANT ALL PRIVILEGES ON DATABASE second_brain_auto TO postgres;

-- 종료
\q
```

### 데이터베이스 스키마 마이그레이션

```bash
cd ai-service

# Alembic 초기화 (아직 안 된 경우)
alembic init migrations

# 초기 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 적용
alembic upgrade head

# 테이블 확인
psql -h localhost -U postgres -d second_brain_auto -c "\dt"
```

### 데이터베이스 최적화

```sql
-- PostgreSQL 설정 최적화
-- postgresql.conf에서:
shared_buffers = 256MB                    -- RAM의 25%
effective_cache_size = 1GB                -- RAM의 75%
work_mem = 4MB                           -- 작업당
maintenance_work_mem = 64MB              -- 유지보수 작업용
max_connections = 100                    -- 필요에 따라 조정
```

---

## 🔧 n8n 워크플로우 설정

### n8n 설치

```bash
# 전역 설치
npm install -g n8n

# 또는 로컬 설치
npm install n8n
```

### n8n 설정

```bash
# 환경 변수 설정
export N8N_HOST=localhost
export N8N_PORT=5678
export N8N_PROTOCOL=http

# Windows
set N8N_HOST=localhost
set N8N_PORT=5678
set N8N_PROTOCOL=http
```

### n8n 시작

```bash
# n8n 시작
n8n start

# 또는 사용자 정의 포트로
N8N_PORT=8080 n8n start
```

### n8n 인터페이스 접속

브라우저에서 `http://localhost:5678`을 열고 초기 설정을 완료하세요.

### 워크플로우 가져오기

1. n8n 웹 인터페이스에서 **"+"** 클릭하여 새 워크플로우 생성
2. **"Import from URL or File"** 클릭
3. **"Paste JSON"** 탭 선택
4. `n8n-workflow.json` 파일의 내용을 복사하여 붙여넣기
5. **"Import"** 클릭

### 웹훅 설정

1. **"AI Webhook"** 노드 클릭
2. 웹훅 URL 확인: `http://localhost:5678/webhook/obsidian-ai`
3. **POST** 메서드가 활성화되어 있는지 확인

### AI 서비스 통합 설정

1. **"AI Classification"** 노드 클릭
2. URL 확인: `http://localhost:8000/api/classify`
3. AI 서비스 연결 테스트

### 워크플로우 활성화

1. **"Activate"** 버튼 클릭
2. 모든 노드가 연결되고 활성화되었는지 확인
3. 실행 기록에서 오류 확인

---

## 📝 Obsidian 통합

### Obsidian 설정

1. **Obsidian** 최신 버전 설치
2. 새 볼트 생성 또는 기존 볼트 사용
3. 볼트 경로를 환경 변수에 설정

### 템플릿 설정

프로젝트의 `templates/` 폴더에 있는 AI 강화 템플릿들을 Obsidian 템플릿 폴더에 복사:

```bash
# 템플릿 복사
cp templates/*.md "/path/to/obsidian/vault/templates/"
```

### 자동화 테스트

```bash
# 볼트 생성 테스트
curl -X POST "http://localhost:5678/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "vault.create",
    "vault_path": "/path/to/obsidian/vault",
    "payload": {
      "name": "Life-OS",
      "ai_enhanced": true
    }
  }'

# 노트 생성 테스트 (AI 포함)
curl -X POST "http://localhost:5678/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "note.create",
    "vault_path": "/path/to/obsidian/vault",
    "payload": {
      "title": "테스트 AI 프로젝트",
      "content": "AI 분석이 포함된 테스트 프로젝트입니다",
      "tags": ["test", "ai", "project"],
      "metadata": {
        "source": "test",
        "ai_enhanced": true
      }
    }
  }'
```

---

## 📤 GitHub 업로드

### 자동 업로드 (권장)

#### Windows 사용자
```bash
# 배포 스크립트 실행
deploy-to-github.bat
```

#### Linux/macOS 사용자
```bash
# 실행 권한 부여
chmod +x deploy-to-github.sh

# 배포 스크립트 실행
./deploy-to-github.sh
```

### 수동 업로드

#### 1. Git 설치 확인
```bash
git --version
```

#### 2. 저장소 초기화
```bash
git init
git remote add origin https://github.com/cheska1025/2nd-Brain-Auto-KOR.git
```

#### 3. 파일 추가 및 커밋
```bash
git add .
git commit -m "Initial commit: 2nd-Brain-Auto Korean Version v1.0.0"
```

#### 4. GitHub에 업로드
```bash
git push -u origin main
```

### 사전 준비사항

#### 1. GitHub 계정 설정
- [GitHub](https://github.com) 계정 생성
- Personal Access Token 생성 (Settings > Developer settings > Personal access tokens)

#### 2. Git 설정
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 3. 저장소 생성
- GitHub에서 새 저장소 생성: `2nd-Brain-Auto-KOR`
- README, .gitignore, license는 생성하지 않음

### 업로드할 파일 목록

#### ✅ 포함할 파일
- 모든 소스 코드 파일
- 설정 파일 (.env.example, docker-compose.yml)
- 문서 파일 (README.md, LICENSE, CHANGELOG.md)
- 스크립트 파일 (test-simple.js, deploy-to-github.bat)
- 템플릿 파일

#### ❌ 제외할 파일
- node_modules/
- .env (환경 변수)
- *.log (로그 파일)
- __pycache__/
- .vscode/
- .idea/

---

## 🚀 고급 기능

### 1. 웹 대시보드

브라우저에서 `http://localhost:3000` 접속하여 실시간 시스템 상태 및 분석 데이터를 확인할 수 있습니다.

### 2. API 사용

#### 콘텐츠 분류
```bash
curl -X POST http://localhost:8000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"content": "프로젝트 계획서 작성", "context": {}}'
```

#### 스마트 태깅
```bash
curl -X POST http://localhost:8000/api/tag \
  -H "Content-Type: application/json" \
  -d '{"content": "머신러닝 기초 학습", "title": "ML 가이드"}'
```

### 3. 성능 모니터링

#### 시스템 상태 확인
```bash
# 전체 시스템 헬스체크
npm run health

# 특정 서비스 로그
npm run logs:api
npm run logs:n8n
```

#### AI 서비스 모니터링
```bash
# AI 서비스 상태
curl http://localhost:8000/health

# 데이터베이스 상태
curl http://localhost:8000/api/database/health
```

### 4. 백업 및 복원

#### 시스템 백업
```bash
# 전체 시스템 백업
npm run backup

# 데이터베이스 백업
pg_dump -h localhost -U postgres -d second_brain_auto > backup.sql
```

#### 복원
```bash
# 데이터베이스 복원
psql -h localhost -U postgres -d second_brain_auto < backup.sql
```

---

## 🧪 테스트

### 간단한 테스트
```bash
node test-simple.js
```

### 전체 테스트
```bash
# Windows
test-scripts.bat

# Linux/macOS
./test-scripts.sh
```

### 헬스 체크
```bash
node scripts/health-check.js
```

### AI 모델 최적화
```bash
node scripts/optimize-ai-models.js
```

---

## 🐛 문제 해결

### 일반적인 문제

#### 1. Redis 연결 오류
```bash
# Redis 서버 상태 확인
redis-cli ping

# Redis 서버 시작
# Windows
redis-server

# macOS/Linux
sudo systemctl start redis-server
```

#### 2. PostgreSQL 연결 오류
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# PostgreSQL 시작
sudo systemctl start postgresql

# 연결 테스트
psql -h localhost -U postgres -d second_brain_auto
```

#### 3. AI API 오류
```bash
# API 키 확인
echo $OPENAI_API_KEY

# API 연결 테스트
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

#### 4. n8n 워크플로우 오류
```bash
# n8n 로그 확인
tail -f ~/.n8n/logs/n8n.log

# n8n 재시작
pkill -f n8n && n8n start
```

### 로그 확인

```bash
# 전체 로그
npm run logs

# 특정 서비스 로그
npm run logs:api
npm run logs:n8n
```

### 성능 문제

#### 1. 느린 AI 분류
- OpenAI API 응답 시간 확인
- Redis 캐싱 활성화
- 분석할 콘텐츠 길이 줄이기
- 간단한 작업에는 더 빠른 AI 모델 사용

#### 2. n8n 워크플로우 타임아웃
- 타임아웃 설정 증가
- 워크플로우 로직 최적화
- 무거운 작업에는 백그라운드 처리 사용
- 재시도 메커니즘 구현

#### 3. 높은 메모리 사용량
- `htop` 또는 작업 관리자로 메모리 사용량 모니터링
- 서비스 주기적 재시작
- AI 모델 로딩 최적화
- 간단한 작업에는 더 작은 모델 사용

---

## 📈 성능 최적화

### 1. AI 모델 최적화

```bash
# AI 모델 최적화 실행
node scripts/optimize-ai-models.js
```

### 2. 데이터베이스 최적화

```bash
# PostgreSQL 튜닝
node scripts/database-optimize.js
```

### 3. 캐싱 설정

- Redis 캐싱 활성화
- AI 응답 캐싱
- 분류 결과 캐싱

### 4. 시스템 모니터링

```bash
# 시스템 리소스 모니터링
htop

# AI 서비스 모니터링
curl http://localhost:8000/api/models/status

# n8n 모니터링
curl http://localhost:5678/healthz

# 디스크 사용량 확인
df -h
```

---

## 🔒 보안

### 1. API 키 보안
- 환경 변수 사용
- `.env` 파일을 `.gitignore`에 추가
- API 키 로테이션

### 2. 데이터 보안
- 데이터베이스 암호화
- 백업 암호화
- 접근 권한 관리

### 3. 네트워크 보안
- 프로덕션에서는 HTTPS 사용
- 방화벽 설정
- API 엔드포인트 보호

---

## 🤝 기여하기

### 개발 환경 설정

```bash
# 저장소 포크 및 클론
git clone https://github.com/your-username/2nd-Brain-Auto-KOR.git
cd 2nd-Brain-Auto-KOR

# 의존성 설치
npm install
npm run install:ai

# 환경 설정
cp env.example .env
# .env 파일 편집

# 개발 환경 시작
npm run start:dev
```

### 기여 유형
- **버그 수정**: 이슈 해결 및 안정성 개선
- **기능 추가**: 새로운 기능 개발
- **문서화**: 가이드 및 문서 개선
- **AI 모델**: AI 분류 및 태깅 향상
- **워크플로우**: n8n 자동화 워크플로우 개선
- **템플릿**: 새로운 Obsidian 템플릿 생성
- **테스트**: 테스트 추가 및 커버리지 향상

### Pull Request 프로세스

1. **변경사항 테스트**
   ```bash
   npm test
   npm run lint
   npm run format
   ```

2. **문서 업데이트** (필요한 경우)
3. **새 기능에 대한 테스트 추가**
4. **모든 테스트 통과 확인**
5. **CHANGELOG.md 업데이트** (해당하는 경우)

### 커밋 메시지 가이드라인

Conventional commit 형식 사용:
```
type(scope): description

[optional body]

[optional footer]
```

**타입:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 업데이트
- `chore`: 유지보수 작업

**예시:**
```
feat(ai): add smart tagging for content analysis
fix(n8n): resolve workflow timeout issues
docs(readme): update installation instructions
test(ai): add unit tests for classification service
```

---

## 📚 추가 리소스

### 문서
- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Obsidian 플러그인 개발](https://docs.obsidian.md/Plugins/Getting+Started)
- [P.A.R.A 방법론](https://fortelabs.co/blog/para/)

### 커뮤니티
- [n8n 커뮤니티 포럼](https://community.n8n.io/)
- [Obsidian 커뮤니티](https://forum.obsidian.md/)
- [AI/ML 커뮤니티](https://www.reddit.com/r/MachineLearning/)

### 지원
- 이슈 리포트: [GitHub Issues](https://github.com/cheska1025/2nd-Brain-Auto-KOR/issues)
- 문서: [Wiki](https://github.com/cheska1025/2nd-Brain-Auto-KOR/wiki)
- 이메일: cheska1025@example.com

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Obsidian](https://obsidian.md/) - 노트 앱
- [n8n](https://n8n.io/) - 워크플로우 자동화
- [P.A.R.A](https://fortelabs.co/blog/para/) - 생산성 방법론
- [MECE](https://en.wikipedia.org/wiki/MECE_principle) - 분석 프레임워크

---

**🎉 2nd-Brain-Auto (Ver. KOR) - AI로 강화된 지식 관리의 새로운 차원을 경험하세요! 🚀**

*지속적인 지원과 업데이트를 위해 [GitHub 저장소](https://github.com/cheska1025/2nd-Brain-Auto-KOR)를 방문해주세요.*
