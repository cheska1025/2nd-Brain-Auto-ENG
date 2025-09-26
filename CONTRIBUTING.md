# 🤝 Contributing to 2nd-Brain-Auto (Ver. ENG)

Thank you for your interest in contributing to the AI-enhanced second brain system! This document provides guidelines and information for contributors.

## 📋 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contributing Guidelines](#contributing-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Issue Reporting](#issue-reporting)
7. [Development Areas](#development-areas)
8. [Testing Guidelines](#testing-guidelines)

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. By participating, you agree to uphold this code.

### Our Pledge
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Python 3.8+ and pip
- Git
- Basic knowledge of:
  - JavaScript/TypeScript
  - Python
  - n8n workflows
  - Obsidian
  - AI/ML concepts

### Quick Start
```bash
# Fork and clone the repository
git clone https://github.com/your-username/2nd-Brain-Auto-ENG.git
cd 2nd-Brain-Auto-ENG

# Install dependencies
npm install
npm run install:ai

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Start development environment
npm run start:dev
```

---

## 🔧 Development Setup

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/2nd-Brain-Auto-ENG.git
cd 2nd-Brain-Auto-ENG

# Add upstream remote
git remote add upstream https://github.com/cheska1025/2nd-Brain-Auto-ENG.git
```

### 2. Create Development Branch
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
# Copy environment template
cp env.example .env

# Edit configuration
nano .env  # or your preferred editor
```

### 5. Run Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:workflows
npm run test:ai
```

---

## 📝 Contributing Guidelines

### Types of Contributions
- **Bug Fixes**: Fix issues and improve stability
- **Features**: Add new functionality
- **Documentation**: Improve guides and documentation
- **AI Models**: Enhance AI classification and tagging
- **Workflows**: Improve n8n automation workflows
- **Templates**: Create new Obsidian templates
- **Testing**: Add tests and improve coverage

### Code Style Guidelines

#### JavaScript/TypeScript
- Use ESLint configuration provided
- Follow Prettier formatting
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Use async/await over callbacks

#### Python
- Follow PEP 8 style guide
- Use type hints where appropriate
- Add docstrings for functions and classes
- Use meaningful variable names
- Follow the existing code structure

#### Markdown
- Use clear headings and structure
- Include code examples where helpful
- Use proper markdown syntax
- Keep lines under 100 characters

### Commit Message Guidelines
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ai): add smart tagging for content analysis
fix(n8n): resolve workflow timeout issues
docs(readme): update installation instructions
test(ai): add unit tests for classification service
```

---

## 🔄 Pull Request Process

### Before Submitting
1. **Test your changes thoroughly**
   ```bash
   npm test
   npm run lint
   npm run format
   ```

2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Ensure all tests pass**
5. **Update CHANGELOG.md** if applicable

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** from at least one maintainer
5. **Merge** after approval

---

## 🐛 Issue Reporting

### Before Creating an Issue
1. Check existing issues
2. Search closed issues
3. Verify it's not a configuration issue
4. Gather relevant information

### Issue Template
```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Node.js version: [e.g., 18.17.0]
- Python version: [e.g., 3.9.7]
- n8n version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

---

## 🛠️ Development Areas

### High Priority
- **AI Classification Accuracy**: Improve classification algorithms
- **Performance Optimization**: Speed up AI processing
- **Error Handling**: Better error messages and recovery
- **Documentation**: Improve user guides and API docs
- **Testing**: Increase test coverage

### Medium Priority
- **New AI Features**: Additional AI capabilities
- **Integration**: More external service integrations
- **UI/UX**: Improve user interfaces
- **Mobile Support**: Mobile-friendly features
- **Accessibility**: Improve accessibility

### Low Priority
- **Advanced Analytics**: Detailed usage analytics
- **Custom Models**: User-specific AI model training
- **Enterprise Features**: Advanced enterprise capabilities
- **Multi-language**: Support for more languages
- **Advanced Workflows**: Complex workflow patterns

---

## 🧪 Testing Guidelines

### Test Types
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test workflow integration
3. **End-to-End Tests**: Test complete user workflows
4. **Performance Tests**: Test system performance
5. **AI Tests**: Test AI classification and tagging

### Running Tests
```bash
# All tests
npm test

# Specific test suites
npm run test:workflows
npm run test:ai
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests
- **Test naming**: Use descriptive test names
- **Test structure**: Arrange, Act, Assert pattern
- **Test data**: Use realistic test data
- **Mocking**: Mock external dependencies
- **Cleanup**: Clean up after tests

---

## 📚 Resources

### Documentation
- [n8n Documentation](https://docs.n8n.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Obsidian Plugin Development](https://docs.obsidian.md/Plugins/Getting+Started)
- [P.A.R.A Methodology](https://fortelabs.co/blog/para/)

### Development Tools
- **Code Editor**: VS Code with recommended extensions
- **API Testing**: Postman or Insomnia
- **Database**: SQLite for development
- **Version Control**: Git with GitHub

### Community
- [GitHub Discussions](https://github.com/cheska1025/2nd-Brain-Auto-ENG/discussions)
- [Discord Community](https://discord.gg/your-discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/2nd-brain-auto)

---

## 🎯 Getting Help

### Questions and Support
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat and support
- **Email**: For private or sensitive issues

### Mentorship
- New contributors can request mentorship
- Experienced contributors can volunteer as mentors
- Pair programming sessions available
- Code review assistance provided

---

## 🏆 Recognition

### Contributors
- All contributors are recognized in the README
- Significant contributions get special recognition
- Contributors can add themselves to the contributors list

### Contribution Levels
- **Bronze**: 1-5 contributions
- **Silver**: 6-15 contributions  
- **Gold**: 16-30 contributions
- **Platinum**: 30+ contributions

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for contributing to 2nd-Brain-Auto (Ver. ENG)! Together, we're building the future of AI-powered knowledge management. 🚀**
