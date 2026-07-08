# Contributing to MediFlow AI

Thank you for your interest in contributing to MediFlow AI! We welcome contributions from the community to help make healthcare management more accessible and efficient.

## 📋 Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inspiring community for all.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- Git
- MongoDB Atlas account
- Familiarity with Next.js, React, and TypeScript

### Development Setup

1. **Fork the Repository**
```bash
# Click the 'Fork' button on GitHub
```

2. **Clone Your Fork**
```bash
git clone https://github.com/YOUR_USERNAME/mediflow-ai.git
cd mediflow-ai
```

3. **Add Upstream Remote**
```bash
git remote add upstream https://github.com/Nitesh-5652/mediflow-ai.git
```

4. **Install Dependencies**
```bash
npm install
```

5. **Create Environment File**
```bash
cp .env.local.example .env.local
# Add your credentials
```

6. **Start Development Server**
```bash
npm run dev
```

---

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch with descriptive name
git checkout -b feature/add-patient-notifications
# or for bugs
git checkout -b fix/appointment-scheduling-bug
# or for documentation
git checkout -b docs/api-documentation
```

### 2. Make Your Changes

#### Code Standards
- **TypeScript**: Use strict mode, define all types
- **Formatting**: Use Prettier (runs automatically on save)
- **Linting**: Follow ESLint rules
- **Testing**: Write tests for new features

```bash
# Format code
npm run format

# Run linter
npm run lint

# Run tests
npm run test
```

#### File Structure
```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable React components
├── lib/                 # Utility functions
├── models/              # MongoDB schemas
├── api/                 # API routes
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
└── middleware/          # Authentication middleware
```

#### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Build/dependency updates

**Examples:**
```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(appointments): resolve scheduling conflict detection"
git commit -m "docs(api): add endpoint documentation"
git commit -m "refactor(patient): optimize database queries"
```

### 3. Keep Your Branch Updated
```bash
# Fetch latest changes
git fetch upstream

# Rebase on main
git rebase upstream/main
```

### 4. Push Your Changes
```bash
git push origin feature/add-patient-notifications
```

### 5. Create Pull Request

**PR Title Format:**
```
[TYPE] Description - Issue #123
```

**Example:**
```
[FEAT] Add two-factor authentication - Issue #45
[FIX] Fix appointment scheduling conflict - Issue #67
[DOCS] Update API documentation - Issue #89
```

---

## 📝 Pull Request Template

```markdown
## Description
Brief description of your changes.

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added
- [ ] Manual testing done
- [ ] No breaking changes

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No console errors
```

---

## 🧪 Testing Guidelines

### Unit Tests
```bash
npm run test
npm run test:watch
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
# Target: >80% coverage
```

### Writing Tests
```typescript
// Example test file: src/lib/auth.test.ts
import { validateEmail } from '../auth';

describe('Auth Utilities', () => {
  test('should validate correct email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

---

## 📚 Documentation Standards

### Code Comments
```typescript
// Good: Explain WHY, not WHAT
// We use soft delete to maintain referential integrity
// and enable audit trail functionality
if (patient.deletedAt === null) {
  // ...
}

// Bad: Obvious comment
// Set deleted to true
const deleted = true;
```

### Function Documentation
```typescript
/**
 * Generates AI health summary for patient
 * @param patientId - MongoDB ObjectId of the patient
 * @param symptoms - Array of reported symptoms
 * @returns Promise containing summary and recommendations
 * @throws {ValidationError} If patientId is invalid
 */
export async function generateHealthSummary(
  patientId: string,
  symptoms: string[]
): Promise<HealthSummary> {
  // Implementation
}
```

### README Sections for Features
- Problem solved
- How to use
- Configuration options
- Examples
- Related features

---

## 🐛 Bug Reports

### Before Reporting
1. Check existing [Issues](https://github.com/Nitesh-5652/mediflow-ai/issues)
2. Check [Discussions](https://github.com/Nitesh-5652/mediflow-ai/discussions)
3. Update to latest version

### Bug Report Format
```markdown
## Description
Clear description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Node.js version: X.X.X
- MediFlow AI version: X.X.X

## Screenshots
<!-- Attach screenshots if applicable -->

## Error Logs
<!-- Attach error logs or stack traces -->
```

---

## ✨ Feature Requests

### Before Requesting
1. Check existing [Issues](https://github.com/Nitesh-5652/mediflow-ai/issues)
2. Check [Discussions](https://github.com/Nitesh-5652/mediflow-ai/discussions)
3. Consider if it aligns with project goals

### Feature Request Format
```markdown
## Description
Clear description of the requested feature.

## Problem It Solves
Explain the problem or use case.

## Proposed Solution
How you imagine the feature working.

## Alternatives Considered
Other approaches or features that could solve this.

## Examples
Real-world examples of usage.
```

---

## 📦 Dependency Management

### Adding Dependencies
```bash
npm install package-name
```

### Guidelines
- ✅ Use packages from npm only
- ✅ Check license compatibility
- ✅ Prefer maintained packages
- ✅ Update security patches promptly
- ❌ Avoid duplicate packages
- ❌ Avoid packages with many vulnerabilities

### Updating Dependencies
```bash
npm update
npm audit fix
```

---

## 🔒 Security Guidelines

### Sensitive Information
- ❌ Never commit `.env.local` or secrets
- ✅ Use environment variables
- ✅ Update `.gitignore` for sensitive files

### Code Security
```typescript
// ✅ Good: Validate and sanitize
const email = validateEmail(userInput);

// ✅ Good: Use parameterized queries
const user = await User.findById(userId);

// ❌ Bad: No validation
const query = `SELECT * FROM users WHERE id = ${id}`;

// ❌ Bad: Store secrets in code
const apiKey = "sk_live_XXXXX";
```

### Reporting Security Issues
⚠️ **DO NOT** open public issues for security vulnerabilities.
Email: security@mediflow-ai.dev

---

## 🚢 Release Process

### Version Numbering
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features (v1.1.0)
- **PATCH**: Bug fixes (v1.0.1)

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Commit tagged with version
- [ ] Release notes prepared

---

## 💡 Best Practices

### Code Quality
- ✅ Write small, focused commits
- ✅ Keep functions small and single-purpose
- ✅ Use meaningful variable names
- ✅ Add error handling
- ✅ Write tests for critical features

### Performance
- ✅ Optimize database queries
- ✅ Use indexes for frequently queried fields
- ✅ Implement caching strategies
- ✅ Monitor API response times
- ✅ Profile before optimizing

### Accessibility
- ✅ Use semantic HTML
- ✅ Add ARIA labels
- ✅ Test with screen readers
- ✅ Ensure keyboard navigation
- ✅ Maintain color contrast

---

## 🤝 Community

### Communication
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Pull Requests**: Code contributions

### Getting Help
1. Check documentation
2. Search existing issues/discussions
3. Create a new discussion
4. Ask community for help

### Recognition
Contributors are recognized in:
- `CONTRIBUTORS.md`
- GitHub repository contributors page
- Release notes

---

## 📋 Checklist Before Submitting PR

- [ ] Fork and clone the repository
- [ ] Create feature branch
- [ ] Made focused changes
- [ ] Tested changes locally
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] Followed code standards
- [ ] Commit messages follow convention
- [ ] No console errors/warnings
- [ ] Rebased on latest main
- [ ] Push to fork and create PR
- [ ] PR description is clear
- [ ] PR links to related issue

---

## 📞 Questions?

- 💬 Open a [Discussion](https://github.com/Nitesh-5652/mediflow-ai/discussions)
- 🐛 Check [Issues](https://github.com/Nitesh-5652/mediflow-ai/issues)
- 📖 Read [Documentation](https://github.com/Nitesh-5652/mediflow-ai#readme)

---

## 🙏 Thank You!

Your contributions make MediFlow AI better. We appreciate your effort in improving healthcare management for everyone!

**Happy coding!** 🚀
