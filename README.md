# Delivery Calculation API Service

A simple and efficient API service for calculating delivery costs based on address coordinates and order parameters.

## Features

-   Delivery cost calculation based on address coordinates
-   Consideration of order weight and cost
-   Various delivery options depending on distance
-   Simple REST API for integration with CS-Cart
-   API protection using access keys

## Technologies

-   TypeScript
-   Express.js
-   Docker
-   Traefik (for proxying and SSL)

## Project Structure

```
delivery-express-api/
├── src/
│   ├── models/         # Data types
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── index.ts        # Entry point
├── .env                # Environment variables
├── package.json        # NPM dependencies
└── tsconfig.json       # TypeScript configuration
```

## Project Features

### Import Path Aliases

The project has configured path aliases for imports, making the code more readable:

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

## Local Development

1. Clone the repository:

    ```
    git clone https://github.com/Father1993/delivery-express-api.git
    cd delivery-express-api
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Run in development mode:

    ```
    npm run dev
    ```

4. API will be available at: http://localhost:3000

## API Endpoints

### API Authorization

All API requests must include the `x-api-key` header with a valid API key.

```
x-api-key: cs-cart-delivery
```

For testing, you can use the key `test-api-key`.

### GET /api/test

Check API availability and correct authorization.

**Headers:**

```
x-api-key: cs-cart-delivery
```

**Response:**

```json
{
    "status": "ok",
    "message": "API is available and protected",
    "timestamp": "2023-11-15T10:30:15.123Z"
}
```

### POST /api/calculate

Calculate delivery cost.

**Headers:**

```
Content-Type: application/json
x-api-key: cs-cart-delivery
```

**Request:**

```json
{
    "coordinates": {
        "lat": 48.498826,
        "lon": 135.223427
    },
    "order": {
        "weight": 5.5,
        "cost": 3500,
        "items": 2
    }
}
```

**Response:**

```json
{
    "delivery_cost": 305,
    "delivery_time": "2-3 days",
    "options": [
        {
            "name": "Express delivery",
            "cost": 458,
            "description": "Delivery within 3-5 hours"
        }
    ]
}
```

### Deployment Steps

1. Clone the repository to the server:

    ```
    git clone https://github.com/Father1993/delivery-express-api.git
    cd delivery-express-api
    ```

2. Configure environment variables in the .env file (if necessary)

## Integration with CS-Cart

After checking if the address is within the delivery zone (via Supabase), CS-Cart can send a request to calculate the delivery cost:

```javascript
// Example code for integration with CS-Cart
const API_KEY = 'cs-cart-delivery' // API key for authorization

fetch('[API_URL]', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
    },
    body: JSON.stringify({
        coordinates: {
            lat: 48.498826,
            lon: 135.223427,
        },
        order: {
            weight: totalWeight, // Order weight in kg
            cost: totalCost, // Order cost in rubles
            items: totalItems, // Number of items (optional)
        },
    }),
})
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error when requesting API: ' + response.status)
        }
        return response.json()
    })
    .then((data) => {
        // Use data.delivery_cost to display delivery cost
        // Use data.delivery_time to display delivery time
        // You can also use data.options to display delivery options
    })
    .catch((error) => console.error('Error:', error))
```
