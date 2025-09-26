// local-ai-provider.js
// 로컬 AI 제공자 (Ollama, Local LLM)

const axios = require('axios');

class LocalAIProvider {
  constructor(config) {
    this.endpoint = config.endpoint || 'http://localhost:11434';
    this.model = config.model || 'llama2';
    this.timeout = config.timeout || 30000;
  }

  async classifyContent(content, context = {}) {
    const prompt = this.buildClassificationPrompt(content, context);
    
    try {
      const response = await axios.post(`${this.endpoint}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      }, {
        timeout: this.timeout
      });
      
      const result = this.parseClassificationResult(response.data.response);
      return {
        ...result,
        provider: 'local',
        model: this.model
      };
      
    } catch (error) {
      console.error('로컬 AI 분류 실패:', error.message);
      throw new Error(`로컬 AI 분류 실패: ${error.message}`);
    }
  }

  async summarizeContent(content, context = {}) {
    const prompt = this.buildSummarizationPrompt(content, context);
    
    try {
      const response = await axios.post(`${this.endpoint}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          top_p: 0.8,
          max_tokens: 300
        }
      }, {
        timeout: this.timeout
      });
      
      return {
        summary: response.data.response.trim(),
        provider: 'local',
        model: this.model
      };
      
    } catch (error) {
      console.error('로컬 AI 요약 실패:', error.message);
      throw new Error(`로컬 AI 요약 실패: ${error.message}`);
    }
  }

  async enhanceContent(content, context = {}) {
    const prompt = this.buildEnhancementPrompt(content, context);
    
    try {
      const response = await axios.post(`${this.endpoint}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.6,
          top_p: 0.85,
          max_tokens: 1000
        }
      }, {
        timeout: this.timeout
      });
      
      return {
        enhanced: response.data.response.trim(),
        provider: 'local',
        model: this.model
      };
      
    } catch (error) {
      console.error('로컬 AI 개선 실패:', error.message);
      throw new Error(`로컬 AI 개선 실패: ${error.message}`);
    }
  }

  async generateContent(content, context = {}) {
    const prompt = this.buildGenerationPrompt(content, context);
    
    try {
      const response = await axios.post(`${this.endpoint}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 1500
        }
      }, {
        timeout: this.timeout
      });
      
      return {
        generated: response.data.response.trim(),
        provider: 'local',
        model: this.model
      };
      
    } catch (error) {
      console.error('로컬 AI 생성 실패:', error.message);
      throw new Error(`로컬 AI 생성 실패: ${error.message}`);
    }
  }

  async processGeneral(content, context = {}) {
    // 일반적인 처리 - 분류를 기본으로 사용
    return await this.classifyContent(content, context);
  }

  buildClassificationPrompt(content, context) {
    return `
다음 내용을 P.A.R.A 방법론에 따라 분류해주세요:

내용: ${content.substring(0, 2000)}

분류 기준:
- Projects: 마감일이 있고 완료 가능한 작업
- Areas: 지속적인 관리가 필요한 영역  
- Resources: 나중에 참고할 자료
- Archives: 완료되었거나 더 이상 필요없는 내용

응답 형식 (JSON):
{
  "category": "01-Projects|02-Areas|03-Resources|04-Archives",
  "confidence": 0.0-1.0,
  "reason": "분류 이유",
  "suggestedTags": ["태그1", "태그2"],
  "priority": "low|medium|high"
}
`;
  }

  buildSummarizationPrompt(content, context) {
    return `
다음 내용을 요약해주세요:

내용: ${content}

요구사항:
- 핵심 내용을 3-5문장으로 요약
- 중요한 키워드 포함
- 한국어로 작성

요약:
`;
  }

  buildEnhancementPrompt(content, context) {
    return `
다음 내용을 개선하고 확장해주세요:

내용: ${content}

개선 방향:
- 구조화된 형식으로 정리
- 누락된 정보 보완
- 가독성 향상
- 관련 키워드 추가

개선된 내용:
`;
  }

  buildGenerationPrompt(content, context) {
    return `
다음 내용을 바탕으로 새로운 내용을 생성해주세요:

기존 내용: ${content}

생성 요구사항:
- 기존 내용과 연관성 유지
- 실용적이고 구체적인 내용
- 체계적인 구조

생성된 내용:
`;
  }

  parseClassificationResult(response) {
    try {
      // JSON 응답 파싱 시도
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || '02-Areas',
          confidence: parsed.confidence || 0.5,
          reason: parsed.reason || '로컬 AI 분류',
          suggestedTags: parsed.suggestedTags || [],
          priority: parsed.priority || 'medium'
        };
      }
    } catch (error) {
      console.warn('JSON 파싱 실패, 텍스트 분석으로 전환');
    }

    // JSON 파싱 실패 시 텍스트 분석
    return this.parseTextResponse(response);
  }

  parseTextResponse(response) {
    const lowerResponse = response.toLowerCase();
    
    let category = '02-Areas';
    let confidence = 0.5;
    let priority = 'medium';
    
    // 카테고리 추출
    if (lowerResponse.includes('project') || lowerResponse.includes('프로젝트')) {
      category = '01-Projects';
      confidence = 0.7;
    } else if (lowerResponse.includes('resource') || lowerResponse.includes('자원')) {
      category = '03-Resources';
      confidence = 0.7;
    } else if (lowerResponse.includes('archive') || lowerResponse.includes('아카이브')) {
      category = '04-Archives';
      confidence = 0.7;
    }
    
    // 우선순위 추출
    if (lowerResponse.includes('high') || lowerResponse.includes('높음') || lowerResponse.includes('urgent')) {
      priority = 'high';
    } else if (lowerResponse.includes('low') || lowerResponse.includes('낮음')) {
      priority = 'low';
    }
    
    return {
      category,
      confidence,
      reason: '텍스트 분석 기반 분류',
      suggestedTags: this.extractTagsFromResponse(response),
      priority
    };
  }

  extractTagsFromResponse(response) {
    const tagRegex = /#([a-zA-Z0-9가-힣_-]+)/g;
    const matches = response.match(tagRegex) || [];
    return matches.map(tag => tag.substring(1));
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.endpoint}/api/tags`, {
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        models: response.data.models || [],
        available: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        available: false
      };
    }
  }

  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.endpoint}/api/tags`, {
        timeout: 5000
      });
      
      return response.data.models || [];
    } catch (error) {
      console.error('모델 목록 조회 실패:', error.message);
      return [];
    }
  }

  async pullModel(modelName) {
    try {
      const response = await axios.post(`${this.endpoint}/api/pull`, {
        name: modelName,
        stream: false
      }, {
        timeout: 300000 // 5분 타임아웃
      });
      
      return {
        success: true,
        model: modelName,
        message: '모델 다운로드 완료'
      };
    } catch (error) {
      console.error('모델 다운로드 실패:', error.message);
      return {
        success: false,
        model: modelName,
        error: error.message
      };
    }
  }
}

module.exports = LocalAIProvider;
