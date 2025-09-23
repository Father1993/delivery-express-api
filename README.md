# API service for shipping calculation

A simple and effective API service for calculating shipping costs based on address coordinates and order parameters using **Excel-based formulas** for accurate pricing.

## Functionality

-   **Excel-based calculation** - precise delivery cost calculation using real Excel formulas
-   **Automatic zone checking** - single request for zone validation + cost calculation
-   **Minimum load guarantee** - 74.3% minimum load ensures profitability for small orders
-   **Weight and volume support** - calculates based on both weight (kg) and volume (m³)
-   **Express delivery option** - priority delivery with 14.25% surcharge
-   **Round to 100 rubles** - customer-friendly pricing
-   **Supabase integration** - real-time zone validation via RPC
-   **Dual authentication** - Basic Auth + API Key protection
-   **Comprehensive logging** - detailed operation tracking

## Technologies

-   TypeScript
-   Express.js
-   Supabase (for checking delivery zones)
-   Docker
-   Traefik (for proxying and SSL)

## Project structure

```
delivery-api-express/
├── src/
│ ├── models/ # Data types
│ ├── routes/ # API routes
│ ├── services/ # Business logic
│ ├── middleware/ # Middleware (authorization)
│ ├── utils/ # Utilities (logging)
│ ├── config/ # Configuration files
│ └── index.ts # Entry point
├── logs/ # Log directory
├── docs/ # Documentation
├── .env # Environment variables
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile # Configuration for creating a Docker image
├── package.json # NPM dependencies
└── tsconfig.json # TypeScript configuration
```

## Project features

### Import path aliases

The project has aliases for import paths, which makes the code more readable:

```typescript
// Instead of relative paths
import { DeliveryCalculationRequest } from '../models/deliveryData'

// Using aliases
import { DeliveryCalculationRequest } from '@models/deliveryData'
```

Available aliases:

-   `@/*` - access to any file from the src directory
-   `@models/*` - access to data models
-   `@services/*` - access to services
-   `@routes/*` - access to API routes
-   `@middleware/*` - access to middleware
-   `@utils/*` - access to utilities
-   `@config/*` - access to configuration files

## Local development

1. Clone the repository:

```
git clone https://github.com/Father1993/delivery-express-api.git
cd delivery-api-express
```

2. Install dependencies:

```
npm install
```

3. Run in development mode:

```
npm run dev
```

4. The API will be available at: http://localhost:3000

## API Documentation

### Overview

The API service provides functionality for calculating delivery costs based on coordinates and order parameters. The service now supports **automatic zone checking** - you can calculate delivery costs with a single request.

### Main endpoints

| Method | Endpoint         | Description                   |
| ------ | ---------------- | ----------------------------- |
| GET    | `/`              | API status                    |
| POST   | `/api/zone`      | Checking the delivery zone    |
| POST   | `/api/calculate` | Calculating the delivery cost |

### API workflow

#### New way (recommended) - Single request:

1. Send coordinates and order data to `/api/calculate`
2. API automatically checks the delivery zone
3. If in zone: calculates and returns delivery cost
4. If out of zone: returns error with zone information

#### Legacy way - Two-step process:

1. First, check the coordinates via `/api/zone`
2. Then use the received data to calculate the delivery via `/api/calculate`

### API authorization

All requests to the API must include the `x-api-key` header with a valid API key.

```
x-api-key: YOUR_API_KEY
```

Additionally, you can configure Basic Authentication via the `API_USERNAME` and `API_PASSWORD` environment variables.

### GET /

Checking the API status.

**Response:**

```json
{
    "status": "Ok",
    "message": "The shipping calculation API service is running | Level",
    "version": "1.0.0",
    "timestamp": "2025-09-09T07:00:00.000Z"
}
```

### 1. Check shipping zone (POST /api/zone)

Checks if shipping is available at the specified coordinates via Supabase RPC.

**Headers:**

```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request:**

```json
{
        "lat": 48.480223,
        "lon": 135.071917
}
```

**Successful response:**

```json
{
    "inZone": true,
    "zoneName": "Central District",
    "zoneData": [
        {
            "zone_name": "Central District",
            "zone_description": "Primary Delivery Zone",
            "city_id": 1
        }
    ],
    "timestamp": "2025-09-09T07:00:00.000Z"
}
```

**Response (out of zone delivery):**

```json
{
    "inZone": false,
    "error": "Address is outside the delivery zone",
    "timestamp": "2025-09-09T07:00:00.000Z"
}
```

### 2. Calculating delivery costs (POST /api/calculate)

Calculating delivery costs based on coordinates, order data, and delivery zone information.

**Headers:**

```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request (new way - automatic zone checking):**

```json
{
    "lat": 48.480223,
    "lon": 135.071917,
    "order": {
        "weight": 2.5,
        "volume": 0.1,
        "cost": 3200
    }
}
```

**Request (legacy way - with zone info):**

```json
{
        "lat": 48.480223,
    "lon": 135.071917,
    "order": {
        "weight": 2.5,
        "volume": 0.1,
        "cost": 3200
    },
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Central District"
    }
}
```

**Response (successful):**

```json
{
    "delivery_cost": 700,
    "delivery_time": "1-2 дня",
    "express_delivery_cost": 800,
    "options": [
        {
            "name": "Экспресс доставка",
            "cost": 800,
            "description": "Приоритетная доставка"
        }
    ],
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Зона доставки — Хабаровск"
    }
}
```

**Response (out of zone):**

```json
{
    "error": true,
    "message": "Адрес находится вне зоны доставки",
    "zoneInfo": {
        "inZone": false,
        "error": "Адрес находится вне зоны доставки"
    }
}
```

## Calculation Logic

The service uses **Excel-based formulas** for precise delivery cost calculation:

### Parameters

- **Vehicle capacity**: 2000 kg weight, 9 m³ volume
- **City speed**: 20 km/h average
- **Loading time**: 0.5 hours maximum
- **City distance**: 7 km average route
- **Minimum load**: 74.3% (ensures profitability)
- **Hourly rate**: 850 rubles/hour
- **Additional costs**: 100 rubles
- **Margin**: 10%
- **Express surcharge**: 14.25%

### Calculation Steps

1. **Load ratio**: `MAX(weight/2000, volume/9)`
2. **Required trips**: `CEIL(load_ratio)`
3. **Effective load**: `MAX(load_ratio, 74.3%)`
4. **Loading time**: `0.5 hours × effective_load`
5. **Delivery time**: `(7 km ÷ 20 km/h) × effective_load`
6. **Base cost**: `(loading_time + delivery_time) × 850 + 100`
7. **Regular delivery**: `ROUND(base_cost × 1.1 ÷ 100) × 100`
8. **Express delivery**: `ROUND(base_cost × 1.1425 × 1.1 ÷ 100) × 100`

### Examples

- **Small order (0.1 kg, 0.1 m³)**: 700/800 rubles
- **Medium order (1000 kg, 4 m³)**: 700/800 rubles  
- **Large order (3000 kg, 6 m³)**: 2500/2800 rubles
- **Very large order (100000 kg)**: 39800/45500 rubles

## Environment Variables

```env
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# API authentication
API_KEY_CS_CART=your_api_key
API_USERNAME=your_username
API_PASSWORD=your_password

# Logging
LOG_LEVEL=info
LOG_TO_CONSOLE=true
LOG_DIR=logs
```

## Testing

Run tests:

```bash
# Unit tests
npm test

# Tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t delivery-api .

# Run container
docker run -p 3000:3000 --env-file .env delivery-api
```

Or use Docker Compose:

```bash
docker-compose up -d
```

## API Examples

### cURL Examples

**Check API status:**
```bash
curl http://localhost:3000/
```

**Check delivery zone:**
```bash
curl -X POST http://localhost:3000/api/zone \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"lat": 48.480223, "lon": 135.071917}'
```

**Calculate delivery (new way):**
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  -d '{
        "lat": 48.480223,
    "lon": 135.071917,
    "order": {
        "weight": 2.5,
      "volume": 0.1,
        "cost": 3200
    }
  }'
```

## Advantages

1. **🎯 Simplified** - one request instead of two
2. **📊 Accurate** - calculation using real Excel formulas
3. **💰 Profitable** - minimum 74.3% load for small orders
4. **⚡ Fast** - fewer network requests
5. **🔄 Compatible** - legacy code continues to work
6. **🛡️ Secure** - dual authentication system
7. **📊 Monitored** - comprehensive operation logging

This service provides a well-structured, scalable API for delivery cost calculation with **automatic zone checking** and **precise Excel-based pricing**.