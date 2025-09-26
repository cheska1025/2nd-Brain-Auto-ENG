@echo off
REM 2nd-Brain-Auto (Ver. KOR) - GitHub 배포 스크립트
REM GitHub에 프로젝트를 업로드하는 스크립트

echo ========================================
echo 2nd-Brain-Auto GitHub 배포 스크립트
echo ========================================
echo.

REM Git 설치 확인
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git이 설치되지 않았거나 PATH에 없습니다.
    echo [INFO] Git을 설치하고 PATH에 추가한 후 다시 시도하세요.
    echo [INFO] 다운로드: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [INFO] Git 버전 확인:
git --version

echo.
echo [INFO] Git 저장소 초기화...
git init

echo [INFO] 원격 저장소 추가...
git remote add origin https://github.com/cheska1025/2nd-Brain-Auto-KOR.git

echo [INFO] 파일 추가...
git add .

echo [INFO] 커밋 생성...
git commit -m "Initial commit: 2nd-Brain-Auto Korean Version v1.0.0

- AI 기반 P.A.R.A 분류 시스템
- 하이브리드 MECE 원칙 기반 지식 관리
- Obsidian 및 n8n 통합
- 다중 AI 제공자 지원 (Claude, OpenAI, Perplexity)
- 실시간 동기화 및 모니터링
- 완전한 Docker 지원
- 한국어 인터페이스"

echo.
echo [INFO] GitHub에 업로드 중...
echo [WARNING] GitHub 인증이 필요할 수 있습니다.
echo [INFO] 사용자 이름과 비밀번호(또는 토큰)를 입력하세요.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ GitHub 업로드 성공!
    echo ========================================
    echo.
    echo [SUCCESS] 프로젝트가 성공적으로 GitHub에 업로드되었습니다.
    echo [INFO] 저장소 URL: https://github.com/cheska1025/2nd-Brain-Auto-KOR
    echo.
    echo [NEXT STEPS] 다음 단계:
    echo 1. GitHub 저장소에서 README.md를 README_KOR.md로 변경
    echo 2. 환경 변수 설정 (.env 파일)
    echo 3. 의존성 설치 및 서비스 시작
    echo 4. 사용자 가이드 작성
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ GitHub 업로드 실패
    echo ========================================
    echo.
    echo [ERROR] GitHub 업로드 중 오류가 발생했습니다.
    echo [INFO] 가능한 원인:
    echo - GitHub 인증 실패
    echo - 네트워크 연결 문제
    echo - 저장소 권한 문제
    echo.
    echo [SOLUTION] 해결 방법:
    echo 1. GitHub 계정 확인
    echo 2. Personal Access Token 사용
    echo 3. 네트워크 연결 확인
    echo 4. 저장소 권한 확인
    echo.
)

echo.
echo [INFO] 배포 스크립트 완료
pause
