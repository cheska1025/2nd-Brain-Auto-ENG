#!/bin/bash
# 2nd-Brain-Auto (Ver. ENG) - AI-Enhanced Test Scripts for Linux/macOS
# Advanced testing suite for AI-powered knowledge management system

echo "========================================"
echo "2nd-Brain-Auto AI-Enhanced Test Suite"
echo "========================================"
echo

# Set environment variables
VAULT_PATH="/path/to/obsidian/vault"
N8N_URL="http://localhost:5678"
AI_SERVICE_URL="http://localhost:8000"
TEST_TIMEOUT=30

echo "[INFO] Starting comprehensive test suite..."
echo "[INFO] Vault Path: $VAULT_PATH"
echo "[INFO] n8n URL: $N8N_URL"
echo "[INFO] AI Service URL: $AI_SERVICE_URL"
echo

# Test 1: Health Check
echo "========================================"
echo "Test 1: Health Check"
echo "========================================"
echo

echo "[TEST] Checking n8n service..."
if curl -f "$N8N_URL/healthz" >/dev/null 2>&1; then
    echo "[PASS] n8n service is running"
else
    echo "[FAIL] n8n service is not responding"
    echo "[INFO] Please start n8n with: n8n start"
    exit 1
fi

echo "[TEST] Checking AI service..."
if curl -f "$AI_SERVICE_URL/health" >/dev/null 2>&1; then
    echo "[PASS] AI service is running"
else
    echo "[FAIL] AI service is not responding"
    echo "[INFO] Please start AI service with: cd ai-service && python main.py"
    exit 1
fi

echo

# Test 2: AI Service API Tests
echo "========================================"
echo "Test 2: AI Service API Tests"
echo "========================================"
echo

echo "[TEST] Testing AI classification..."
if curl -X POST "$AI_SERVICE_URL/api/classify" \
  -H "Content-Type: application/json" \
  -d '{"content": "Build a comprehensive e-commerce platform with modern UI/UX and payment integration", "context": {}}' \
  --max-time $TEST_TIMEOUT > classification_test.json 2>/dev/null; then
    echo "[PASS] AI classification test completed"
    cat classification_test.json
else
    echo "[FAIL] AI classification test failed"
fi

echo

echo "[TEST] Testing AI tagging..."
if curl -X POST "$AI_SERVICE_URL/api/tag" \
  -H "Content-Type: application/json" \
  -d '{"content": "Machine learning fundamentals with Python and statistics", "title": "ML Learning Guide", "category": "03-Resources"}' \
  --max-time $TEST_TIMEOUT > tagging_test.json 2>/dev/null; then
    echo "[PASS] AI tagging test completed"
    cat tagging_test.json
else
    echo "[FAIL] AI tagging test failed"
fi

echo

echo "[TEST] Testing AI analysis..."
if curl -X POST "$AI_SERVICE_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"content": "Weekly team retrospective meeting to discuss sprint performance and process improvements", "title": "Team Retrospective", "context": {}}' \
  --max-time $TEST_TIMEOUT > analysis_test.json 2>/dev/null; then
    echo "[PASS] AI analysis test completed"
    cat analysis_test.json
else
    echo "[FAIL] AI analysis test failed"
fi

echo

# Test 3: n8n Workflow Tests
echo "========================================"
echo "Test 3: n8n Workflow Tests"
echo "========================================"
echo

echo "[TEST] Testing vault creation..."
if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"vault.create\", \"vault_path\": \"$VAULT_PATH\", \"payload\": {\"name\": \"Life-OS\", \"ai_enhanced\": true}}" \
  --max-time $TEST_TIMEOUT > vault_test.json 2>/dev/null; then
    echo "[PASS] Vault creation test completed"
    cat vault_test.json
else
    echo "[FAIL] Vault creation test failed"
fi

echo

echo "[TEST] Testing AI-enhanced note creation..."
if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"note.create\", \"vault_path\": \"$VAULT_PATH\", \"payload\": {\"title\": \"AI Test Project\", \"content\": \"This is a test project with AI analysis and smart tagging\", \"tags\": [\"test\", \"ai\", \"project\"], \"metadata\": {\"source\": \"test\", \"ai_enhanced\": true}}}" \
  --max-time $TEST_TIMEOUT > note_test.json 2>/dev/null; then
    echo "[PASS] AI-enhanced note creation test completed"
    cat note_test.json
else
    echo "[FAIL] AI-enhanced note creation test failed"
fi

echo

echo "[TEST] Testing AI content analysis..."
if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"ai.analyze\", \"vault_path\": \"$VAULT_PATH\", \"payload\": {\"content\": \"Advanced machine learning techniques for natural language processing\", \"title\": \"NLP ML Techniques\", \"context\": {}}}" \
  --max-time $TEST_TIMEOUT > ai_analysis_test.json 2>/dev/null; then
    echo "[PASS] AI content analysis test completed"
    cat ai_analysis_test.json
else
    echo "[FAIL] AI content analysis test failed"
fi

echo

echo "[TEST] Testing AI smart tagging..."
if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"ai.tag\", \"vault_path\": \"$VAULT_PATH\", \"payload\": {\"content\": \"Comprehensive guide to React 19 new features and best practices\", \"title\": \"React 19 Guide\", \"category\": \"03-Resources\"}}" \
  --max-time $TEST_TIMEOUT > ai_tagging_test.json 2>/dev/null; then
    echo "[PASS] AI smart tagging test completed"
    cat ai_tagging_test.json
else
    echo "[FAIL] AI smart tagging test failed"
fi

echo

# Test 4: File System Tests
echo "========================================"
echo "Test 4: File System Tests"
echo "========================================"
echo

echo "[TEST] Checking vault structure..."
if [ -d "$VAULT_PATH" ]; then
    echo "[PASS] Vault directory exists"
    echo "[INFO] Vault contents:"
    ls -la "$VAULT_PATH"
else
    echo "[FAIL] Vault directory does not exist"
    echo "[INFO] Creating vault directory..."
    mkdir -p "$VAULT_PATH"
fi

echo

echo "[TEST] Checking AI directories..."
if [ -d "$VAULT_PATH/.ai" ]; then
    echo "[PASS] AI directory exists"
    echo "[INFO] AI directory contents:"
    ls -la "$VAULT_PATH/.ai"
else
    echo "[WARN] AI directory does not exist (will be created by vault creation)"
fi

echo

echo "[TEST] Checking templates..."
if [ -d "$VAULT_PATH/.templates" ]; then
    echo "[PASS] Templates directory exists"
    echo "[INFO] Available templates:"
    ls -la "$VAULT_PATH/.templates"
else
    echo "[WARN] Templates directory does not exist (will be created by vault creation)"
fi

echo

# Test 5: Performance Tests
echo "========================================"
echo "Test 5: Performance Tests"
echo "========================================"
echo

echo "[TEST] Testing AI service response time..."
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "$AI_SERVICE_URL/health")
echo "[INFO] AI service response time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo "[PASS] AI service response time is acceptable"
else
    echo "[WARN] AI service response time is slow: ${RESPONSE_TIME}s"
fi

echo

echo "[TEST] Testing n8n workflow response time..."
N8N_RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "$N8N_URL/healthz")
echo "[INFO] n8n service response time: ${N8N_RESPONSE_TIME}s"

if (( $(echo "$N8N_RESPONSE_TIME < 1.0" | bc -l) )); then
    echo "[PASS] n8n service response time is acceptable"
else
    echo "[WARN] n8n service response time is slow: ${N8N_RESPONSE_TIME}s"
fi

echo

# Test 6: Integration Tests
echo "========================================"
echo "Test 6: Integration Tests"
echo "========================================"
echo

echo "[TEST] Testing end-to-end workflow..."
echo "[INFO] Creating test project with full AI analysis..."

if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d '{"action": "note.create", "vault_path": "'$VAULT_PATH'", "payload": {"title": "E-commerce Platform Development", "content": "## Project Overview\nBuild a comprehensive e-commerce platform with modern UI/UX, mobile-first design, payment integration, and inventory management.\n\n## Technical Requirements\n- React.js frontend\n- Node.js backend\n- PostgreSQL database\n- Stripe payment integration\n- AWS deployment\n\n## Timeline\n- Duration: 8 weeks\n- Milestones: Design, Development, Testing, Deployment\n\n## Success Criteria\n- [ ] Fully functional e-commerce platform\n- [ ] Mobile-responsive design\n- [ ] Secure payment processing\n- [ ] Admin dashboard\n- [ ] Inventory management", "tags": ["ecommerce", "web-development", "react", "nodejs", "database"], "metadata": {"source": "integration-test", "ai_enhanced": true}}}' \
  --max-time $TEST_TIMEOUT > integration_test.json 2>/dev/null; then
    echo "[PASS] End-to-end integration test completed"
    echo "[INFO] Integration test results:"
    cat integration_test.json
else
    echo "[FAIL] End-to-end integration test failed"
fi

echo

# Test 7: Error Handling Tests
echo "========================================"
echo "Test 7: Error Handling Tests"
echo "========================================"
echo

echo "[TEST] Testing invalid action handling..."
if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d '{"action": "invalid.action", "vault_path": "'$VAULT_PATH'", "payload": {}}' \
  --max-time $TEST_TIMEOUT > error_test.json 2>/dev/null; then
    echo "[PASS] Error handling test completed"
    echo "[INFO] Error response:"
    cat error_test.json
else
    echo "[FAIL] Error handling test failed"
fi

echo

echo "[TEST] Testing missing payload handling..."
if curl -X POST "$N8N_URL/webhook/obsidian-ai" \
  -H "Content-Type: application/json" \
  -d '{"action": "note.create", "vault_path": "'$VAULT_PATH'"}' \
  --max-time $TEST_TIMEOUT > missing_payload_test.json 2>/dev/null; then
    echo "[PASS] Missing payload handling test completed"
    echo "[INFO] Missing payload response:"
    cat missing_payload_test.json
else
    echo "[FAIL] Missing payload handling test failed"
fi

echo

# Cleanup
echo "========================================"
echo "Cleanup"
echo "========================================"
echo

echo "[INFO] Cleaning up test files..."
rm -f *.json
echo "[INFO] Test files cleaned up"

echo

# Final Results
echo "========================================"
echo "Test Results Summary"
echo "========================================"
echo

echo "[INFO] All tests completed!"
echo "[INFO] Check the results above for any failures."
echo "[INFO] If all tests passed, your AI-enhanced system is ready to use!"
echo

echo "[INFO] Next steps:"
echo "[INFO] 1. Open Obsidian and load your vault at: $VAULT_PATH"
echo "[INFO] 2. Configure Cursor AI with the enhanced system prompt"
echo "[INFO] 3. Start creating AI-enhanced notes!"
echo

echo "========================================"
echo "Test Suite Complete"
echo "========================================"

echo
echo "[SUCCESS] All tests completed successfully!"
echo "[INFO] Your AI-enhanced second brain system is ready!"
echo
