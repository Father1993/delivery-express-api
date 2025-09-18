# API service for shipping calculation

A simple and effective API service for calculating shipping costs based on address coordinates and order parameters.

## Functionality

-   Calculating delivery cost based on address coordinates
-   Checking delivery zone via Supabase RPC
-   Accounting for order weight and cost
-   Various delivery options depending on distance
-   Simple REST API for integration with CS-Cart
-   API protection using access keys
-   Detailed logging for debugging

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
│ └── index.ts # Entry point
├── logs/ # Log directory
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

The API service provides functionality for calculating delivery costs based on coordinates and order parameters. The process of working with the API consists of two main steps:

1. Checking the possibility of delivery by coordinates (checking the zone)
2. Calculating the delivery cost using the data from the first step

### Main endpoints

| Method | Endpoint         | Description                   |
| ------ | ---------------- | ----------------------------- |
| GET    | `/`              | API status                    |
| POST   | `/api/zone`      | Checking the delivery zone    |
| POST   | `/api/calculate` | Calculating the delivery cost |

### API workflow

To use the API correctly, you need to:

1. First, check the coordinates via `/api/zone`
2. Then use the received data to calculate the delivery via `/api/calculate`

This approach allows you to:

-   Check the delivery zone before calculating the cost
-   Cache the results of the zone check on the client side
-   Build more flexible logic in the client application

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
    "coordinates": {
        "lat": 48.480223,
        "lon": 135.071917
    }
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

**Request:**

```json
{
    "coordinates": {
        "lat": 48.480223,
        "lon": 135.071917
    },
    "order": {
        "weight": 2.5,
        "cost": 3200
    },
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Central District"
    }
}
```

**Response:**
# API service for shipping calculation

A simple and effective API service for calculating shipping costs based on address coordinates and order parameters.

## Functionality

-   Calculating delivery cost based on address coordinates
-   Checking delivery zone via Supabase RPC
-   Accounting for order weight and cost
-   Various delivery options depending on distance
-   Simple REST API for integration with CS-Cart
-   API protection using access keys
-   Detailed logging for debugging

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
│ └── index.ts # Entry point
├── logs/ # Log directory
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

The API service provides functionality for calculating delivery costs based on coordinates and order parameters. The process of working with the API consists of two main steps:

1. Checking the possibility of delivery by coordinates (checking the zone)
2. Calculating the delivery cost using the data from the first step

### Main endpoints

| Method | Endpoint         | Description                   |
| ------ | ---------------- | ----------------------------- |
| GET    | `/`              | API status                    |
| POST   | `/api/zone`      | Checking the delivery zone    |
| POST   | `/api/calculate` | Calculating the delivery cost |

### API workflow

To use the API correctly, you need to:

1. First, check the coordinates via `/api/zone`
2. Then use the received data to calculate the delivery via `/api/calculate`

This approach allows you to:

-   Check the delivery zone before calculating the cost
-   Cache the results of the zone check on the client side
-   Build more flexible logic in the client application

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
    "coordinates": {
        "lat": 48.480223,
        "lon": 135.071917
    }
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

**Request:**

```json
{
    "coordinates": {
        "lat": 48.480223,
        "lon": 135.071917
    },
    "order": {
        "weight": 2.5,
        "cost": 3200
    },
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Central District"
    }
}
```

**Response:**
