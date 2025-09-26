# 2nd-Brain-Auto (Ver. ENG) 🧠

AI-powered knowledge management system integrating Obsidian and n8n with P.A.R.A methodology-based second brain system for enhanced productivity and intelligent content organization.

## 🌟 Key Features

### 🤖 AI-Powered Automation

- **P.A.R.A Classification**: AI automatically classifies content into Projects, Areas, Resources, Archives
- **Smart Tagging**: Automatic content tagging with AI-generated intelligent tags
- **Content Analysis**: Sentiment analysis, complexity assessment, core concept extraction
- **Multi-AI Providers**: Claude, OpenAI, Perplexity support

### 🔄 Hybrid System

- **MECE Principle**: Mutually Exclusive and Collectively Exhaustive classification system
- **Smart Routing**: Automatic processing path determination based on input type
- **Real-time Sync**: Real-time synchronization with Obsidian, Notion, and other platforms

### 📊 Advanced Features

- **Performance Monitoring**: Real-time system status and performance monitoring
- **Backup & Restore**: Automatic backup and data recovery system
- **Analytics Dashboard**: Usage patterns and productivity analysis

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/cheska1025/2nd-Brain-Auto-ENG.git
cd 2nd-Brain-Auto-ENG
```

### 2. Environment Setup

```bash
# Create environment variables file
cp env.example .env

# Edit environment variables (API key setup)
nano .env
```

### 3. Install Dependencies

```bash
# Node.js dependencies
npm install

# Python dependencies
cd ai-service
pip install -r requirements.txt
cd ..
```

### 4. Start System

```bash
# Development environment
npm run dev

# Production environment
npm run prod
```

## 📁 Project Structure

```text
2nd-Brain-Auto (Ver. ENG)/
├── ai-service/                 # AI Service (Python)
│   ├── main.py                # FastAPI main application
│   ├── database.py            # Database management
│   ├── db_utils.py            # Database utilities
│   └── requirements.txt       # Python dependencies
├── hybrid-system/             # Hybrid System (Node.js)
│   ├── main.js               # Main application
│   ├── core/                 # Core modules
│   │   ├── mece-classifier.js
│   │   ├── ai-hub.js
│   │   └── sync-manager.js
│   └── interfaces/           # User interfaces
├── scripts/                   # Utility scripts
│   ├── health-check.js       # System status check
│   ├── backup-system.js      # Backup system
│   └── obsidian-analyzer.js  # Obsidian analysis
├── templates/                 # AI-enhanced templates
├── docker-compose.yml        # Docker configuration
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# AI Service Settings
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
PERPLEXITY_API_KEY=your_perplexity_key

# Database Settings
DATABASE_URL=postgresql://user:password@localhost:5432/n8n
REDIS_URL=redis://localhost:6379

# Obsidian Settings
OBSIDIAN_VAULT_PATH=/path/to/your/vault

# n8n Settings
N8N_URL=http://localhost:5678
```

### AI Service Setup

```bash
cd ai-service
python main.py
```

### Hybrid System Setup

```bash
cd hybrid-system
npm start
```

## 📊 Usage

### 1. Web Dashboard

- Access `http://localhost:3000` in your browser
- View real-time system status and analytics data

### 2. API Usage

```bash
# Content classification
curl -X POST http://localhost:8000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"content": "Project planning document creation", "context": {}}'

# Smart tagging
curl -X POST http://localhost:8000/api/tag \
  -H "Content-Type: application/json" \
  -d '{"content": "Machine learning basics study", "title": "ML Guide"}'
```

### 3. n8n Workflows

- Access n8n interface at `http://localhost:5678`
- Configure and manage automation workflows

## 🧪 Testing

### Simple Test

```bash
node test-simple.js
```

### Full Test Suite

```bash
# Windows
test-scripts.bat

# Linux/macOS
./test-scripts.sh
```

### Health Check

```bash
node scripts/health-check.js
```

## 📈 Performance Optimization

### 1. AI Model Optimization

```bash
node scripts/optimize-ai-models.js
```

### 2. Database Optimization

```bash
# PostgreSQL tuning
node scripts/database-optimize.js
```

### 3. Caching Setup

- Enable Redis caching
- AI response caching
- Classification result caching

## 🔒 Security

### 1. API Key Security

- Use environment variables
- Add `.env` file to `.gitignore`
- API key rotation

### 2. Data Security

- Database encryption
- Backup encryption
- Access permission management

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Error**: Check if Redis server is running
2. **PostgreSQL Connection Error**: Check database server status
3. **AI API Error**: Verify API key validity and quota

### Log Checking

```bash
# All logs
npm run logs

# Specific service logs
npm run logs:api
npm run logs:n8n
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Obsidian](https://obsidian.md/) - Note-taking app
- [n8n](https://n8n.io/) - Workflow automation
- [P.A.R.A](https://fortelabs.co/blog/para/) - Productivity methodology
- [MECE](https://en.wikipedia.org/wiki/MECE_principle) - Analysis framework

## 📞 Support

- Issue Reports: [GitHub Issues](https://github.com/cheska1025/2nd-Brain-Auto-ENG/issues)
- Documentation: [Wiki](https://github.com/cheska1025/2nd-Brain-Auto-ENG/wiki)
- Email: [cheska1025@github.com](mailto:cheska1025@github.com)

---

**2nd-Brain-Auto (Ver. ENG)** - Experience the new dimension of AI-enhanced knowledge management! 🚀
