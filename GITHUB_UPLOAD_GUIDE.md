# GitHub 업로드 가이드

## 1. Git 설치 (필요한 경우)

### Windows에서 Git 설치:
1. [Git for Windows](https://git-scm.com/download/win) 다운로드
2. 설치 프로그램 실행
3. 기본 설정으로 설치 완료

### 또는 GitHub Desktop 설치:
1. [GitHub Desktop](https://desktop.github.com/) 다운로드
2. 설치 후 GitHub 계정으로 로그인

## 2. GitHub 레포지토리 생성

1. https://github.com/cheska1025/2nd-Brain-Auto-KOR 접속
2. "Create a new repository" 클릭
3. Repository name: `2nd-Brain-Auto-KOR`
4. Description: `AI-powered second brain system with Obsidian and n8n integration using P.A.R.A methodology (Korean Version)`
5. Public으로 설정
6. "Create repository" 클릭

## 3. 로컬에서 Git 초기화 및 업로드

### 명령어 방식 (Git for Windows 사용):

```bash
# Git 초기화
git init

# 원격 레포지토리 추가
git remote add origin https://github.com/cheska1025/2nd-Brain-Auto-KOR.git

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit: 2nd-Brain-Auto Korean Version"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### GitHub Desktop 사용:

1. GitHub Desktop 열기
2. "Clone a repository from the Internet" 클릭
3. URL에 `https://github.com/cheska1025/2nd-Brain-Auto-KOR.git` 입력
4. 로컬 경로를 현재 프로젝트 폴더로 설정
5. "Clone" 클릭
6. 모든 파일이 자동으로 추가됨
7. "Commit to main" 클릭
8. "Publish branch" 클릭

## 4. 업로드 후 확인사항

1. GitHub 레포지토리 페이지에서 모든 파일이 업로드되었는지 확인
2. README.md가 제대로 표시되는지 확인
3. LICENSE 파일이 있는지 확인
4. 프로젝트 구조가 올바른지 확인

## 5. 추가 설정 (선택사항)

### GitHub Pages 설정 (웹사이트 호스팅):
1. Settings > Pages
2. Source를 "Deploy from a branch"로 설정
3. Branch를 "main"으로 설정
4. Save 클릭

### Issues 및 Wiki 활성화:
1. Settings > Features
2. Issues 체크박스 활성화
3. Wiki 체크박스 활성화

## 6. 문제 해결

### 인증 오류가 발생하는 경우:
```bash
# GitHub Personal Access Token 사용
git remote set-url origin https://[USERNAME]:[TOKEN]@github.com/cheska1025/2nd-Brain-Auto-KOR.git
```

### 파일이 너무 큰 경우:
- .gitignore에 큰 파일들 추가
- Git LFS 사용 고려

### 충돌이 발생하는 경우:
```bash
git pull origin main
# 충돌 해결 후
git add .
git commit -m "Resolve conflicts"
git push origin main
```

## 7. 프로젝트 실행 가이드

업로드 완료 후 프로젝트를 실행하려면:

1. 환경 변수 설정:
   ```bash
   cp env.example .env
   # .env 파일 편집하여 필요한 값들 설정
   ```

2. 의존성 설치:
   ```bash
   npm install
   cd ai-service && pip install -r requirements.txt
   ```

3. 서비스 시작:
   ```bash
   docker-compose up -d
   ```

4. 상태 확인:
   ```bash
   npm run health
   ```

## 8. 기여 가이드

다른 개발자들이 프로젝트에 기여할 수 있도록:

1. CONTRIBUTING.md 파일 참조
2. 이슈 생성 및 라벨링
3. Pull Request 템플릿 설정
4. 코드 리뷰 프로세스 설정

---

**참고**: 이 가이드는 Windows 환경을 기준으로 작성되었습니다. macOS나 Linux 사용자는 해당 OS에 맞는 Git 설치 방법을 사용하세요.
