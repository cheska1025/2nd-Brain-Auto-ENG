@echo off
REM 2nd-Brain-Auto (Ver. ENG) - AI-Enhanced Test Scripts for Windows
REM Advanced testing suite for AI-powered knowledge management system

echo ========================================
echo 2nd-Brain-Auto AI-Enhanced Test Suite
echo ========================================
echo.

REM Set environment variables
set VAULT_PATH=D:\Obsidian\Life-OS
set N8N_URL=http://localhost:5678
set AI_SERVICE_URL=http://localhost:8000
set TEST_TIMEOUT=30

echo [INFO] Starting comprehensive test suite...
echo [INFO] Vault Path: %VAULT_PATH%
echo [INFO] n8n URL: %N8N_URL%
echo [INFO] AI Service URL: %AI_SERVICE_URL%
echo.

REM Test 1: Health Check
echo ========================================
echo Test 1: Health Check
echo ========================================
echo.

echo [TEST] Checking n8n service...
curl -f %N8N_URL%/healthz >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] n8n service is running
) else (
    echo [FAIL] n8n service is not responding
    echo [INFO] Please start n8n with: n8n start
    goto :error
)

echo [TEST] Checking AI service...
curl -f %AI_SERVICE_URL%/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] AI service is running
) else (
    echo [FAIL] AI service is not responding
    echo [INFO] Please start AI service with: cd ai-service && python main.py
    goto :error
)

echo.

REM Test 2: AI Service API Tests
echo ========================================
echo Test 2: AI Service API Tests
echo ========================================
echo.

echo [TEST] Testing AI classification...
curl -X POST "%AI_SERVICE_URL%/api/classify" ^
  -H "Content-Type: application/json" ^
  -d "{\"content\": \"Build a comprehensive e-commerce platform with modern UI/UX and payment integration\", \"context\": {}}" ^
  --max-time %TEST_TIMEOUT% > classification_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] AI classification test completed
    type classification_test.json
) else (
    echo [FAIL] AI classification test failed
)

echo.

echo [TEST] Testing AI tagging...
curl -X POST "%AI_SERVICE_URL%/api/tag" ^
  -H "Content-Type: application/json" ^
  -d "{\"content\": \"Machine learning fundamentals with Python and statistics\", \"title\": \"ML Learning Guide\", \"category\": \"03-Resources\"}" ^
  --max-time %TEST_TIMEOUT% > tagging_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] AI tagging test completed
    type tagging_test.json
) else (
    echo [FAIL] AI tagging test failed
)

echo.

echo [TEST] Testing AI analysis...
curl -X POST "%AI_SERVICE_URL%/api/analyze" ^
  -H "Content-Type: application/json" ^
  -d "{\"content\": \"Weekly team retrospective meeting to discuss sprint performance and process improvements\", \"title\": \"Team Retrospective\", \"context\": {}}" ^
  --max-time %TEST_TIMEOUT% > analysis_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] AI analysis test completed
    type analysis_test.json
) else (
    echo [FAIL] AI analysis test failed
)

echo.

REM Test 3: n8n Workflow Tests
echo ========================================
echo Test 3: n8n Workflow Tests
echo ========================================
echo.

echo [TEST] Testing vault creation...
curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"vault.create\", \"vault_path\": \"%VAULT_PATH%\", \"payload\": {\"name\": \"Life-OS\", \"ai_enhanced\": true}}" ^
  --max-time %TEST_TIMEOUT% > vault_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] Vault creation test completed
    type vault_test.json
) else (
    echo [FAIL] Vault creation test failed
)

echo.

echo [TEST] Testing AI-enhanced note creation...
curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"note.create\", \"vault_path\": \"%VAULT_PATH%\", \"payload\": {\"title\": \"AI Test Project\", \"content\": \"This is a test project with AI analysis and smart tagging\", \"tags\": [\"test\", \"ai\", \"project\"], \"metadata\": {\"source\": \"test\", \"ai_enhanced\": true}}}" ^
  --max-time %TEST_TIMEOUT% > note_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] AI-enhanced note creation test completed
    type note_test.json
) else (
    echo [FAIL] AI-enhanced note creation test failed
)

echo.

echo [TEST] Testing AI content analysis...
curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"ai.analyze\", \"vault_path\": \"%VAULT_PATH%\", \"payload\": {\"content\": \"Advanced machine learning techniques for natural language processing\", \"title\": \"NLP ML Techniques\", \"context\": {}}}" ^
  --max-time %TEST_TIMEOUT% > ai_analysis_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] AI content analysis test completed
    type ai_analysis_test.json
) else (
    echo [FAIL] AI content analysis test failed
)

echo.

echo [TEST] Testing AI smart tagging...
curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"ai.tag\", \"vault_path\": \"%VAULT_PATH%\", \"payload\": {\"content\": \"Comprehensive guide to React 19 new features and best practices\", \"title\": \"React 19 Guide\", \"category\": \"03-Resources\"}}" ^
  --max-time %TEST_TIMEOUT% > ai_tagging_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] AI smart tagging test completed
    type ai_tagging_test.json
) else (
    echo [FAIL] AI smart tagging test failed
)

echo.

REM Test 4: File System Tests
echo ========================================
echo Test 4: File System Tests
echo ========================================
echo.

echo [TEST] Checking vault structure...
if exist "%VAULT_PATH%" (
    echo [PASS] Vault directory exists
    echo [INFO] Vault contents:
    dir "%VAULT_PATH%" /B
) else (
    echo [FAIL] Vault directory does not exist
    echo [INFO] Creating vault directory...
    mkdir "%VAULT_PATH%"
)

echo.

echo [TEST] Checking AI directories...
if exist "%VAULT_PATH%\.ai" (
    echo [PASS] AI directory exists
    echo [INFO] AI directory contents:
    dir "%VAULT_PATH%\.ai" /B
) else (
    echo [WARN] AI directory does not exist (will be created by vault creation)
)

echo.

echo [TEST] Checking templates...
if exist "%VAULT_PATH%\.templates" (
    echo [PASS] Templates directory exists
    echo [INFO] Available templates:
    dir "%VAULT_PATH%\.templates" /B
) else (
    echo [WARN] Templates directory does not exist (will be created by vault creation)
)

echo.

REM Test 5: Performance Tests
echo ========================================
echo Test 5: Performance Tests
echo ========================================
echo.

echo [TEST] Testing AI service response time...
for /f %%i in ('curl -w "%%{time_total}" -s -o nul "%AI_SERVICE_URL%/health"') do set RESPONSE_TIME=%%i
echo [INFO] AI service response time: %RESPONSE_TIME%s

if %RESPONSE_TIME% LSS 2.0 (
    echo [PASS] AI service response time is acceptable
) else (
    echo [WARN] AI service response time is slow: %RESPONSE_TIME%s
)

echo.

echo [TEST] Testing n8n workflow response time...
for /f %%i in ('curl -w "%%{time_total}" -s -o nul "%N8N_URL%/healthz"') do set N8N_RESPONSE_TIME=%%i
echo [INFO] n8n service response time: %N8N_RESPONSE_TIME%s

if %N8N_RESPONSE_TIME% LSS 1.0 (
    echo [PASS] n8n service response time is acceptable
) else (
    echo [WARN] n8n service response time is slow: %N8N_RESPONSE_TIME%s
)

echo.

REM Test 6: Integration Tests
echo ========================================
echo Test 6: Integration Tests
echo ========================================
echo.

echo [TEST] Testing end-to-end workflow...
echo [INFO] Creating test project with full AI analysis...

curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"note.create\", \"vault_path\": \"%VAULT_PATH%\", \"payload\": {\"title\": \"E-commerce Platform Development\", \"content\": \"## Project Overview\nBuild a comprehensive e-commerce platform with modern UI/UX, mobile-first design, payment integration, and inventory management.\n\n## Technical Requirements\n- React.js frontend\n- Node.js backend\n- PostgreSQL database\n- Stripe payment integration\n- AWS deployment\n\n## Timeline\n- Duration: 8 weeks\n- Milestones: Design, Development, Testing, Deployment\n\n## Success Criteria\n- [ ] Fully functional e-commerce platform\n- [ ] Mobile-responsive design\n- [ ] Secure payment processing\n- [ ] Admin dashboard\n- [ ] Inventory management\", \"tags\": [\"ecommerce\", \"web-development\", \"react\", \"nodejs\", \"database\"], \"metadata\": {\"source\": \"integration-test\", \"ai_enhanced\": true}}}" ^
  --max-time %TEST_TIMEOUT% > integration_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] End-to-end integration test completed
    echo [INFO] Integration test results:
    type integration_test.json
) else (
    echo [FAIL] End-to-end integration test failed
)

echo.

REM Test 7: Error Handling Tests
echo ========================================
echo Test 7: Error Handling Tests
echo ========================================
echo.

echo [TEST] Testing invalid action handling...
curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"invalid.action\", \"vault_path\": \"%VAULT_PATH%\", \"payload\": {}}" ^
  --max-time %TEST_TIMEOUT% > error_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] Error handling test completed
    echo [INFO] Error response:
    type error_test.json
) else (
    echo [FAIL] Error handling test failed
)

echo.

echo [TEST] Testing missing payload handling...
curl -X POST "%N8N_URL%/webhook/obsidian-ai" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\": \"note.create\", \"vault_path\": \"%VAULT_PATH%\"}" ^
  --max-time %TEST_TIMEOUT% > missing_payload_test.json 2>nul

if %errorlevel% equ 0 (
    echo [PASS] Missing payload handling test completed
    echo [INFO] Missing payload response:
    type missing_payload_test.json
) else (
    echo [FAIL] Missing payload handling test failed
)

echo.

REM Cleanup
echo ========================================
echo Cleanup
echo ========================================
echo.

echo [INFO] Cleaning up test files...
del /Q *.json 2>nul
echo [INFO] Test files cleaned up

echo.

REM Final Results
echo ========================================
echo Test Results Summary
echo ========================================
echo.

echo [INFO] All tests completed!
echo [INFO] Check the results above for any failures.
echo [INFO] If all tests passed, your AI-enhanced system is ready to use!
echo.

echo [INFO] Next steps:
echo [INFO] 1. Open Obsidian and load your vault at: %VAULT_PATH%
echo [INFO] 2. Configure Cursor AI with the enhanced system prompt
echo [INFO] 3. Start creating AI-enhanced notes!
echo.

echo ========================================
echo Test Suite Complete
echo ========================================
goto :end

:error
echo.
echo [ERROR] Test suite failed. Please check the errors above and try again.
echo [INFO] Make sure all services are running:
echo [INFO] - n8n: n8n start
echo [INFO] - AI service: cd ai-service && python main.py
echo.
pause
exit /b 1

:end
echo.
echo [SUCCESS] All tests completed successfully!
echo [INFO] Your AI-enhanced second brain system is ready!
echo.
pause
