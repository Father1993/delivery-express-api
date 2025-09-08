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

### Важное изменение в процессе работы API

Для правильного использования API необходимо:

1. Сначала проверить координаты через `/api/check-zone`
2. Затем использовать полученные данные для расчета доставки через `/api/calculate`

Такой подход позволяет:

-   Проверять зону доставки до расчета стоимости
-   Кэшировать результаты проверки зоны на стороне клиента
-   Строить более гибкую логику в клиентском приложении

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

### POST /api/check-zone

Проверка доступности доставки по координатам (обязательный первый шаг).

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

**Ответ (вне зоны доставки):**

```json
{
    "inZone": false,
    "error": "Адрес находится вне зоны доставки",
    "timestamp": "2023-11-15T10:30:15.123Z"
}
```

### POST /api/calculate

Расчет стоимости доставки (второй шаг после проверки зоны).

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

Двухэтапный процесс интеграции:

```javascript
// Пример кода для интеграции с CS-Cart
const API_KEY = 'cs-cart-delivery' // API ключ для авторизации
const API_BASE = 'https://delivery.uroven.pro/api'

// Шаг 1: Проверка зоны доставки
async function checkDeliveryZone(coordinates) {
    const response = await fetch(`${API_BASE}/check-zone`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        },
        body: JSON.stringify({ coordinates }),
    })

    if (!response.ok) {
        throw new Error('Ошибка при проверке зоны доставки: ' + response.status)
    }

    return response.json()
}

// Шаг 2: Расчет стоимости доставки
async function calculateDelivery(coordinates, order, zoneInfo) {
    const response = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        },
        body: JSON.stringify({
            coordinates,
            order,
            zoneInfo,
        }),
    })

    if (!response.ok) {
        throw new Error('Ошибка при расчете доставки: ' + response.status)
    }

    return response.json()
}

// Пример использования
const coordinates = {
    lat: 48.498826,
    lon: 135.223427,
}

const order = {
    weight: 5.5, // Вес заказа в кг
    cost: 3500, // Стоимость заказа в рублях
    items: 2, // Количество товаров (опционально)
}

// Полный процесс расчета доставки
async function processDelivery() {
    try {
        // Сначала проверяем зону доставки
        const zoneInfo = await checkDeliveryZone(coordinates)

        // Если адрес вне зоны доставки, показываем сообщение
        if (!zoneInfo.inZone) {
            console.log(
                'Доставка невозможна: ' +
                    (zoneInfo.error || 'Адрес вне зоны доставки')
            )
            return
        }

        // Если адрес в зоне доставки, рассчитываем стоимость
        const deliveryData = await calculateDelivery(
            coordinates,
            order,
            zoneInfo
        )

        // Используем полученные данные
        console.log('Стоимость доставки:', deliveryData.delivery_cost)
        console.log('Время доставки:', deliveryData.delivery_time)

        // Варианты доставки, если доступны
        if (deliveryData.options && deliveryData.options.length > 0) {
            console.log('Доступные варианты доставки:')
            deliveryData.options.forEach((option) => {
                console.log(
                    `- ${option.name}: ${option.cost} руб. (${option.description})`
                )
            })
        }
    } catch (error) {
        console.error('Ошибка:', error)
    }
}

// Запускаем процесс
processDelivery()
```
