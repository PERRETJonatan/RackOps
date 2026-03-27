# 🧪 RackOps Testing Guide

## Overview

RackOps includes comprehensive test suites for backend and frontend:

- **Backend**: Jest for unit tests and API tests
- **Frontend**: Vitest for component tests
- **E2E**: Ready for Cypress integration (Phase 3+)

## Running Tests

### Backend Tests

```bash
cd server
npm install       # Install Jest + supertest
npm test          # Run all tests
npm run test:watch  # Watch mode (auto-rerun on changes)
npm run test:coverage  # Generate coverage report
```

### Frontend Tests

```bash
cd client
npm install       # Install Vitest + testing-library
npm test          # Run all tests
npm run test:ui   # Interactive UI mode
npm run test:coverage  # Generate coverage report
```

## Test Structure

### Backend Tests (`server/src/__tests__/`)

#### `collisionEngine.test.js`
Tests the core collision detection logic:
- Range overlap detection
- Boundary validation
- Edge cases

Example:
```javascript
// Device A: U1-U2, Device B: U2-U3 (touching edge)
expect(rangesOverlap(1, 2, 2, 2)).toBe(true)  // ✓ Collision
```

#### `api.test.js`
Tests REST API endpoints:
- GET `/racks` - List all racks
- POST `/racks` - Create new rack
- POST `/devices` - Add device (with collision check)
- Validation errors

Example:
```javascript
const res = await request(app).post('/devices').send({
  rack_id: testRackId,
  name: 'SERVER-01',
  type: 'Server',
  height_u: 2,
  start_u: 40
})
expect(res.statusCode).toBe(201)
```

### Frontend Tests (`client/src/__tests__/`)

#### `RackVisualizer.test.jsx`
Tests the rack visualization component:
- Renders rack details
- Displays all devices
- Button interactions

Example:
```javascript
render(<RackVisualizer rack={mockRack} {...handlers} />)
expect(screen.getByText('SERVER-01')).toBeInTheDocument()
```

## Writing New Tests

### Backend (Jest)

```javascript
// server/src/__tests__/myFeature.test.js
import { myFunction } from '../path/to/myFeature.js'

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

### Frontend (Vitest + React Testing Library)

```javascript
// client/src/__tests__/MyComponent.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../components/MyComponent.jsx'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## Coverage Targets

Aim for:
- **Backend**: 80%+ coverage on collision engine & models
- **Frontend**: 70%+ coverage on components

View coverage report:
```bash
# Backend
cd server && npm run test:coverage
# Open: coverage/lcov-report/index.html

# Frontend
cd client && npm run test:coverage
# Open: coverage/index.html
```

## CI/CD Integration (Future)

In Phase 3+, tests will run automatically on:
- Pull requests (block if tests fail)
- Commits to `main`
- Pre-deployment checks

Configure in `.github/workflows/test.yml`

## Common Testing Patterns

### Mocking HTTP Requests

```javascript
import axios from 'axios'
vi.mock('axios')

axios.get.mockResolvedValue({ data: { id: '123' } })
```

### Testing State Changes

```javascript
import { render, screen, fireEvent } from '@testing-library/react'

const { getByRole } = render(<MyComponent />)
fireEvent.click(getByRole('button', { name: /add/i }))
// Assert state changed...
```

### Testing Error Cases

```javascript
it('should handle errors gracefully', () => {
  axios.post.mockRejectedValue(new Error('Collision detected'))
  render(<DeviceForm />)
  // Assert error message displayed...
})
```

## Known Limitations

- API tests use in-memory database (doesn't seed real data)
- Component tests mock API calls (no HTTP)
- E2E tests not yet implemented (Phase 3+)

## Next Steps

- [ ] Add E2E tests with Cypress
- [ ] Set up GitHub Actions for CI/CD
- [ ] Add integration tests for drag-and-drop
- [ ] Increase coverage to 90%+
- [ ] Add performance benchmarks
