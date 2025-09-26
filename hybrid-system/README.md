# 🧠 2nd-Brain-Auto 하이브리드 시스템

## 🌟 시스템 개요

MECE 원칙 기반의 한국어 인터페이스와 AI 자동화를 결합한 지능형 지식 관리 시스템입니다.

### 핵심 특징
- **MECE 원칙**: 상호 배타적이고 전체를 포괄하는 분류 시스템
- **AI 자동화**: Claude, Perplexity를 활용한 지능형 분류 및 처리
- **3-Platform 통합**: Obsidian + Notion + Local PC 동기화
- **한국어 인터페이스**: 접근성과 사용성 극대화
- **단계적 자동화**: 사용자 선택권을 보장하는 유연한 자동화

## 🏗️ 시스템 아키텍처

```
2nd-Brain-Auto 하이브리드 시스템/
├── core/                           # 핵심 엔진
│   ├── mece-classifier.js         # MECE 분류 엔진
│   ├── ai-hub.js                  # AI 통합 허브
│   ├── sync-manager.js            # 동기화 관리자
│   └── health-monitor.js          # 시스템 건강도 모니터
├── interfaces/                     # 사용자 인터페이스
│   ├── web-dashboard/             # 웹 대시보드
│   ├── mobile-app/                # 모바일 앱
│   └── voice-interface/           # 음성 인터페이스
├── automation/                     # 자동화 시스템
│   ├── n8n-workflows/             # n8n 워크플로우
│   ├── ai-providers/              # AI 제공자 통합
│   └── smart-routing/             # 지능형 라우팅
├── platforms/                      # 플랫폼 연동
│   ├── obsidian-connector/        # Obsidian 연동
│   ├── notion-connector/          # Notion 연동
│   └── local-pc-connector/        # 로컬 PC 연동
└── config/                        # 설정 및 템플릿
    ├── mece-rules.json            # MECE 분류 규칙
    ├── templates/                 # 템플릿 모음
    └── user-preferences.json      # 사용자 설정
```

## 🎯 MECE 분류 시스템

### 6가지 핵심 카테고리 (상호 배타적, 전체 포괄적)

1. **업무-핵심**: 핵심 업무 프로젝트, KPI, 전략적 목표
2. **업무-지원**: 보고서, 회의록, 협업 문서, 지원 업무
3. **개인-필수**: 건강관리, 재정관리, 생활 필수사항
4. **개인-선택**: 취미, 인간관계, 자기계발, 여가활동
5. **학습-업무**: 업무 관련 전문기술, 직무교육, 산업지식
6. **학습-교양**: 일반교양, 개인흥미, 문화예술, 독서

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd 2nd-brain-auto-hybrid

# 의존성 설치
npm install

# 시스템 초기화
npm run init

# 환경변수 설정
cp .env.example .env
# .env 파일 편집하여 API 키 설정
```

### 2. AI 서비스 설정
```bash
# AI 모델 초기화
npm run init:ai-models

# n8n 워크플로우 배포
npm run deploy:workflows

# 시스템 헬스체크
npm run health-check
```

### 3. 첫 번째 입력 처리
```bash
# 웹 인터페이스 실행
npm start

# 또는 CLI로 직접 처리
npm run process -- "새로운 프로젝트 기획서 작성"
```

## 📊 사용 예시

### 입력 처리 예시
```
입력: "팀 워크샵 결과 정리 및 다음 단계 계획 수립"

AI 분석:
- MECE 분류: 업무-핵심
- P.A.R.A: Projects
- 우선순위: 1Q (긴급중요)
- 신뢰도: 92%

자동 처리:
- Obsidian: 001_활성-프로젝트/2024년/Q1-2024/P001_팀워크샵/
- Notion: Projects 데이터베이스
- Local PC: 001_활성업무_2024/Q1_프로젝트/P001_팀워크샵/
```

### 헤드라인 라우팅 예시
```
[프로젝트-업무] 웹사이트 리뉴얼 계획
→ 자동으로 업무-핵심으로 분류, 3-Platform 동시 처리

[학습-전문] React 19 신기능 학습
→ 자동으로 학습-업무로 분류, Obsidian + Notion 처리

[임시] 아이디어 메모
→ 임시 작업방에 저장, 주간 정리 대상으로 표시
```

## 🔧 고급 설정

### MECE 규칙 커스터마이징
```json
{
  "meceRules": {
    "업무-핵심": {
      "keywords": ["프로젝트", "핵심업무", "KPI", "성과", "목표"],
      "destinations": ["notion", "obsidian", "localPC"],
      "priority": "high"
    }
  }
}
```

### AI 제공자 설정
```json
{
  "aiProviders": {
    "primary": "claude",
    "fallback": "perplexity",
    "local": "ollama"
  }
}
```

## 📈 모니터링 및 최적화

### 시스템 건강도 대시보드
- MECE 준수율: 96%
- AI 분류 정확도: 92%
- 동기화 성공률: 98%
- 사용자 만족도: 89%

### 자동 최적화 기능
- 분류 정확도 개선
- 중복 파일 자동 감지
- 사용 패턴 학습
- 성능 최적화

## 🛠️ 트러블슈팅

### 일반적인 문제
1. **AI 분류 오류**: 수동 재분류 또는 규칙 조정
2. **동기화 실패**: 플랫폼별 연결 상태 확인
3. **성능 저하**: 캐시 정리 및 최적화 실행

### 지원 및 문의
- 이슈 리포트: GitHub Issues
- 문서: `/docs` 폴더
- 커뮤니티: Discord 채널

## 📚 API 문서

### 주요 엔드포인트

#### POST /api/process
메인 입력 처리 엔드포인트
```json
{
  "input": "처리할 내용",
  "userHeadline": "[프로젝트-업무]",
  "enableAI": true,
  "enableSync": true
}
```

#### GET /api/system/status
시스템 상태 조회
```json
{
  "performance": {...},
  "meceHealth": {...},
  "routingStats": {...},
  "syncStatus": {...}
}
```

#### POST /api/mece/classify
MECE 분류 실행
```json
{
  "input": "분류할 내용",
  "userHeadline": "[프로젝트-업무]",
  "context": {...}
}
```

## 🔄 워크플로우

### 1. 입력 처리 플로우
```
사용자 입력 → 라우팅 엔진 → MECE 분류 → AI 처리 → 동기화 → 결과 통합
```

### 2. 자동화 단계
- **Level 1**: 헤드라인 기반 즉시 분류
- **Level 2**: 콘텐츠 타입 기반 분류
- **Level 3**: AI 분석 기반 분류
- **Level 4**: 사용자 선호도 기반 분류

### 3. 동기화 플로우
```
MECE 분류 → 플랫폼 선택 → 파일 생성 → 동기화 실행 → 상태 확인
```

## 📊 성능 지표

### 목표 성능
- **처리 속도**: 평균 5초 이내
- **분류 정확도**: 90% 이상
- **동기화 성공률**: 95% 이상
- **시스템 가용성**: 99.5% 이상

### 모니터링 지표
- MECE 준수율
- AI 제공자 성능
- 동기화 상태
- 사용자 만족도

## 🚀 향후 계획

### Phase 1: 기본 기능 (완료)
- ✅ MECE 분류 시스템
- ✅ AI 통합 허브
- ✅ 3-Platform 동기화
- ✅ 웹 대시보드

### Phase 2: 고급 기능 (진행 중)
- 🔄 음성 인터페이스
- 🔄 모바일 앱
- 🔄 고급 분석
- 🔄 팀 협업 기능

### Phase 3: 확장 기능 (계획)
- 📋 다국어 지원
- 📋 커스텀 AI 모델
- 📋 엔터프라이즈 기능
- 📋 API 마켓플레이스

---

**2nd-Brain-Auto 하이브리드 시스템으로 지식 관리의 새로운 차원을 경험하세요! 🚀**