# Delivery Service API Testing Guide

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run tests with change tracking
npm run test:watch

# Run tests with coverage report
w

# Integration tests with real Supabase
RUN_INTEGRATION_TESTS=true npm test
```

## 🔐 Set up environment variables

### Create a `.env.test` file

Create a `.env.test` file in the root of the project:

```env
# Test environment variables
NODE_ENV=test
LOG_LEVEL=ERROR
LOG_TO_CONSOLE=false

# Test credentials for Basic Auth
API_USERNAME=your_test_login
API_PASSWORD=your_test_password

# Test API Key
API_KEY_CS_CART=your_test_api_key

# Test data for Supabase
SUPABASE_URL=https://supabase.supabase.net
SUPABASE_ANON_KEY=your_test_supabase_key
```

⚠️ **Important**: Make sure the `.env.test` file is added to `.gitignore`!

## 📁 Test structure

```
src/__tests__/
├── setup.ts # 🔧 Test environment settings
├── helpers.ts # 🛠️ Common helpers for tests
├── app.ts # 🌐 Test Express application
├── unit/ # 🧪 Unit tests (test individual functions)
│ ├── middleware.test.ts # Authorization tests
│ └── services.test.ts # Business logic tests
├── api/ # 🌐 Integration tests (test API)
│ ├── calculation.test.ts # Shipping calculation tests
│ └── zone.test.ts # Zone check tests
├── integration/ # 🚀 E2E tests (real requests)
│ └── supabase.integration.test.ts
└── mocks/ # 🎭 Service mocks
└── services.ts
```

## 🎯 Test types

### 1. **Unit tests** (`unit/`)

-   Test individual functions directly
-   Use mocks for external dependencies
-   Fast and isolated

### 2. **Integration tests** (`api/`)

-   Test the full path of the API request
-   Check authorization, validation, processing
-   Use mocks for external services

### 3. **E2E tests** (`integration/`)

-   Test real requests to external services
-   Run only with the flag `RUN_INTEGRATION_TESTS=true`

## 🛠️ Common helpers

### `makeAuthRequest(app, endpoint)`

Creates an authorized HTTP request for API tests:

```typescript
import { makeAuthRequest } from '../helpers'

const response = await makeAuthRequest(app, 'calculate').send({
    coordinates: TEST_COORDINATES.IN_ZONE,
    order: { weight: 5, cost: 1000 },
})
```

### `TEST_COORDINATES`

Standard test coordinates:

```typescript
import { TEST_COORDINATES } from '../helpers'

// In the delivery zone (Khabarovsk)
TEST_COORDINATES.IN_ZONE // { lat: 48.5, lon: 135.1 }

// Out of the delivery zone (Moscow)
TEST_COORDINATES.OUT_OF_ZONE // { lat: 55.7558, lon: 37.6173 }
```

## 🎭 Mocks and Fakes

### Setting up mocks

All mocks are set up in `setup.ts`:

-   **Supabase** - simulates checking of delivery zones
-   **File system** - prevents creation of real logs

### Mock consistency

Mocks in `services.ts` use the same logic as in `setup.ts`:

-   Coordinates in Khabarovsk → in the delivery zone
-   Coordinates outside Khabarovsk → outside the delivery zone

## 📊 Code coverage

Current coverage: **79%** (great result!)

```bash
npm run test:coverage
```

## 🔧 How it works

1. **setup.ts** is loaded first and sets up the environment
2. **Mocks** replace external services with fakes
3. **Unit tests** check individual functions
4. **API tests** check full HTTP requests
5. **E2E tests** (optional) check real services

---

## 🆕 Adding new functionality

### 1. **New service**

```typescript
// 1. Create a service in src/services/newService.ts
// 2. Add mock in src/__tests__/mocks/services.ts
export const mockNewService = jest.fn().mockImplementation(...)

// 3. Create unit test in src/__tests__/unit/newService.test.ts
import '../setup'
import '../mocks/services'

describe('New service', () => {
test('tests a function', () => {
// test
})
})
```

### 2. **New API endpoint**

```typescript
// 1. Create route in src/routes/newRoute.ts
// 2. Add in src/__tests__/app.ts
apiRouter.use('/new', newRoutes)

// 3. Create API test in src/__tests__/api/newRoute.test.ts
import { makeAuthRequest, TEST_COORDINATES } from '../helpers'

describe('API of new endpoint', () => {
    test('tests endpoint', async () => {
        const response = await makeAuthRequest(app, 'new').send({
            // data
        })
        expect(response.status).toBe(200)
    })
})
```

### 3. **New middleware**

```typescript
// 1. Create middleware in src/middleware/newMiddleware.ts
// 2. Create unit test in src/__tests__/unit/newMiddleware.test.ts
import '../setup'

describe('New middleware', () => {
    test('tests middleware', () => {
        // test
    })
})
```

### 4. **New test data**

```typescript
// Add to src/__tests__/helpers.ts
export const NEW_TEST_DATA = {
    // new constants
}
```

##
