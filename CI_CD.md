# CI/CD Pipelines

RackOps uses GitHub Actions to automate testing, code quality checks, and security audits on every push and pull request.

## Workflows

### 1. **Tests** (`.github/workflows/test.yml`)

Runs on: `push` to main/develop, `pull_request` to main/develop

**Jobs:**

#### Backend Tests
- Runs Jest test suite with coverage
- Uploads coverage reports to Codecov
- Node.js 20+ (LTS) on Ubuntu

```bash
npm run test -- --coverage
```

**Tests:**
- Collision detection logic (7 tests)
- API endpoint validation (5 tests)
- Total: 13 tests

#### Frontend Tests
- Runs Vitest test suite with coverage
- Uploads coverage reports to Codecov
- React/jsdom environment

```bash
npm run test -- --coverage
```

**Tests:**
- RackVisualizer component rendering
- Device display and interaction
- Total: 3 tests

#### Build Check
- Verifies backend syntax (Node.js parse check)
- Builds frontend bundle (Vite build)
- Checks for import/export errors

### 2. **Code Quality** (`.github/workflows/quality.yml`)

Runs on: `push` to main/develop, `pull_request` to main/develop

**Jobs:**

#### Lint & Format Check
- Validates package.json integrity
- Checks dependency trees
- Warnings only (non-blocking)

#### Security Audit
- Runs `npm audit` on both backend and frontend
- Reports moderate and higher vulnerabilities
- Non-blocking (audit failures don't prevent merge)

## Running Locally

### Run All Tests
```bash
# Backend
cd server
npm run test

# Frontend
cd client
npm run test
```

### Run Tests with Watch Mode
```bash
# Backend
cd server
npm run test:watch

# Frontend
cd client
npm run test -- --watch
```

### Run Tests with Coverage
```bash
# Backend
cd server
npm run test:coverage

# Frontend
cd client
npm run test:coverage
```

### Build Frontend
```bash
cd client
npm run build
```

## Codecov Integration

Coverage reports are automatically uploaded to [Codecov](https://codecov.io/gh/PERRETJonatan/RackOps) for:
- Badge display in README
- Historical trend tracking
- Per-line coverage analysis

## GitHub Status Checks

Pull requests must pass all status checks before merging:

- ✅ **backend-tests** - All Jest tests pass
- ✅ **frontend-tests** - All Vitest tests pass
- ✅ **build-check** - Build succeeds without errors
- ⚠️ **lint** - Code quality (warnings only)
- ⚠️ **security** - Audit report (informational)

## Future Enhancements

- [ ] E2E tests with Cypress/Playwright
- [ ] ESLint/Prettier enforcement
- [ ] Pre-commit hooks (Husky)
- [ ] Automated dependency updates (Dependabot)
- [ ] Staging environment deployment
- [ ] Release automation (semantic-release)

## Troubleshooting

### Tests fail locally but pass in CI

**Common causes:**
- Platform differences (Windows vs Linux line endings)
- Node.js version mismatch (use 20.x LTS)
- Missing dependencies (run `npm ci`)
- Test environment issues (background processes)

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Match CI environment
nvm use 20
npm run test
```

### Coverage reports not uploading

- Check Codecov token in Settings → Secrets
- Verify workflow has permissions: `contents: read`
- Check for `CODECOV_TOKEN` in fork settings (if applicable)

### Build check fails

**Backend:**
```bash
cd server
node -c src/index.js  # Check syntax
```

**Frontend:**
```bash
cd client
npm run build         # Full build check
```

## Security

- All workflows run on GitHub-hosted runners (ubuntu-latest)
- No secrets are exposed in workflow logs
- Codecov uses token-based uploads
- Dependency audits use public npm registry
