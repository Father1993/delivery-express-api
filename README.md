# API сервис калькуляции доставки

Простой и эффективный API-сервис для расчета стоимости доставки на основе координат адреса и параметров заказа.

## Функциональность

-   Расчет стоимости доставки на основе координат адреса
-   Проверка зоны доставки через Supabase RPC
-   Учет веса и стоимости заказа
-   Различные варианты доставки в зависимости от расстояния
-   Простой REST API для интеграции с CS-Cart
-   Защита API с помощью ключей доступа
-   Детальное логирование для отладки

## Технологии

-   TypeScript
-   Express.js
-   Supabase (для проверки зон доставки)
-   Docker
-   Traefik (для проксирования и SSL)

## Структура проекта

```
delivery-uroven/
├── src/
│   ├── models/         # Типы данных
│   ├── routes/         # API маршруты
│   ├── services/       # Бизнес-логика
│   ├── middleware/     # Middleware (авторизация)
│   ├── utils/          # Утилиты (логирование)
│   └── index.ts        # Точка входа
├── logs/               # Директория логов
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
-   `@middleware/*` - доступ к middleware
-   `@utils/*` - доступ к утилитам

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

## Документация API

### Обзор

API сервис предоставляет функциональность для расчета стоимости доставки на основе координат и параметров заказа. Процесс работы с API состоит из двух основных шагов:

1. Проверка возможности доставки по координатам (проверка зоны)
2. Расчет стоимости доставки с использованием данных из первого шага

### Основные эндпоинты

| Метод | Эндпоинт         | Описание                  |
| ----- | ---------------- | ------------------------- |
| GET   | `/`              | Статус API                |
| POST  | `/api/zone`      | Проверка зоны доставки    |
| POST  | `/api/calculate` | Расчет стоимости доставки |

### Процесс работы с API

Для правильного использования API необходимо:

1. Сначала проверить координаты через `/api/zone`
2. Затем использовать полученные данные для расчета доставки через `/api/calculate`

Такой подход позволяет:

-   Проверять зону доставки до расчета стоимости
-   Кэшировать результаты проверки зоны на стороне клиента
-   Строить более гибкую логику в клиентском приложении

### Авторизация API

Все запросы к API должны включать заголовок `x-api-key` с действительным ключом API.

```
x-api-key: YOUR_API_KEY
```

Дополнительно можно настроить Basic Authentication через переменные окружения `API_USERNAME` и `API_PASSWORD`.

### GET /

Проверка статуса API.

**Ответ:**

```json
{
    "status": "Ok",
    "message": "API сервис калькуляции доставки работает | Уровень",
    "version": "1.0.0",
    "timestamp": "2025-09-09T07:00:00.000Z"
}
```

### 1. Проверка зоны доставки (POST /api/zone)

Проверяет, доступна ли доставка по указанным координатам через Supabase RPC.

**Заголовки:**

```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Запрос:**

```json
{
    "coordinates": {
        "lat": 48.480223,
        "lon": 135.071917
    }
}
```

**Успешный ответ:**

```json
{
    "inZone": true,
    "zoneName": "Центральный район",
    "zoneData": [
        {
            "zone_name": "Центральный район",
            "zone_description": "Основная зона доставки",
            "city_id": 1
        }
    ],
    "timestamp": "2025-09-09T07:00:00.000Z"
}
```

**Ответ (вне зоны доставки):**

```json
{
    "inZone": false,
    "error": "Адрес находится вне зоны доставки",
    "timestamp": "2025-09-09T07:00:00.000Z"
}
```

### 2. Расчет стоимости доставки (POST /api/calculate)

Расчет стоимости доставки на основе координат, данных заказа и информации о зоне доставки.

**Заголовки:**

```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Запрос:**

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
        "zoneName": "Центральный район"
    }
}
```

**Ответ:**

```json
{
    "delivery_cost": 370,
    "delivery_time": "2-3 дня",
    "options": [
        {
            "name": "Экспресс доставка",
            "cost": 555,
            "description": "Доставка в течение 3-5 часов"
        }
    ],
    "zoneInfo": {
        "inZone": true,
        "zoneName": "Центральный район"
    }
}
```

## Логирование

### Настройка логирования

API использует собственную систему логирования с 4 уровнями:

-   **ERROR** - критические ошибки
-   **WARN** - предупреждения
-   **INFO** - информационные сообщения
-   **DEBUG** - детальная отладка

### Переменные окружения для логирования

```bash
LOG_LEVEL=INFO          # Минимальный уровень логирования
LOG_DIR=/app/logs       # Директория для логов
LOG_FILE=app.log        # Имя файла логов
LOG_TO_CONSOLE=true     # Вывод в консоль (true/false)
```

### Просмотр логов

**Локально:**

```bash
tail -f ./logs/app.log
```

**Docker:**

```bash
docker-compose logs -f delivery-api
```

## Развертывание на VPS

### Предварительные требования

-   Docker и Docker Compose
-   Настроенный Traefik с внешней сетью traefik-public
-   Доменное имя, указывающее на ваш сервер (delivery.uroven.pro)
-   Настроенные переменные окружения для Supabase

### Переменные окружения

Создайте файл `.env` с необходимыми переменными:

```bash
# API настройки
API_KEY_CS_CART=your_api_key_here
API_USERNAME=your_username  # опционально
API_PASSWORD=your_password  # опционально

# Supabase настройки
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Логирование
LOG_LEVEL=INFO
LOG_DIR=/app/logs
LOG_FILE=app.log
```

### Шаги деплоя

1. Клонировать репозиторий на сервер:

    ```
    git clone https://gitlab.com/uroven-gitlab-group/delivery-uroven.git
    cd delivery-uroven
    ```

2. Настроить переменные окружения в файле .env

3. Запустить сервис с помощью Docker Compose:

    ```
    docker-compose up -d
    ```

4. Проверить логи:

    ```
    docker-compose logs -f delivery-api
    ```

5. API будет доступно по адресу: https://delivery.uroven.pro

## Интеграция с CS-Cart

Двухэтапный процесс интеграции:

```javascript
// Пример кода для интеграции с CS-Cart
const API_KEY = 'your_api_key_here' // API ключ для авторизации
const API_BASE = 'https://delivery.uroven.pro/api'

// Шаг 1: Проверка зоны доставки
async function checkDeliveryZone(coordinates) {
    const response = await fetch(`${API_BASE}/zone`, {
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
    lat: 48.480223,
    lon: 135.071917,
}

const order = {
    weight: 2.5, // Вес заказа в кг
    cost: 3200, // Стоимость заказа в рублях
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

## FAQ

### Как настроить логирование?

Установите переменные окружения:

```bash
LOG_LEVEL=DEBUG  # Для детальной отладки
LOG_DIR=./logs   # Директория логов
```

### Как проверить работу API?

```bash
# Проверка статуса
curl https://delivery.uroven.pro/

# Проверка зоны
curl -X POST https://delivery.uroven.pro/api/zone \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"coordinates":{"lat":48.480223,"lon":135.071917}}'
```

### Как посмотреть логи в Docker?

```bash
# Логи контейнера
docker-compose logs -f delivery-api

# Логи в файле
tail -f ./logs/app.log
```

### Какие ошибки могут возникнуть?

-   **400** - Некорректные данные запроса
-   **401** - Неверный API ключ
-   **422** - Адрес вне зоны доставки
-   **500** - Ошибка сервера или Supabase
