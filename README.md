# 2nd-Brain-Auto (Ver. KOR) 🧠

AI 기반 지식 관리 시스템으로 Obsidian과 n8n을 통합한 P.A.R.A 방법론 기반의 두 번째 뇌 시스템입니다.

## 🌟 주요 기능

### 🤖 AI 기반 자동화
- **P.A.R.A 분류**: AI가 콘텐츠를 자동으로 Projects, Areas, Resources, Archives로 분류
- **스마트 태깅**: AI가 생성한 지능형 태그로 콘텐츠 자동 태깅
- **콘텐츠 분석**: 감정 분석, 복잡도 평가, 핵심 개념 추출
- **다중 AI 제공자**: Claude, OpenAI, Perplexity 지원

### 🔄 하이브리드 시스템
- **MECE 원칙**: 상호 배타적이고 완전 포괄적인 분류 체계
- **스마트 라우팅**: 입력 유형에 따른 자동 처리 경로 결정
- **실시간 동기화**: Obsidian, Notion, 기타 플랫폼과의 실시간 동기화

### 📊 고급 기능
- **성능 모니터링**: 실시간 시스템 상태 및 성능 모니터링
- **백업 및 복원**: 자동 백업 및 데이터 복원 시스템
- **분석 대시보드**: 사용 패턴 및 생산성 분석

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/cheska1025/2nd-Brain-Auto-KOR.git
cd 2nd-Brain-Auto-KOR
```

### 2. 환경 설정
```bash
# 환경 변수 파일 생성
cp env.example .env

# 환경 변수 편집 (API 키 설정)
nano .env
```

### 3. 의존성 설치
```bash
# Node.js 의존성
npm install

# Python 의존성
cd ai-service
pip install -r requirements.txt
cd ..
```

### 4. 시스템 시작
```bash
# 개발 환경
npm run dev

# 프로덕션 환경
npm run prod
```

## 📁 프로젝트 구조

```
2nd-Brain-Auto-KOR/
├── ai-service/                 # AI 서비스 (Python)
│   ├── main.py                # FastAPI 메인 애플리케이션
│   ├── database.py            # 데이터베이스 관리
│   ├── db_utils.py            # 데이터베이스 유틸리티
│   └── requirements.txt       # Python 의존성
├── hybrid-system/             # 하이브리드 시스템 (Node.js)
│   ├── main.js               # 메인 애플리케이션
│   ├── core/                 # 핵심 모듈
│   │   ├── mece-classifier.js
│   │   ├── ai-hub.js
│   │   └── sync-manager.js
│   └── interfaces/           # 사용자 인터페이스
├── scripts/                   # 유틸리티 스크립트
│   ├── health-check.js       # 시스템 상태 체크
│   ├── backup-system.js      # 백업 시스템
│   └── obsidian-analyzer.js  # Obsidian 분석
├── templates/                 # AI 강화 템플릿
├── docker-compose.yml        # Docker 설정
└── README.md                 # 이 파일
```

## 🔧 설정

### 환경 변수 (.env)
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

### AI 서비스 설정
```bash
cd ai-service
python main.py
```

### 하이브리드 시스템 설정
```bash
cd hybrid-system
npm start
```

## 📊 사용법

### 1. 웹 대시보드
- 브라우저에서 `http://localhost:3000` 접속
- 실시간 시스템 상태 및 분석 데이터 확인

### 2. API 사용
```bash
# 콘텐츠 분류
curl -X POST http://localhost:8000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"content": "프로젝트 계획서 작성", "context": {}}'

# 스마트 태깅
curl -X POST http://localhost:8000/api/tag \
  -H "Content-Type: application/json" \
  -d '{"content": "머신러닝 기초 학습", "title": "ML 가이드"}'
```

### 3. n8n 워크플로우
- `http://localhost:5678`에서 n8n 인터페이스 접속
- 자동화 워크플로우 설정 및 관리

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

## 📈 성능 최적화

### 1. AI 모델 최적화
```bash
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

## 🔒 보안

### 1. API 키 보안
- 환경 변수 사용
- `.env` 파일을 `.gitignore`에 추가
- API 키 로테이션

### 2. 데이터 보안
- 데이터베이스 암호화
- 백업 암호화
- 접근 권한 관리

## 🐛 문제 해결

### 일반적인 문제
1. **Redis 연결 오류**: Redis 서버가 실행 중인지 확인
2. **PostgreSQL 연결 오류**: 데이터베이스 서버 상태 확인
3. **AI API 오류**: API 키 유효성 및 할당량 확인

### 로그 확인
```bash
# 전체 로그
npm run logs

# 특정 서비스 로그
npm run logs:api
npm run logs:n8n
```

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Obsidian](https://obsidian.md/) - 노트 앱
- [n8n](https://n8n.io/) - 워크플로우 자동화
- [P.A.R.A](https://fortelabs.co/blog/para/) - 생산성 방법론
- [MECE](https://en.wikipedia.org/wiki/MECE_principle) - 분석 프레임워크

## 📞 지원

- 이슈 리포트: [GitHub Issues](https://github.com/cheska1025/2nd-Brain-Auto-KOR/issues)
- 문서: [Wiki](https://github.com/cheska1025/2nd-Brain-Auto-KOR/wiki)
- 이메일: cheska1025@example.com

---

**2nd-Brain-Auto (Ver. KOR)** - AI로 강화된 지식 관리의 새로운 차원을 경험하세요! 🚀
