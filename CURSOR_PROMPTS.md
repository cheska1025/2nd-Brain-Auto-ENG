# 2nd-Brain-Auto 바이브코딩 개발 프롬프트

## 🚀 Cursor AI 개발 프롬프트

### Phase 1: 기존 시스템 분석 및 확장

#### Cursor 프롬프트 1: Obsidian 분석기 생성
```
@cursor 다음 요구사항에 맞는 Obsidian 볼트 분석 시스템을 생성해주세요:

**프로젝트명**: Obsidian-Analyzer
**목표**: 기존 Obsidian 볼트를 완전 분석하여 PARA 구조로 매핑

**기술 스택**:
- Node.js + TypeScript
- gray-matter (프론트매터 파싱)
- chokidar (파일 감시)
- D3.js (관계도 시각화)

**핵심 기능**:
1. 볼트 구조 완전 스캔 (폴더, 파일, 링크)
2. 태그 빈도 분석 및 중요도 계산
3. 노트 간 연결 관계 그래프 생성
4. PARA 카테고리 자동 분류 (AI 기반)
5. 마이그레이션 전략 제안

**파일 구조**:
```
obsidian-analyzer/
├── src/
│   ├── analyzers/
│   │   ├── VaultScanner.ts
│   │   ├── LinkAnalyzer.ts
│   │   ├── TagAnalyzer.ts
│   │   └── ParaMapper.ts
│   ├── utils/
│   │   ├── FileUtils.ts
│   │   └── DataExporter.ts
│   ├── types/
│   │   └── AnalysisTypes.ts
│   └── index.ts
├── tests/
├── reports/        # 생성될 분석 리포트
└── package.json
```

**출력 결과**:
- obsidian-analysis-report.json (상세 분석)
- para-mapping-suggestions.json (매핑 제안)
- knowledge-graph.json (관계도 데이터)
- migration-plan.md (마이그레이션 계획)

**성능 요구사항**:
- 10,000개 노트 처리 시간: 5분 이내
- 메모리 사용량: 1GB 이하
- 실시간 진행률 표시

완전히 작동하는 코드로 구현해주세요.
```

#### Cursor 프롬프트 2: AI 통합 허브 시스템
```
@cursor 다음 하이브리드 AI 시스템을 구현해주세요:

**시스템명**: AI-Integration-Hub
**목표**: 로컬 AI + 클라우드 AI를 지능적으로 라우팅하는 통합 시스템

**아키텍처**:
- 고가용성: 99.9% 업타임
- 안정성: 자동 장애 복구
- 고효율성: 최적 AI 선택 알고리즘
- 확장성: 새로운 AI 제공자 쉽게 추가

**AI 제공자**:
1. Local AI (Ollama) - 빠른 응답, 오프라인 가능
2. Claude Pro (웹 자동화) - 고품질 추론
3. Perplexity Pro (웹 자동화) - 실시간 정보
4. Cursor AI (로컬) - 코드 관련 작업

**핵심 기능**:
1. 작업 유형별 최적 AI 자동 선택
2. 실패 시 자동 백업 AI로 전환
3. 응답 품질 평가 및 학습
4. 비용/성능 최적화
5. 실시간 성능 모니터링

**라우팅 로직**:
- 단순 분류 → Local AI
- 복합 추론 → Claude Pro  
- 최신 정보 필요 → Perplexity
- 코드 관련 → Cursor AI

파일 간 중복 없이, 확장 가능한 구조로 완전 구현해주세요.
```

## 🎯 Claude Code 개발 프롬프트

### Phase 2: 웹 자동화 시스템

#### Claude Code 프롬프트 1: Claude Pro 웹 자동화
```
**프로젝트명**: Claude-Pro-Automation
**설명**: Claude Pro를 Puppeteer로 완전 자동화하는 안정적인 시스템

**기술 스택**:
- Backend: Node.js + Express
- Automation: Puppeteer + Stealth Plugin
- Cache: Redis
- Database: PostgreSQL
- Container: Docker

**요구사항**:
1. 고가용성: 세션 유지 4시간+, 자동 재연결
2. 안정성: 에러 처리, 재시도 로직, CAPTCHA 처리
3. 고효율성: 요청 큐, 배치 처리, 캐싱
4. 최소 중복: 단일 책임 원칙, 모듈화
5. 엔드포인트 유일성: RESTful API 설계
6. 최소 파일: 핵심 기능만 구현
7. 백엔드/프론트 분리: API 중심 설계

**기능**:
- POST /api/v1/claude/prompt - 프롬프트 전송
- GET /api/v1/claude/status - 세션 상태 확인
- POST /api/v1/claude/login - 수동 로그인 트리거
- GET /api/v1/claude/health - 헬스체크

**성능 목표**:
- 응답 시간: 30초 이내
- 성공률: 95% 이상
- 동시 요청: 5개까지 처리
- 메모리 사용: 512MB 이하

**에러 처리**:
- 네트워크 오류 → 3회 재시도
- 세션 만료 → 자동 재로그인
- CAPTCHA 감지 → 대기 후 재시도
- 서버 오류 → 상태 리포트

Docker Compose로 한 번에 실행 가능하게 구현해주세요.
```

#### Claude Code 프롬프트 2: n8n 워크플로우 시스템
```
**프로젝트명**: N8N-Brain-Workflows
**설명**: 2nd-Brain-Auto를 위한 지능형 n8n 워크플로우 집합

**워크플로우 목록**:
1. Smart Content Router - 헤드라인 기반 자동 라우팅
2. AI Classification Pipeline - 다단계 AI 분류
3. Obsidian Sync Manager - 실시간 동기화
4. Automated Review Generator - 주간/월간 리뷰 자동 생성
5. Priority Updater - 우선순위 동적 업데이트

**기술 요구사항**:
- 고가용성: 워크플로우 실패 시 자동 복구
- 안정성: 각 단계별 에러 처리
- 고효율성: 병렬 처리, 큐 관리
- 최소 중복: 공통 노드 재사용
- API 통합: 외부 서비스 연동

**워크플로우 1: Smart Content Router**
```
[Webhook] → [헤드라인 파서] → [조건 분기]
                                ├→ [기록] → [Notion API]
                                ├→ [메모] → [Obsidian API]
                                └→ [자동] → [AI 분류] → [적절한 시스템]
```

**워크플로우 2: AI Classification Pipeline**
```
[입력 수신] → [컨텍스트 분석] → [AI 라우터] → [처리]
                                ├→ [로컬 AI]
                                ├→ [Claude Pro]
                                ├→ [Perplexity]
                                └→ [결과 통합]
```

**성능 목표**:
- 워크플로우 응답시간: 60초 이내
- 성공률: 98% 이상
- 처리량: 시간당 1000개 요청
- 오류 복구: 5분 이내

JSON 형태의 n8n 워크플로우로 완전 구현해주세요.
```

## 🔧 통합 개발 환경 프롬프트

### Cursor + Claude Code 협업 프롬프트

#### 단계 1: Cursor로 기반 구조 생성
```
@cursor 2nd-Brain-Auto 전체 프로젝트 구조를 생성해주세요:

**요구사항**: 
- 마이크로서비스 아키텍처
- Docker Compose 기반 개발 환경
- 모든 컨테이너가 독립적으로 작동
- 서비스 간 REST API 통신
- 통합 모니터링 및 로깅

**서비스 구성**:
1. api-gateway (Express) - 통합 API 게이트웨이
2. obsidian-connector (Node.js) - Obsidian 파일 처리
3. claude-automation (Puppeteer) - Claude Pro 자동화
4. perplexity-automation (Puppeteer) - Perplexity 자동화  
5. ai-router (Node.js) - AI 작업 라우팅
6. n8n-workflows (n8n) - 워크플로우 엔진
7. postgres (PostgreSQL) - 데이터베이스
8. redis (Redis) - 캐시 및 세션

각 서비스의 기본 구조와 Docker 설정을 완전 구현해주세요.
```

#### 단계 2: Claude Code로 핵심 로직 구현
```
**위 Cursor가 생성한 구조를 기반으로 각 서비스의 핵심 로직을 구현해주세요**

**우선순위**:
1. api-gateway의 라우팅 로직
2. obsidian-connector의 파일 처리 로직
3. ai-router의 지능형 라우팅 알고리즘
4. 각 서비스 간 통신 인터페이스

**품질 기준**:
- 모든 함수에 JSDoc 주석
- 에러 처리 완벽 구현
- 테스트 코드 80% 커버리지
- TypeScript 타입 정의
- 로깅 및 모니터링 통합

바이브코딩 가이드라인을 모두 준수하여 구현해주세요.
```

## 📊 개발 진행률 추적 프롬프트

### 일일 진행상황 체크
```
@cursor/claude 현재까지 구현된 2nd-Brain-Auto 시스템의 진행률을 분석해주세요:

**체크 항목**:
1. 구현 완료율 (%)
2. 테스트 통과율 (%)
3. 성능 벤치마크 달성률 (%)
4. 코드 품질 점수 (/100)

**분석 기준**:
- 기능 완성도
- 코드 품질 (복잡도, 중복률, 테스트 커버리지)
- 성능 지표 (응답시간, 처리량, 리소스 사용률)
- 안정성 (에러 처리, 복구 능력)

**출력 형식**:
```markdown
# 2nd-Brain-Auto 개발 진행률 (YYYY-MM-DD)

## 📈 전체 진행률: XX%

### 🎯 주요 성과
- 완료된 기능들
- 성능 개선사항
- 해결된 이슈들

### 🚧 진행 중인 작업
- 현재 작업 상태
- 예상 완료 시간
- 블로커 이슈들

### 📋 다음 단계
- 우선순위별 작업 목록
- 예상 소요 시간
- 필요한 리소스

### 💡 개선 제안
- 코드 품질 개선
- 성능 최적화
- 아키텍처 개선
```

자동으로 코드베이스를 스캔해서 현실적인 진행률을 계산해주세요.
```

## 🎨 UI/UX 개발 프롬프트

### Cursor 프롬프트: 대시보드 UI
```
@cursor 2nd-Brain-Auto 시스템을 위한 현대적인 대시보드 UI를 구현해주세요:

**기술 스택**:
- React + TypeScript
- Tailwind CSS + Headless UI
- Recharts (차트)
- React Query (데이터 페칭)
- Framer Motion (애니메이션)

**주요 컴포넌트**:
1. 실시간 시스템 상태 카드
2. AI 처리 통계 차트
3. 프로젝트 진행률 트래커
4. 최근 활동 피드
5. 빠른 액션 버튼들

**디자인 원칙**:
- 다크/라이트 모드 지원
- 모바일 반응형
- 접근성 고려 (WCAG 2.1)
- 직관적인 네비게이션

**데이터 소스**:
- REST API 엔드포인트
- WebSocket 실시간 업데이트
- 로컬 스토리지 캐싱

완전히 작동하는 React 컴포넌트로 구현해주세요.
```

## 🔧 DevOps 및 배포 프롬프트

### Claude Code 프롬프트: CI/CD 파이프라인
```
**프로젝트명**: 2nd-Brain-Auto-CI/CD
**목표**: 자동화된 테스트, 빌드, 배포 파이프라인 구축

**기술 스택**:
- GitHub Actions
- Docker + Docker Compose
- Nginx (리버스 프록시)
- Let's Encrypt (SSL)
- PM2 (프로세스 관리)

**파이프라인 단계**:
1. 코드 품질 검사 (ESLint, Prettier, TypeScript)
2. 단위 테스트 실행 (Jest)
3. 통합 테스트 실행 (Cypress)
4. Docker 이미지 빌드
5. 스테이징 환경 배포
6. 프로덕션 환경 배포

**배포 전략**:
- Blue-Green 배포
- 롤백 자동화
- 헬스체크 통과 후 트래픽 전환
- 데이터베이스 마이그레이션

**모니터링**:
- 애플리케이션 로그 수집
- 성능 메트릭 수집
- 에러 알림 (Slack/Email)
- 자동 스케일링

GitHub Actions 워크플로우와 배포 스크립트를 완전 구현해주세요.
```

## 🧪 테스트 자동화 프롬프트

### Cursor 프롬프트: 테스트 스위트
```
@cursor 2nd-Brain-Auto 시스템을 위한 포괄적인 테스트 스위트를 구현해주세요:

**테스트 유형**:
1. 단위 테스트 (Jest)
2. 통합 테스트 (Supertest)
3. E2E 테스트 (Cypress)
4. 성능 테스트 (Artillery)
5. 보안 테스트 (OWASP ZAP)

**테스트 커버리지 목표**:
- 코드 커버리지: 90% 이상
- 브랜치 커버리지: 85% 이상
- 함수 커버리지: 95% 이상

**테스트 시나리오**:
- AI 분류 정확도 테스트
- 웹 자동화 안정성 테스트
- 데이터 동기화 무결성 테스트
- 에러 복구 메커니즘 테스트
- 성능 벤치마크 테스트

**모킹 전략**:
- 외부 API 모킹
- 데이터베이스 모킹
- 파일 시스템 모킹
- 시간/날짜 모킹

완전한 테스트 스위트와 CI/CD 통합을 구현해주세요.
```

---

## 🎯 바이브코딩 핵심 원칙

### 1. 고가용성 (High Availability)
- 99.9% 업타임 보장
- 자동 장애 복구
- 다중 백업 시스템

### 2. 안정성 (Reliability)
- 완벽한 에러 처리
- 재시도 로직
- 로깅 및 모니터링

### 3. 고효율성 (High Efficiency)
- 최적화된 알고리즘
- 캐싱 전략
- 병렬 처리

### 4. 최소 중복 (Minimal Duplication)
- DRY 원칙 준수
- 공통 모듈화
- 재사용 가능한 컴포넌트

### 5. 엔드포인트 유일성 (Unique Endpoints)
- RESTful API 설계
- 명확한 라우팅
- 일관된 응답 형식

### 6. 최소 파일 (Minimal Files)
- 핵심 기능만 구현
- 불필요한 파일 제거
- 간결한 구조

### 7. 백엔드/프론트 분리 (Backend/Frontend Separation)
- API 중심 설계
- 독립적 배포
- 명확한 책임 분리

---

*이 프롬프트들을 순서대로 사용하시면 바이브코딩 방식으로 체계적이고 고품질의 2nd-Brain-Auto 시스템을 구축할 수 있습니다. Cursor AI와 Claude Code의 장점을 모두 활용하여 최적의 개발 경험을 제공합니다.*
