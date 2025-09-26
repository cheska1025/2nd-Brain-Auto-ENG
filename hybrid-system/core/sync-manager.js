/**
 * 동기화 관리자 - 2nd-Brain-Auto 하이브리드 시스템
 * Obsidian, Notion, Local PC 간의 실시간 동기화 관리
 */

class SyncManager {
  constructor(config = {}) {
    this.config = {
      syncInterval: 5000, // 5초마다 동기화 체크
      maxRetries: 3,
      conflictResolution: 'user_choice', // user_choice, latest_wins, manual
      enableRealTimeSync: true,
      ...config
    };

    // 플랫폼 연결자
    this.connectors = {};
    
    // 동기화 큐
    this.syncQueue = [];
    this.isProcessing = false;
    
    // 동기화 상태 추적
    this.syncStatus = {
      lastSync: null,
      pendingChanges: 0,
      conflicts: [],
      errors: []
    };

    // 동기화 매핑 저장소
    this.syncMappings = new Map();
    
    // 초기화
    this.initializeConnectors();
  }

  /**
   * 플랫폼 연결자 초기화
   */
  async initializeConnectors() {
    try {
      // Obsidian 연결자
      this.connectors.obsidian = await this.createObsidianConnector();
      
      // Notion 연결자
      this.connectors.notion = await this.createNotionConnector();
      
      // Local PC 연결자
      this.connectors.localPC = await this.createLocalPCConnector();

      console.log('✅ 플랫폼 연결자 초기화 완료');
      
      // 실시간 동기화 시작
      if (this.config.enableRealTimeSync) {
        this.startRealTimeSync();
      }
    } catch (error) {
      console.error('❌ 플랫폼 연결자 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * Obsidian 연결자 생성
   */
  async createObsidianConnector() {
    const { ObsidianConnector } = require('../platforms/obsidian-connector');
    return new ObsidianConnector({
      vaultPath: process.env.OBSIDIAN_VAULT_PATH,
      watchMode: true,
      autoSync: true
    });
  }

  /**
   * Notion 연결자 생성
   */
  async createNotionConnector() {
    const { NotionConnector } = require('../platforms/notion-connector');
    return new NotionConnector({
      apiKey: process.env.NOTION_API_KEY,
      workspaceId: process.env.NOTION_WORKSPACE_ID,
      autoSync: true
    });
  }

  /**
   * Local PC 연결자 생성
   */
  async createLocalPCConnector() {
    const { LocalPCConnector } = require('../platforms/local-pc-connector');
    return new LocalPCConnector({
      basePath: process.env.LOCAL_PC_PATH,
      watchMode: true,
      autoSync: true
    });
  }

  /**
   * 메인 동기화 함수
   */
  async syncContent(content, meceResult, aiResult) {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 동기화 매핑 생성
      const syncMapping = this.createSyncMapping(syncId, content, meceResult, aiResult);
      
      // 동기화 큐에 추가
      this.syncQueue.push(syncMapping);
      
      // 즉시 처리 시작
      if (!this.isProcessing) {
        this.processSyncQueue();
      }
      
      return {
        syncId,
        status: 'queued',
        mapping: syncMapping
      };
      
    } catch (error) {
      console.error('동기화 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 동기화 매핑 생성
   */
  createSyncMapping(syncId, content, meceResult, aiResult) {
    const { meceCategory, destinations, folderPaths } = meceResult;
    
    return {
      syncId,
      timestamp: new Date().toISOString(),
      content,
      meceCategory,
      destinations,
      folderPaths,
      aiResult,
      status: 'pending',
      platforms: {},
      conflicts: [],
      errors: []
    };
  }

  /**
   * 동기화 큐 처리
   */
  async processSyncQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 동기화 큐 처리 시작 (${this.syncQueue.length}개 항목)`);

    while (this.syncQueue.length > 0) {
      const syncMapping = this.syncQueue.shift();
      await this.processSyncMapping(syncMapping);
    }

    this.isProcessing = false;
    console.log('✅ 동기화 큐 처리 완료');
  }

  /**
   * 개별 동기화 매핑 처리
   */
  async processSyncMapping(syncMapping) {
    const { syncId, destinations, folderPaths, content, meceCategory } = syncMapping;
    
    try {
      console.log(`🔄 동기화 처리: ${syncId}`);
      
      // 각 플랫폼별 동기화 실행
      const syncPromises = [];
      
      if (destinations.includes('obsidian') && folderPaths.obsidian) {
        syncPromises.push(
          this.syncToObsidian(syncMapping)
        );
      }
      
      if (destinations.includes('notion') && folderPaths.notion) {
        syncPromises.push(
          this.syncToNotion(syncMapping)
        );
      }
      
      if (destinations.includes('localPC') && folderPaths.localPC) {
        syncPromises.push(
          this.syncToLocalPC(syncMapping)
        );
      }

      // 모든 동기화 병렬 실행
      const results = await Promise.allSettled(syncPromises);
      
      // 결과 처리
      this.processSyncResults(syncMapping, results);
      
      // 동기화 매핑 저장
      this.syncMappings.set(syncId, syncMapping);
      
      // 상태 업데이트
      this.updateSyncStatus(syncMapping);
      
    } catch (error) {
      console.error(`동기화 실패: ${syncId}`, error);
      syncMapping.status = 'failed';
      syncMapping.errors.push({
        platform: 'all',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obsidian 동기화
   */
  async syncToObsidian(syncMapping) {
    const { content, folderPaths, meceCategory, aiResult } = syncMapping;
    const connector = this.connectors.obsidian;
    
    try {
      // 파일명 생성
      const filename = this.generateObsidianFilename(content, meceCategory, aiResult);
      const filePath = `${folderPaths.obsidian}/${filename}`;
      
      // Obsidian 노트 생성
      const obsidianNote = await connector.createNote({
        path: filePath,
        content: this.formatObsidianContent(content, meceCategory, aiResult),
        metadata: this.generateObsidianMetadata(meceCategory, aiResult)
      });
      
      syncMapping.platforms.obsidian = {
        status: 'success',
        path: filePath,
        id: obsidianNote.id,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Obsidian 동기화 완료: ${filePath}`);
      
    } catch (error) {
      console.error('Obsidian 동기화 실패:', error);
      syncMapping.platforms.obsidian = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  /**
   * Notion 동기화
   */
  async syncToNotion(syncMapping) {
    const { content, folderPaths, meceCategory, aiResult } = syncMapping;
    const connector = this.connectors.notion;
    
    try {
      // 데이터베이스 선택
      const database = this.selectNotionDatabase(meceCategory);
      
      // Notion 페이지 생성
      const notionPage = await connector.createPage({
        database: database,
        properties: this.generateNotionProperties(meceCategory, aiResult),
        content: this.formatNotionContent(content, aiResult)
      });
      
      syncMapping.platforms.notion = {
        status: 'success',
        pageId: notionPage.id,
        database: database,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Notion 동기화 완료: ${database}`);
      
    } catch (error) {
      console.error('Notion 동기화 실패:', error);
      syncMapping.platforms.notion = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  /**
   * Local PC 동기화
   */
  async syncToLocalPC(syncMapping) {
    const { content, folderPaths, meceCategory, aiResult } = syncMapping;
    const connector = this.connectors.localPC;
    
    try {
      // 파일명 생성
      const filename = this.generateLocalPCFilename(content, meceCategory, aiResult);
      const filePath = `${folderPaths.localPC}/${filename}`;
      
      // 로컬 파일 생성
      const localFile = await connector.createFile({
        path: filePath,
        content: this.formatLocalPCContent(content, meceCategory, aiResult),
        metadata: this.generateLocalPCMetadata(meceCategory, aiResult)
      });
      
      syncMapping.platforms.localPC = {
        status: 'success',
        path: filePath,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Local PC 동기화 완료: ${filePath}`);
      
    } catch (error) {
      console.error('Local PC 동기화 실패:', error);
      syncMapping.platforms.localPC = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  /**
   * 동기화 결과 처리
   */
  processSyncResults(syncMapping, results) {
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      syncMapping.status = 'completed';
    } else if (successCount > 0) {
      syncMapping.status = 'partial';
    } else {
      syncMapping.status = 'failed';
    }
    
    // 실패한 동기화를 에러 목록에 추가
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        syncMapping.errors.push({
          platform: ['obsidian', 'notion', 'localPC'][index],
          error: result.reason.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * 실시간 동기화 시작
   */
  startRealTimeSync() {
    setInterval(async () => {
      if (this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }
    }, this.config.syncInterval);
    
    console.log('🔄 실시간 동기화 시작됨');
  }

  /**
   * 충돌 해결
   */
  async resolveConflict(conflictId, resolution) {
    try {
      const conflict = this.syncStatus.conflicts.find(c => c.id === conflictId);
      if (!conflict) {
        throw new Error('충돌을 찾을 수 없습니다');
      }
      
      switch (resolution.type) {
        case 'latest_wins':
          await this.applyLatestVersion(conflict);
          break;
        case 'merge':
          await this.mergeVersions(conflict, resolution.mergeStrategy);
          break;
        case 'manual':
          await this.applyManualResolution(conflict, resolution.content);
          break;
        default:
          throw new Error('알 수 없는 해결 방법');
      }
      
      // 충돌 해결 완료
      conflict.status = 'resolved';
      this.syncStatus.conflicts = this.syncStatus.conflicts.filter(c => c.id !== conflictId);
      
      console.log(`✅ 충돌 해결 완료: ${conflictId}`);
      
    } catch (error) {
      console.error('충돌 해결 실패:', error);
      throw error;
    }
  }

  /**
   * 동기화 상태 업데이트
   */
  updateSyncStatus(syncMapping) {
    this.syncStatus.lastSync = new Date().toISOString();
    this.syncStatus.pendingChanges = this.syncQueue.length;
    
    // 에러가 있으면 에러 목록에 추가
    if (syncMapping.errors.length > 0) {
      this.syncStatus.errors.push(...syncMapping.errors);
    }
  }

  /**
   * 파일명 생성 함수들
   */
  generateObsidianFilename(content, meceCategory, aiResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 14);
    const title = this.extractTitle(content, aiResult);
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣\s]/g, '').substring(0, 30);
    
    return `${timestamp}-${sanitizedTitle}.md`;
  }

  generateLocalPCFilename(content, meceCategory, aiResult) {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const title = this.extractTitle(content, aiResult);
    const category = this.getMECECategoryShort(meceCategory);
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣\s]/g, '').substring(0, 20);
    
    return `${date}_${category}_${sanitizedTitle}_v1.0.md`;
  }

  /**
   * 콘텐츠 포맷팅 함수들
   */
  formatObsidianContent(content, meceCategory, aiResult) {
    const today = new Date().toISOString().split('T')[0];
    const title = this.extractTitle(content, aiResult);
    
    return `# ${title}

## 📋 MECE 분류 정보
- **분류**: ${meceCategory}
- **신뢰도**: ${aiResult?.confidence || 'N/A'}%
- **처리 타입**: ${aiResult?.processingType || 'N/A'}

## 📝 내용
${content}

## 🤖 AI 분석 결과
${aiResult?.response ? JSON.stringify(aiResult.response, null, 2) : 'AI 분석 없음'}

## 🔗 연결
<!-- 관련 노트들이 자동으로 연결됩니다 -->

## 📊 액션 아이템
${this.formatActionItems(aiResult?.response)}

---
#${meceCategory.replace('-', '_')} #ai_processed #mece_compliant
Created: ${today}
MECE-ID: ${Date.now()}
`;
  }

  formatNotionContent(content, aiResult) {
    return {
      title: this.extractTitle(content, aiResult),
      content: content,
      aiAnalysis: aiResult?.response || null
    };
  }

  formatLocalPCContent(content, meceCategory, aiResult) {
    const today = new Date().toISOString().split('T')[0];
    const title = this.extractTitle(content, aiResult);
    
    return `# ${title}

## 문서 정보
- 생성일: ${today}
- MECE 분류: ${meceCategory}
- AI 처리: ${aiResult?.provider || 'N/A'}

## 내용
${content}

## AI 분석
${aiResult?.response ? JSON.stringify(aiResult.response, null, 2) : 'AI 분석 없음'}

---
본 파일은 2nd-Brain-Auto 하이브리드 시스템에 의해 자동 생성되었습니다.
`;
  }

  /**
   * 메타데이터 생성 함수들
   */
  generateObsidianMetadata(meceCategory, aiResult) {
    return {
      meceCategory,
      aiProcessed: true,
      provider: aiResult?.provider || 'unknown',
      confidence: aiResult?.confidence || 0,
      processingType: aiResult?.processingType || 'unknown',
      tags: this.generateTags(meceCategory, aiResult)
    };
  }

  generateNotionProperties(meceCategory, aiResult) {
    return {
      'MECE Category': { select: { name: meceCategory } },
      'AI Processed': { checkbox: true },
      'Provider': { rich_text: [{ text: { content: aiResult?.provider || 'unknown' } }] },
      'Confidence': { number: aiResult?.confidence || 0 },
      'Processing Type': { select: { name: aiResult?.processingType || 'unknown' } }
    };
  }

  generateLocalPCMetadata(meceCategory, aiResult) {
    return {
      meceCategory,
      aiProcessed: true,
      provider: aiResult?.provider || 'unknown',
      confidence: aiResult?.confidence || 0
    };
  }

  /**
   * 유틸리티 함수들
   */
  extractTitle(content, aiResult) {
    if (aiResult?.response?.title) return aiResult.response.title;
    if (aiResult?.title) return aiResult.title;
    
    // 첫 문장에서 제목 추출
    const firstSentence = content.split(/[.!?]|。/)[0];
    return firstSentence.substring(0, 50).trim();
  }

  getMECECategoryShort(category) {
    const mapping = {
      '업무-핵심': '핵심업무',
      '업무-지원': '지원업무',
      '개인-필수': '개인필수',
      '개인-선택': '개인선택',
      '학습-업무': '업무학습',
      '학습-교양': '교양학습'
    };
    return mapping[category] || '기타';
  }

  generateTags(meceCategory, aiResult) {
    const tags = [
      meceCategory.replace('-', '_'),
      'ai_processed',
      'mece_compliant'
    ];
    
    if (aiResult?.provider) {
      tags.push(`provider_${aiResult.provider}`);
    }
    
    return tags;
  }

  formatActionItems(aiResponse) {
    if (!aiResponse) return '- [ ] 액션 아이템 없음';
    
    const items = [];
    if (aiResponse.action_items) items.push(...aiResponse.action_items);
    if (aiResponse.next_actions) items.push(...aiResponse.next_actions);
    if (aiResponse.next_steps) items.push(...aiResponse.next_steps);
    
    if (items.length === 0) return '- [ ] 액션 아이템 없음';
    
    return items.map(item => `- [ ] ${item}`).join('\n');
  }

  selectNotionDatabase(meceCategory) {
    const databaseMapping = {
      '업무-핵심': 'Projects',
      '업무-지원': 'Areas',
      '개인-필수': 'Areas',
      '개인-선택': 'Areas',
      '학습-업무': 'Resources',
      '학습-교양': 'Resources'
    };
    
    return databaseMapping[meceCategory] || 'Areas';
  }

  /**
   * 동기화 상태 조회
   */
  getSyncStatus() {
    return {
      ...this.syncStatus,
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      totalMappings: this.syncMappings.size,
      connectors: Object.keys(this.connectors).map(name => ({
        name,
        available: !!this.connectors[name],
        lastSync: this.connectors[name]?.lastSync || null
      }))
    };
  }

  /**
   * 동기화 히스토리 조회
   */
  getSyncHistory(limit = 50) {
    const mappings = Array.from(this.syncMappings.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return mappings.map(mapping => ({
      syncId: mapping.syncId,
      timestamp: mapping.timestamp,
      status: mapping.status,
      meceCategory: mapping.meceCategory,
      platforms: Object.keys(mapping.platforms),
      errors: mapping.errors.length
    }));
  }
}

module.exports = SyncManager;
