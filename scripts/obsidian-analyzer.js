// obsidian-analyzer.js
// Obsidian 볼트 완전 분석 및 PARA 구조 매핑 시스템

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const chokidar = require('chokidar');

class ObsidianAnalyzer {
  constructor(vaultPath) {
    this.vaultPath = vaultPath;
    this.analysis = {
      totalNotes: 0,
      folders: {},
      tags: {},
      links: {},
      frontmatter: {},
      orphanNotes: [],
      paraMapping: {
        projects: [],
        areas: [],
        resources: [],
        archives: []
      },
      statistics: {
        avgNoteLength: 0,
        mostUsedTags: [],
        linkDensity: 0,
        frontmatterUsage: 0
      }
    };
    this.startTime = Date.now();
  }

  async analyzeVault() {
    console.log('🔍 Obsidian 볼트 분석 시작...');
    console.log(`📁 분석 대상: ${this.vaultPath}`);
    
    try {
      // 1. 기본 구조 스캔
      await this.scanDirectory(this.vaultPath);
      
      // 2. PARA 매핑 생성
      await this.mapToParaStructure();
      
      // 3. 통계 계산
      await this.calculateStatistics();
      
      // 4. 고아 노트 찾기
      await this.findOrphanNotes();
      
      // 5. 리포트 생성
      await this.generateReport();
      
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      console.log(`✅ 분석 완료! (소요시간: ${duration}초)`);
      
      return this.analysis;
    } catch (error) {
      console.error('❌ 분석 실패:', error);
      throw error;
    }
  }

  async scanDirectory(dirPath, relativePath = '') {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules') {
            this.analysis.folders[relativeItemPath] = {
              noteCount: 0,
              subfolders: [],
              totalSize: 0
            };
            await this.scanDirectory(fullPath, relativeItemPath);
          }
        } else if (path.extname(item) === '.md') {
          await this.analyzeNote(fullPath, relativeItemPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ 디렉토리 스캔 실패: ${dirPath}`, error.message);
    }
  }

  async analyzeNote(filePath, relativePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = matter(content);
      const fileSize = (await fs.stat(filePath)).size;
      
      this.analysis.totalNotes++;
      
      // 폴더별 노트 카운트
      const folder = path.dirname(relativePath);
      if (this.analysis.folders[folder]) {
        this.analysis.folders[folder].noteCount++;
        this.analysis.folders[folder].totalSize += fileSize;
      }

      // 태그 추출 및 분석
      const tags = this.extractTags(content);
      tags.forEach(tag => {
        this.analysis.tags[tag] = (this.analysis.tags[tag] || 0) + 1;
      });

      // 링크 추출
      const links = this.extractLinks(content);
      this.analysis.links[relativePath] = {
        internal: links.internal,
        external: links.external,
        images: links.images,
        attachments: links.attachments
      };

      // 프론트매터 분석
      if (parsed.data && Object.keys(parsed.data).length > 0) {
        const fmKeys = Object.keys(parsed.data);
        fmKeys.forEach(key => {
          this.analysis.frontmatter[key] = (this.analysis.frontmatter[key] || 0) + 1;
        });
      }

      // 노트 메타데이터 저장
      const noteMetadata = {
        path: relativePath,
        title: this.extractTitle(content, relativePath),
        tags: tags,
        links: links,
        frontmatter: parsed.data,
        wordCount: this.countWords(content),
        lastModified: (await fs.stat(filePath)).mtime,
        size: fileSize
      };

      // PARA 카테고리 예측
      const paraCategory = this.predictParaCategory(noteMetadata);
      noteMetadata.predictedPara = paraCategory;

      // 분석 결과에 추가
      if (!this.analysis.notes) this.analysis.notes = [];
      this.analysis.notes.push(noteMetadata);

    } catch (error) {
      console.warn(`⚠️ 노트 분석 실패: ${filePath}`, error.message);
    }
  }

  extractTags(content) {
    const tagRegex = /#([a-zA-Z0-9가-힣_-]+)/g;
    const matches = content.match(tagRegex) || [];
    return matches.map(tag => tag.substring(1));
  }

  extractLinks(content) {
    const internalLinkRegex = /\[\[([^\]]+)\]\]/g;
    const externalLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    const internal = (content.match(internalLinkRegex) || []).map(link => link.slice(2, -2));
    const external = [];
    const images = [];
    const attachments = [];
    
    let match;
    while ((match = externalLinkRegex.exec(content)) !== null) {
      external.push({ text: match[1], url: match[2] });
    }
    
    while ((match = imageRegex.exec(content)) !== null) {
      images.push({ alt: match[1], src: match[2] });
    }

    return { internal, external, images, attachments };
  }

  extractTitle(content, filePath) {
    // 첫 번째 헤딩 찾기
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    
    // 파일명에서 제목 추출
    const fileName = path.basename(filePath, '.md');
    return fileName.replace(/[-_]/g, ' ');
  }

  countWords(content) {
    const text = content.replace(/[#*`\[\]()]/g, '').replace(/\s+/g, ' ').trim();
    return text.split(' ').filter(word => word.length > 0).length;
  }

  predictParaCategory(noteMetadata) {
    const { title, tags, content, frontmatter } = noteMetadata;
    const text = `${title} ${tags.join(' ')} ${content || ''}`.toLowerCase();
    
    // 프로젝트 키워드
    const projectKeywords = [
      '프로젝트', 'project', '개발', 'development', '구현', '완료', '마감',
      'deadline', 'deliverable', 'milestone', 'launch', 'release'
    ];
    
    // 영역 키워드
    const areaKeywords = [
      '관리', 'management', '일상', '루틴', '업무', 'work', 'process',
      'routine', 'maintenance', 'ongoing', 'continuous'
    ];
    
    // 자원 키워드
    const resourceKeywords = [
      '학습', 'learning', '자료', '참고', 'reference', '가이드', 'tutorial',
      'study', 'guide', 'documentation', 'tutorial', 'how-to'
    ];
    
    // 아카이브 키워드
    const archiveKeywords = [
      '완료', 'completed', '지난', 'past', '아카이브', 'archive',
      'finished', 'done', 'historical', 'old'
    ];

    // 점수 계산
    const scores = {
      projects: this.calculateKeywordScore(text, projectKeywords),
      areas: this.calculateKeywordScore(text, areaKeywords),
      resources: this.calculateKeywordScore(text, resourceKeywords),
      archives: this.calculateKeywordScore(text, archiveKeywords)
    };

    // 가장 높은 점수의 카테고리 반환
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return '02-Areas'; // 기본값
    
    return Object.keys(scores).find(key => scores[key] === maxScore);
  }

  calculateKeywordScore(text, keywords) {
    return keywords.reduce((score, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);
  }

  async mapToParaStructure() {
    console.log('🗂️ PARA 구조 매핑 생성...');
    
    if (!this.analysis.notes) return;

    this.analysis.notes.forEach(note => {
      const category = note.predictedPara;
      if (this.analysis.paraMapping[category]) {
        this.analysis.paraMapping[category].push({
          path: note.path,
          title: note.title,
          confidence: this.calculateConfidence(note),
          tags: note.tags,
          wordCount: note.wordCount
        });
      }
    });

    // 각 카테고리별 통계 계산
    Object.keys(this.analysis.paraMapping).forEach(category => {
      const notes = this.analysis.paraMapping[category];
      this.analysis.paraMapping[category] = {
        notes: notes,
        count: notes.length,
        avgWordCount: notes.reduce((sum, note) => sum + note.wordCount, 0) / notes.length || 0,
        topTags: this.getTopTags(notes)
      };
    });
  }

  calculateConfidence(note) {
    // 간단한 신뢰도 계산 (실제로는 더 복잡한 알고리즘 사용 가능)
    const factors = {
      hasTitle: note.title ? 0.2 : 0,
      hasTags: note.tags.length > 0 ? 0.2 : 0,
      hasFrontmatter: Object.keys(note.frontmatter).length > 0 ? 0.2 : 0,
      hasLinks: note.links.internal.length > 0 ? 0.2 : 0,
      wordCount: Math.min(note.wordCount / 100, 0.2)
    };
    
    return Object.values(factors).reduce((sum, factor) => sum + factor, 0);
  }

  getTopTags(notes) {
    const tagCounts = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  async calculateStatistics() {
    console.log('📊 통계 계산 중...');
    
    if (!this.analysis.notes) return;

    const notes = this.analysis.notes;
    
    // 평균 노트 길이
    this.analysis.statistics.avgNoteLength = 
      notes.reduce((sum, note) => sum + note.wordCount, 0) / notes.length;

    // 가장 많이 사용된 태그
    this.analysis.statistics.mostUsedTags = Object.entries(this.analysis.tags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    // 링크 밀도
    const totalLinks = Object.values(this.analysis.links)
      .reduce((sum, links) => sum + links.internal.length + links.external.length, 0);
    this.analysis.statistics.linkDensity = totalLinks / notes.length;

    // 프론트매터 사용률
    const notesWithFrontmatter = notes.filter(note => 
      Object.keys(note.frontmatter).length > 0
    ).length;
    this.analysis.statistics.frontmatterUsage = notesWithFrontmatter / notes.length;
  }

  async findOrphanNotes() {
    console.log('🔍 고아 노트 찾는 중...');
    
    if (!this.analysis.notes) return;

    const allInternalLinks = new Set();
    Object.values(this.analysis.links).forEach(links => {
      links.internal.forEach(link => {
        // 링크를 파일 경로로 변환
        const linkPath = link.includes('.md') ? link : `${link}.md`;
        allInternalLinks.add(linkPath);
      });
    });

    this.analysis.orphanNotes = this.analysis.notes.filter(note => {
      const notePath = note.path;
      return !Array.from(allInternalLinks).some(link => 
        notePath.includes(link) || link.includes(notePath)
      );
    });
  }

  async generateReport() {
    console.log('📋 분석 리포트 생성 중...');
    
    const report = {
      summary: {
        totalNotes: this.analysis.totalNotes,
        totalFolders: Object.keys(this.analysis.folders).length,
        totalTags: Object.keys(this.analysis.tags).length,
        avgNotesPerFolder: Math.round(this.analysis.totalNotes / Object.keys(this.analysis.folders).length) || 0,
        analysisDuration: ((Date.now() - this.startTime) / 1000).toFixed(2) + 's'
      },
      paraMapping: this.analysis.paraMapping,
      statistics: this.analysis.statistics,
      topTags: this.analysis.statistics.mostUsedTags,
      folderDistribution: this.analysis.folders,
      frontmatterUsage: this.analysis.frontmatter,
      orphanNotes: this.analysis.orphanNotes.map(note => ({
        path: note.path,
        title: note.title,
        wordCount: note.wordCount
      })),
      recommendations: this.generateRecommendations()
    };

    // JSON 리포트 저장
    await fs.writeFile(
      'obsidian-analysis-report.json',
      JSON.stringify(report, null, 2)
    );

    // 마크다운 리포트 생성
    await this.generateMarkdownReport(report);

    console.log('📊 분석 완료! obsidian-analysis-report.json 파일 생성됨');
    console.log('📄 상세 리포트: obsidian-analysis-report.md 파일 생성됨');
    
    return report;
  }

  async generateMarkdownReport(report) {
    const markdown = `# Obsidian 볼트 분석 리포트

## 📊 요약 통계
- **총 노트 수**: ${report.summary.totalNotes}개
- **총 폴더 수**: ${report.summary.totalFolders}개
- **총 태그 수**: ${report.summary.totalTags}개
- **폴더당 평균 노트 수**: ${report.summary.avgNotesPerFolder}개
- **분석 소요 시간**: ${report.summary.analysisDuration}

## 🗂️ PARA 구조 매핑

### 01-Projects (프로젝트)
- **노트 수**: ${report.paraMapping.projects.count}개
- **평균 단어 수**: ${report.paraMapping.projects.avgWordCount.toFixed(0)}단어
- **주요 태그**: ${report.paraMapping.projects.topTags.slice(0, 5).map(t => t.tag).join(', ')}

### 02-Areas (영역)
- **노트 수**: ${report.paraMapping.areas.count}개
- **평균 단어 수**: ${report.paraMapping.areas.avgWordCount.toFixed(0)}단어
- **주요 태그**: ${report.paraMapping.areas.topTags.slice(0, 5).map(t => t.tag).join(', ')}

### 03-Resources (자원)
- **노트 수**: ${report.paraMapping.resources.count}개
- **평균 단어 수**: ${report.paraMapping.resources.avgWordCount.toFixed(0)}단어
- **주요 태그**: ${report.paraMapping.resources.topTags.slice(0, 5).map(t => t.tag).join(', ')}

### 04-Archives (아카이브)
- **노트 수**: ${report.paraMapping.archives.count}개
- **평균 단어 수**: ${report.paraMapping.archives.avgWordCount.toFixed(0)}단어
- **주요 태그**: ${report.paraMapping.archives.topTags.slice(0, 5).map(t => t.tag).join(', ')}

## 🏷️ 가장 많이 사용된 태그 (Top 20)
${report.topTags.map((tag, index) => `${index + 1}. **${tag.tag}** (${tag.count}회)`).join('\n')}

## 📁 폴더별 노트 분포
${Object.entries(report.folderDistribution)
  .sort(([,a], [,b]) => b.noteCount - a.noteCount)
  .map(([folder, data]) => `- **${folder}**: ${data.noteCount}개 노트`)
  .join('\n')}

## 🔗 고아 노트 (${report.orphanNotes.length}개)
${report.orphanNotes.length > 0 
  ? report.orphanNotes.map(note => `- ${note.path} (${note.wordCount}단어)`).join('\n')
  : '고아 노트가 없습니다! 🎉'
}

## 📈 통계
- **평균 노트 길이**: ${report.statistics.avgNoteLength.toFixed(0)}단어
- **링크 밀도**: ${report.statistics.linkDensity.toFixed(2)}개/노트
- **프론트매터 사용률**: ${(report.statistics.frontmatterUsage * 100).toFixed(1)}%

## 💡 개선 제안
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*이 리포트는 2nd-Brain-Auto 시스템에 의해 자동 생성되었습니다.*
`;

    await fs.writeFile('obsidian-analysis-report.md', markdown);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.analysis.orphanNotes.length > 10) {
      recommendations.push(`${this.analysis.orphanNotes.length}개의 고아 노트가 있습니다. 링크를 추가하여 연결성을 높이세요.`);
    }
    
    if (this.analysis.statistics.frontmatterUsage < 0.3) {
      recommendations.push('프론트매터 사용률이 낮습니다. 메타데이터를 추가하여 노트를 더 체계적으로 관리하세요.');
    }
    
    if (this.analysis.statistics.linkDensity < 1) {
      recommendations.push('노트 간 연결이 부족합니다. 더 많은 내부 링크를 추가하세요.');
    }
    
    const topTags = this.analysis.statistics.mostUsedTags.slice(0, 10);
    const tagVariety = topTags.length;
    if (tagVariety < 5) {
      recommendations.push('태그 다양성이 부족합니다. 더 구체적인 태그를 사용하세요.');
    }
    
    return recommendations;
  }
}

// CLI 실행 부분
async function main() {
  const vaultPath = process.argv[2];
  
  if (!vaultPath) {
    console.log(`
사용법: node scripts/obsidian-analyzer.js <vault-path>

예제:
  node scripts/obsidian-analyzer.js "C:\\Users\\username\\Documents\\Obsidian Vault"
  node scripts/obsidian-analyzer.js "/home/user/obsidian-vault"
    `);
    process.exit(1);
  }

  try {
    const analyzer = new ObsidianAnalyzer(vaultPath);
    const result = await analyzer.analyzeVault();
    
    console.log('\n🎉 분석이 완료되었습니다!');
    console.log(`📊 총 ${result.summary.totalNotes}개의 노트를 분석했습니다.`);
    console.log('📄 상세 리포트: obsidian-analysis-report.json, obsidian-analysis-report.md');
    
  } catch (error) {
    console.error('❌ 분석 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ObsidianAnalyzer;
