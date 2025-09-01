# API сервис калькуляции доставки

Простой и эффективный API-сервис для расчета стоимости доставки на основе координат адреса и параметров заказа.

## Функциональность

-   Расчет стоимости доставки на основе координат адреса
-   Учет веса и стоимости заказа
-   Различные варианты доставки в зависимости от расстояния
-   Простой REST API для интеграции с CS-Cart
-   Защита API с помощью ключей доступа

## Технологии

-   TypeScript
-   Express.js
-   Docker
-   Traefik (для проксирования и SSL)

## Структура проекта

```
delivery-uroven/
├── src/
│   ├── models/         # Типы данных
│   ├── routes/         # API маршруты
│   ├── services/       # Бизнес-логика
│   └── index.ts        # Точка входа
├── .env                # Переменные окружения
├── docker-compose.yml  # Конфигурация Docker Compose
├── Dockerfile          # Конфигурация для создания Docker образа
├── package.json        # Зависимости NPM
└── tsconfig.json       # Конфигурация TypeScript
```

## Особенности проекта

### Алиасы путей импорта

В проекте настроены алиасы путей для импорта, что делает код более читаемым:

```typescript
// Вместо относительных путей
import { DeliveryCalculationRequest } from '../models/deliveryData'

// Используем алиасы
import { DeliveryCalculationRequest } from '@models/deliveryData'
```

Доступные алиасы:

-   `@/*` - доступ к любому файлу из директории src
-   `@models/*` - доступ к моделям данных
-   `@services/*` - доступ к сервисам
-   `@routes/*` - доступ к маршрутам API

## Локальная разработка

1. Клонировать репозиторий:

    ```
    git clone https://gitlab.com/uroven-gitlab-group/delivery-uroven.git
    cd delivery-uroven
    ```

2. Установить зависимости:

    ```
    npm install
    ```

3. Запустить в режиме разработки:

    ```
    npm run dev
    ```

4. API будет доступно по адресу: http://localhost:3000

## API эндпоинты

### Авторизация API

Все запросы к API должны включать заголовок `x-api-key` с действительным ключом API.

```
x-api-key: cs-cart-delivery
```

Для тестирования можно использовать ключ `test-api-key`.

### GET /api/test

Проверка доступности API и корректности авторизации.

**Заголовки:**

```
x-api-key: cs-cart-delivery
```

**Ответ:**

```json
{
    "status": "ok",
    "message": "API доступен и защищен",
    "timestamp": "2023-11-15T10:30:15.123Z"
}
```

### POST /api/calculate

Расчет стоимости доставки.

**Заголовки:**

```
Content-Type: application/json
x-api-key: cs-cart-delivery
```

**Запрос:**

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
    ]
}
```

## Развертывание на VPS

### Предварительные требования

-   Docker и Docker Compose
-   Настроенный Traefik с внешней сетью traefik-public
-   Доменное имя, указывающее на ваш сервер (delivery.uroven.pro)

### Шаги деплоя

1. Клонировать репозиторий на сервер:

    ```
    git clone https://gitlab.com/uroven-gitlab-group/delivery-uroven.git
    cd delivery-uroven
    ```

2. Настроить переменные окружения в файле .env (при необходимости)

3. Запустить сервис с помощью Docker Compose:

    ```
    docker-compose up -d
    ```

4. Проверить логи:

    ```
    docker-compose logs -f
    ```

5. API будет доступно по адресу: https://delivery.uroven.pro

## Интеграция с CS-Cart

После проверки адреса на вхождение в зону доставки (через Supabase), CS-Cart может отправить запрос на расчет стоимости доставки:

```javascript
// Пример кода для интеграции с CS-Cart
const API_KEY = 'cs-cart-delivery' // API ключ для авторизации

fetch('https://delivery.uroven.pro/api/calculate', {
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
            weight: totalWeight, // Вес заказа в кг
            cost: totalCost, // Стоимость заказа в рублях
            items: totalItems, // Количество товаров (опционально)
        },
    }),
})
    .then((response) => {
        if (!response.ok) {
            throw new Error('Ошибка при запросе к API: ' + response.status)
        }
        return response.json()
    })
    .then((data) => {
        // Использовать data.delivery_cost для отображения стоимости доставки
        // Использовать data.delivery_time для отображения времени доставки
        // Можно также использовать data.options для отображения вариантов доставки
    })
    .catch((error) => console.error('Ошибка:', error))
```
