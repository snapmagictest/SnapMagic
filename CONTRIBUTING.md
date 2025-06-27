# Contributing to SnapMagic

Thank you for your interest in contributing to SnapMagic! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or request features
- Provide detailed information including:
  - Steps to reproduce the issue
  - Expected vs actual behavior
  - Environment details (AWS region, browser, etc.)
  - Error messages or logs

### Submitting Changes
1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/SnapMagic.git
   cd SnapMagic
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Test backend changes
   cd backend && python -m pytest

   # Test infrastructure changes
   cd infrastructure && cdk synth

   # Test frontend changes
   cd frontend && npm test
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

## 📋 Development Guidelines

### Code Standards
- **Python**: Follow PEP 8 style guide
- **JavaScript**: Use ES6+ features, consistent formatting
- **Infrastructure**: Use CDK best practices
- **Documentation**: Update README and docs for any changes

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(backend): add video generation endpoint`
- `fix(frontend): resolve mobile responsive issues`
- `docs(readme): update deployment instructions`

### Testing Requirements
- All new features must include tests
- Maintain minimum 80% code coverage
- Test both success and error scenarios
- Include integration tests for AWS services

## 🏗️ Development Setup

### Prerequisites
- AWS CLI configured with development account
- Python 3.9+, Node.js 18+
- AWS CDK v2 installed globally
- Docker (for local testing)

### Local Development
```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Frontend development
cd frontend
npm install
npm run dev

# Infrastructure development
cd infrastructure
pip install -r requirements.txt
cdk synth
```

### Environment Variables
Create `.env` file in project root:
```bash
AWS_REGION=us-east-1
JWT_SECRET=your-development-secret
BEDROCK_REGION=us-east-1
S3_BUCKET=snapmagic-dev-bucket
```

## 🧪 Testing

### Running Tests
```bash
# Backend unit tests
cd backend && python -m pytest tests/

# Frontend tests
cd frontend && npm test

# Infrastructure tests
cd infrastructure && python -m pytest tests/

# Integration tests
npm run test:integration
```

### Test Coverage
- Maintain minimum 80% code coverage
- Include both unit and integration tests
- Test error handling and edge cases
- Mock AWS services in unit tests

## 📚 Documentation

### Required Documentation Updates
- Update README.md for new features
- Add inline code comments
- Update API documentation
- Include configuration examples

### Documentation Standards
- Use clear, concise language
- Include code examples
- Provide troubleshooting guidance
- Keep documentation up-to-date with code changes

## 🔒 Security Guidelines

### Security Best Practices
- Never commit secrets or API keys
- Use environment variables for configuration
- Implement proper input validation
- Follow AWS security best practices
- Report security issues privately

### Reporting Security Issues
Email security issues to: [security@snapmagic.dev](mailto:security@snapmagic.dev)
- Do not create public GitHub issues for security vulnerabilities
- Provide detailed information about the vulnerability
- Allow reasonable time for response before public disclosure

## 🎯 Feature Requests

### Before Submitting
- Check existing issues and discussions
- Consider if the feature aligns with project goals
- Think about implementation complexity
- Consider impact on existing users

### Feature Request Template
```markdown
## Feature Description
Brief description of the proposed feature

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any other relevant information
```

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers bumped
- [ ] Security review completed
- [ ] Performance impact assessed

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: General questions and discussions
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time community chat (link in README)

### Maintainer Contact
- **Email**: [maintainers@snapmagic.dev](mailto:maintainers@snapmagic.dev)
- **Response Time**: We aim to respond within 48 hours

## 🏆 Recognition

### Contributors
All contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor appreciation post

### Contribution Types
We recognize various types of contributions:
- Code contributions
- Documentation improvements
- Bug reports and testing
- Community support
- Design and UX feedback

## 📄 Legal

### Contributor License Agreement
By contributing to SnapMagic, you agree that:
- Your contributions are your original work
- You grant the project maintainers license to use your contributions
- Your contributions are provided under the MIT License
- You have the right to make the contribution

### Code of Conduct
This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

Thank you for contributing to SnapMagic! Together, we're building the future of AI-powered event engagement. 🎴✨
