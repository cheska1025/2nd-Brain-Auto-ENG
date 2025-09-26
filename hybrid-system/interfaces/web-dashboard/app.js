/**
 * 2nd-Brain-Auto 하이브리드 시스템 - 웹 대시보드 JavaScript
 */

class SecondBrainDashboard {
    constructor() {
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
        this.currentTab = 'dashboard';
        this.settings = this.loadSettings();
        this.charts = {};
        
        this.initializeApp();
    }

    /**
     * 앱 초기화
     */
    initializeApp() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.startAutoRefresh();
        this.applySettings();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 탭 전환
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('href').substring(1);
                this.switchTab(tabId);
            });
        });

        // 새 입력 버튼
        document.getElementById('newInputBtn').addEventListener('click', () => {
            this.switchTab('input');
        });

        // 처리 버튼
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processInput();
        });

        // 초기화 버튼
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearInput();
        });

        // 설정 버튼
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // 설정 모달
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.hideSettings();
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
            this.hideSettings();
        });

        // 동기화 새로고침
        document.getElementById('refreshSyncBtn').addEventListener('click', () => {
            this.loadSyncStatus();
        });

        // 히스토리 필터
        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.loadHistory();
        });

        // 분석 기간 변경
        document.getElementById('analyticsPeriod').addEventListener('change', () => {
            this.loadAnalytics();
        });

        // 신뢰도 임계값 슬라이더
        document.getElementById('confidenceThreshold').addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = e.target.value + '%';
        });
    }

    /**
     * 탭 전환
     */
    switchTab(tabId) {
        // 모든 탭 비활성화
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 선택된 탭 활성화
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[href="#${tabId}"]`).parentElement.classList.add('active');

        this.currentTab = tabId;

        // 탭별 데이터 로드
        switch (tabId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'sync':
                this.loadSyncStatus();
                break;
            case 'history':
                this.loadHistory();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    /**
     * 대시보드 데이터 로드
     */
    async loadDashboardData() {
        try {
            this.showLoading();
            
            const [systemStatus, recentActivity] = await Promise.all([
                this.fetchSystemStatus(),
                this.fetchRecentActivity()
            ]);

            this.updateDashboardUI(systemStatus, recentActivity);
            this.updateLastUpdated();
            
        } catch (error) {
            console.error('대시보드 데이터 로드 실패:', error);
            this.showError('대시보드 데이터를 불러오는데 실패했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 시스템 상태 조회
     */
    async fetchSystemStatus() {
        const response = await fetch(`${this.apiBaseUrl}/system/status`);
        if (!response.ok) throw new Error('시스템 상태 조회 실패');
        return await response.json();
    }

    /**
     * 최근 활동 조회
     */
    async fetchRecentActivity() {
        const response = await fetch(`${this.apiBaseUrl}/activity/recent?limit=10`);
        if (!response.ok) throw new Error('최근 활동 조회 실패');
        return await response.json();
    }

    /**
     * 대시보드 UI 업데이트
     */
    updateDashboardUI(systemStatus, recentActivity) {
        // MECE 상태 업데이트
        document.getElementById('meceScore').textContent = systemStatus.meceHealth.overallScore || '-';
        document.getElementById('meScore').textContent = systemStatus.meceHealth.meScore || '-';
        document.getElementById('ceScore').textContent = systemStatus.meceHealth.ceScore || '-';

        // AI 처리 상태 업데이트
        const aiStats = systemStatus.performance;
        document.getElementById('aiAccuracy').textContent = 
            aiStats.avgConfidence ? Math.round(aiStats.avgConfidence) + '%' : '-';
        document.getElementById('totalRequests').textContent = aiStats.totalRequests || '-';
        document.getElementById('successRate').textContent = 
            aiStats.totalRequests ? Math.round((aiStats.successfulRequests / aiStats.totalRequests) * 100) + '%' : '-';

        // 동기화 상태 업데이트
        const syncStatus = systemStatus.syncStatus;
        document.getElementById('syncStatus').textContent = 
            syncStatus.isProcessing ? '처리 중' : '대기 중';
        document.getElementById('pendingSync').textContent = syncStatus.pendingChanges || '-';
        document.getElementById('syncErrors').textContent = syncStatus.errors?.length || '-';

        // 최근 활동 업데이트
        this.updateRecentActivity(recentActivity);
    }

    /**
     * 최근 활동 업데이트
     */
    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        container.innerHTML = '';

        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">최근 활동이 없습니다.</p>';
            return;
        }

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            activityElement.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
            `;
            
            container.appendChild(activityElement);
        });
    }

    /**
     * 활동 타입별 아이콘 반환
     */
    getActivityIcon(type) {
        const iconMap = {
            'classification': 'sitemap',
            'ai_processing': 'robot',
            'sync': 'sync',
            'error': 'exclamation-triangle'
        };
        return iconMap[type] || 'circle';
    }

    /**
     * 입력 처리
     */
    async processInput() {
        const inputText = document.getElementById('inputText').value.trim();
        const userHeadline = document.getElementById('userHeadline').value;
        const processingType = document.getElementById('processingType').value;
        const enableAI = document.getElementById('enableAI').checked;
        const enableSync = document.getElementById('enableSync').checked;

        if (!inputText) {
            this.showError('입력 내용을 입력해주세요.');
            return;
        }

        try {
            this.showLoading();
            
            const requestData = {
                input: inputText,
                userHeadline: userHeadline || null,
                processingType: processingType || null,
                enableAI: enableAI,
                enableSync: enableSync
            };

            const response = await fetch(`${this.apiBaseUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('입력 처리 실패');
            }

            const result = await response.json();
            this.displayProcessingResult(result);
            
            // 대시보드 데이터 새로고침
            this.loadDashboardData();
            
        } catch (error) {
            console.error('입력 처리 오류:', error);
            this.showError('입력 처리 중 오류가 발생했습니다: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 처리 결과 표시
     */
    displayProcessingResult(result) {
        const container = document.getElementById('processingResult');
        const content = document.querySelector('.result-content');
        
        content.innerHTML = `
            <div class="result-section">
                <h4>MECE 분류 결과</h4>
                <p><strong>카테고리:</strong> ${result.mece.category}</p>
                <p><strong>신뢰도:</strong> ${result.mece.confidence}%</p>
                <p><strong>P.A.R.A:</strong> ${result.mece.paraCategory}</p>
                <p><strong>우선순위:</strong> ${result.mece.priority}</p>
                <p><strong>분류 근거:</strong> ${result.mece.reasoning}</p>
            </div>
            
            <div class="result-section">
                <h4>AI 처리 결과</h4>
                <p><strong>제공자:</strong> ${result.ai.provider}</p>
                <p><strong>처리 타입:</strong> ${result.ai.processingType}</p>
                <p><strong>제목:</strong> ${result.integrated.title}</p>
                <p><strong>요약:</strong> ${result.integrated.summary}</p>
            </div>
            
            <div class="result-section">
                <h4>액션 아이템</h4>
                <ul>
                    ${result.integrated.actionItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="result-section">
                <h4>동기화 정보</h4>
                <p><strong>대상 플랫폼:</strong> ${result.mece.destinations.join(', ')}</p>
                <p><strong>태그:</strong> ${result.integrated.tags.join(', ')}</p>
            </div>
        `;
        
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 입력 초기화
     */
    clearInput() {
        document.getElementById('inputText').value = '';
        document.getElementById('userHeadline').value = '';
        document.getElementById('processingType').value = '';
        document.getElementById('processingResult').style.display = 'none';
    }

    /**
     * 동기화 상태 로드
     */
    async loadSyncStatus() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/sync/status`);
            if (!response.ok) throw new Error('동기화 상태 조회 실패');
            
            const syncStatus = await response.json();
            this.updateSyncStatusUI(syncStatus);
            
        } catch (error) {
            console.error('동기화 상태 로드 실패:', error);
            this.showError('동기화 상태를 불러오는데 실패했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 동기화 상태 UI 업데이트
     */
    updateSyncStatusUI(syncStatus) {
        // 플랫폼별 상태 업데이트
        syncStatus.connectors.forEach(connector => {
            const statusElement = document.getElementById(`${connector.name}Status`);
            const lastSyncElement = document.getElementById(`${connector.name}LastSync`);
            const countElement = document.getElementById(`${connector.name}FileCount`);
            
            if (statusElement) {
                statusElement.textContent = connector.available ? '정상' : '오류';
                statusElement.className = `status-indicator ${connector.available ? 'healthy' : 'error'}`;
            }
            
            if (lastSyncElement) {
                lastSyncElement.textContent = connector.lastSync ? 
                    this.formatTime(connector.lastSync) : '없음';
            }
            
            if (countElement) {
                countElement.textContent = connector.fileCount || '-';
            }
        });

        // 동기화 큐 업데이트
        this.updateSyncQueue(syncStatus.queue || []);
    }

    /**
     * 동기화 큐 업데이트
     */
    updateSyncQueue(queue) {
        const container = document.getElementById('syncQueue');
        container.innerHTML = '';

        if (!queue || queue.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">동기화 대기 중인 항목이 없습니다.</p>';
            return;
        }

        queue.forEach(item => {
            const queueElement = document.createElement('div');
            queueElement.className = `queue-item ${item.status}`;
            
            queueElement.innerHTML = `
                <div class="queue-icon">
                    <i class="fas fa-${this.getQueueIcon(item.status)}"></i>
                </div>
                <div class="queue-content">
                    <div class="queue-title">${item.title || '동기화 항목'}</div>
                    <div class="queue-description">${item.description || '처리 중...'}</div>
                </div>
                <div class="queue-time">${this.formatTime(item.timestamp)}</div>
            `;
            
            container.appendChild(queueElement);
        });
    }

    /**
     * 큐 상태별 아이콘 반환
     */
    getQueueIcon(status) {
        const iconMap = {
            'pending': 'clock',
            'processing': 'spinner',
            'completed': 'check',
            'failed': 'times'
        };
        return iconMap[status] || 'circle';
    }

    /**
     * 히스토리 로드
     */
    async loadHistory() {
        try {
            this.showLoading();
            
            const categoryFilter = document.getElementById('categoryFilter').value;
            const dateFilter = document.getElementById('dateFilter').value;
            
            const params = new URLSearchParams();
            if (categoryFilter) params.append('category', categoryFilter);
            if (dateFilter) params.append('date', dateFilter);
            
            const response = await fetch(`${this.apiBaseUrl}/history?${params}`);
            if (!response.ok) throw new Error('히스토리 조회 실패');
            
            const history = await response.json();
            this.updateHistoryUI(history);
            
        } catch (error) {
            console.error('히스토리 로드 실패:', error);
            this.showError('히스토리를 불러오는데 실패했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 히스토리 UI 업데이트
     */
    updateHistoryUI(history) {
        const container = document.getElementById('historyList');
        container.innerHTML = '';

        if (!history || history.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">히스토리가 없습니다.</p>';
            return;
        }

        history.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            
            historyElement.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${item.title || '제목 없음'}</div>
                    <div class="history-item-time">${this.formatTime(item.timestamp)}</div>
                </div>
                <div class="history-item-content">${item.content || '내용 없음'}</div>
                <div class="history-item-meta">
                    <span>${item.meceCategory}</span>
                    <span>${item.confidence}%</span>
                    <span>${item.provider || 'N/A'}</span>
                </div>
            `;
            
            container.appendChild(historyElement);
        });
    }

    /**
     * 분석 데이터 로드
     */
    async loadAnalytics() {
        try {
            this.showLoading();
            
            const period = document.getElementById('analyticsPeriod').value;
            
            const response = await fetch(`${this.apiBaseUrl}/analytics?period=${period}`);
            if (!response.ok) throw new Error('분석 데이터 조회 실패');
            
            const analytics = await response.json();
            this.updateAnalyticsUI(analytics);
            
        } catch (error) {
            console.error('분석 데이터 로드 실패:', error);
            this.showError('분석 데이터를 불러오는데 실패했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 분석 UI 업데이트
     */
    updateAnalyticsUI(analytics) {
        // 통계 업데이트
        document.getElementById('totalProcessed').textContent = analytics.totalProcessed || '-';
        document.getElementById('avgConfidence').textContent = 
            analytics.avgConfidence ? Math.round(analytics.avgConfidence) + '%' : '-';
        document.getElementById('mostUsedCategory').textContent = analytics.mostUsedCategory || '-';

        // 차트 업데이트
        this.updateCharts(analytics);
    }

    /**
     * 차트 업데이트
     */
    updateCharts(analytics) {
        // 카테고리별 차트
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        
        this.charts.category = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: analytics.categoryStats?.labels || [],
                datasets: [{
                    data: analytics.categoryStats?.data || [],
                    backgroundColor: [
                        '#2563eb', '#10b981', '#f59e0b', 
                        '#ef4444', '#8b5cf6', '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // 제공자별 차트
        const providerCtx = document.getElementById('providerChart').getContext('2d');
        if (this.charts.provider) {
            this.charts.provider.destroy();
        }
        
        this.charts.provider = new Chart(providerCtx, {
            type: 'bar',
            data: {
                labels: analytics.providerStats?.labels || [],
                datasets: [{
                    label: '성공률 (%)',
                    data: analytics.providerStats?.data || [],
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    /**
     * 설정 표시
     */
    showSettings() {
        document.getElementById('settingsModal').classList.add('show');
        this.loadSettingsToUI();
    }

    /**
     * 설정 숨기기
     */
    hideSettings() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    /**
     * 설정을 UI에 로드
     */
    loadSettingsToUI() {
        document.getElementById('defaultAIProvider').value = this.settings.defaultAIProvider || 'claude';
        document.getElementById('confidenceThreshold').value = this.settings.confidenceThreshold || 70;
        document.getElementById('confidenceValue').textContent = (this.settings.confidenceThreshold || 70) + '%';
        document.getElementById('autoSyncEnabled').checked = this.settings.autoSyncEnabled !== false;
        document.getElementById('syncInterval').value = this.settings.syncInterval || 5000;
        document.getElementById('darkModeEnabled').checked = this.settings.darkModeEnabled || false;
        document.getElementById('language').value = this.settings.language || 'ko';
    }

    /**
     * 설정 저장
     */
    saveSettings() {
        this.settings = {
            defaultAIProvider: document.getElementById('defaultAIProvider').value,
            confidenceThreshold: parseInt(document.getElementById('confidenceThreshold').value),
            autoSyncEnabled: document.getElementById('autoSyncEnabled').checked,
            syncInterval: parseInt(document.getElementById('syncInterval').value),
            darkModeEnabled: document.getElementById('darkModeEnabled').checked,
            language: document.getElementById('language').value
        };

        this.saveSettingsToStorage();
        this.applySettings();
        this.hideSettings();
        
        this.showSuccess('설정이 저장되었습니다.');
    }

    /**
     * 설정 적용
     */
    applySettings() {
        // 다크 모드 적용
        if (this.settings.darkModeEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // 언어 적용
        if (this.settings.language === 'en') {
            // 영어 모드 적용 (실제로는 다국어 지원 구현 필요)
            console.log('English mode enabled');
        }
    }

    /**
     * 설정 로드
     */
    loadSettings() {
        const saved = localStorage.getItem('secondBrainSettings');
        return saved ? JSON.parse(saved) : {
            defaultAIProvider: 'claude',
            confidenceThreshold: 70,
            autoSyncEnabled: true,
            syncInterval: 5000,
            darkModeEnabled: false,
            language: 'ko'
        };
    }

    /**
     * 설정 저장
     */
    saveSettingsToStorage() {
        localStorage.setItem('secondBrainSettings', JSON.stringify(this.settings));
    }

    /**
     * 자동 새로고침 시작
     */
    startAutoRefresh() {
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.loadDashboardData();
            } else if (this.currentTab === 'sync') {
                this.loadSyncStatus();
            }
        }, 30000); // 30초마다 새로고침
    }

    /**
     * 마지막 업데이트 시간 업데이트
     */
    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            now.toLocaleTimeString('ko-KR');
    }

    /**
     * 로딩 표시
     */
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    /**
     * 로딩 숨기기
     */
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        // 간단한 알림 구현 (실제로는 토스트 알림 라이브러리 사용 권장)
        alert('오류: ' + message);
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        // 간단한 알림 구현
        alert('성공: ' + message);
    }

    /**
     * 시간 포맷팅
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1분 미만
            return '방금 전';
        } else if (diff < 3600000) { // 1시간 미만
            return Math.floor(diff / 60000) + '분 전';
        } else if (diff < 86400000) { // 1일 미만
            return Math.floor(diff / 3600000) + '시간 전';
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SecondBrainDashboard();
});
