# Краткая документация по API сервиса доставки

## Общая информация

API сервис предоставляет функциональность для расчета стоимости доставки на основе координат и параметров заказа.

**Базовый URL**: `https://delivery.uroven.pro/api` (или `http://localhost:3000/api` для локальной разработки)

## Авторизация

Все запросы к API должны содержать заголовок:

```
x-api-key: cs-cart-delivery
```

## Основные эндпоинты

| Метод | Эндпоинт     | Описание                  |
| ----- | ------------ | ------------------------- |
| POST  | `/zone`      | Проверка зоны доставки    |
| POST  | `/calculate` | Расчет стоимости доставки |
| GET   | `/health`    | Проверка доступности API  |

## Порядок использования API

1. Сначала выполните запрос к `/api/zone` для проверки возможности доставки
2. Если адрес находится в зоне доставки, используйте результат для запроса к `/api/calculate`

## Примеры запросов

### 1. Проверка зоны доставки

```
POST /api/zone
```

```json
{
    "coordinates": {
        "lat": 48.498826,
        "lon": 135.223427
    }
}
```

**Ответ (успех):**

```json
{
    "inZone": true,
    "zoneName": "Центральный район",
    "timestamp": "2023-11-15T10:30:15.123Z"
}
```

### 2. Расчет стоимости доставки

```
POST /api/calculate
```

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
    },
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Центральный район"
    }
}
```

**Ответ:**

```json
{
    "delivery_cost": 305,
    "delivery_time": "2-3 дня",
    "options": [
        {
            "name": "Экспресс доставка",
            "cost": 458,
            "description": "Доставка в течение 3-5 часов"
        }
    ],
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Центральный район"
    }
}
```

## Пример интеграции (JavaScript)

```javascript
// Пример минимальной интеграции с API
async function calculateDelivery(coordinates, order) {
    const API_KEY = 'cs-cart-delivery'
    const API_URL = 'https://delivery.uroven.pro/api'

    // Шаг 1: Проверка зоны доставки
    const zoneResponse = await fetch(`${API_URL}/zone`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        },
        body: JSON.stringify({ coordinates }),
    })

    const zoneData = await zoneResponse.json()

    // Если адрес вне зоны доставки
    if (!zoneData.inZone) {
        return {
            error: true,
            message: 'Доставка по указанному адресу невозможна',
        }
    }

    // Шаг 2: Расчет стоимости доставки
    const calcResponse = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        },
        body: JSON.stringify({
            coordinates,
            order,
            zoneInfo: zoneData,
        }),
    })

    return await calcResponse.json()
}
```
