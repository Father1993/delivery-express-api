# Руководство по тестированию API сервиса доставки

## 🚀 Быстрый старт

```bash
# Запуск всех тестов
npm test

# Запуск тестов с отслеживанием изменений
npm run test:watch

# Запуск тестов с отчетом о покрытии
w

# Интеграционные тесты с реальным Supabase
RUN_INTEGRATION_TESTS=true npm test
```

## 🔐 Настройка переменных окружения

### Создайте файл `.env.test`

Создайте файл `.env.test` в корне проекта:

```env
# Тестовые переменные окружения
NODE_ENV=test
LOG_LEVEL=ERROR
LOG_TO_CONSOLE=false

# Тестовые учетные данные для Basic Auth
API_USERNAME=ваш_тестовый_логин
API_PASSWORD=ваш_тестовый_пароль

# Тестовый API ключ
API_KEY_CS_CART=ваш_тестовый_api_ключ

# Тестовые данные для Supabase
SUPABASE_URL=https://supabase.uroven.pro
SUPABASE_ANON_KEY=ваш_тестовый_ключ_supabase
```

⚠️ **Важно**: Убедитесь, что файл `.env.test` добавлен в `.gitignore`!

## 📁 Структура тестов

```
src/__tests__/
├── setup.ts                    # 🔧 Настройки тестового окружения
├── helpers.ts                   # 🛠️ Общие хелперы для тестов
├── app.ts                      # 🌐 Тестовое Express приложение
├── unit/                       # 🧪 Модульные тесты (тестируют отдельные функции)
│   ├── middleware.test.ts      # Тесты авторизации
│   └── services.test.ts        # Тесты бизнес-логики
├── api/                        # 🌐 Интеграционные тесты (тестируют API)
│   ├── calculation.test.ts     # Тесты расчета доставки
│   └── zone.test.ts           # Тесты проверки зон
├── integration/                # 🚀 E2E тесты (реальные запросы)
│   └── supabase.integration.test.ts
└── mocks/                      # 🎭 Подделки сервисов
    └── services.ts
```

## 🎯 Типы тестов

### 1. **Модульные тесты** (`unit/`)
- Тестируют отдельные функции напрямую
- Используют моки для внешних зависимостей
- Быстрые и изолированные

### 2. **Интеграционные тесты** (`api/`)
- Тестируют полный путь API запроса
- Проверяют авторизацию, валидацию, обработку
- Используют моки для внешних сервисов

### 3. **E2E тесты** (`integration/`)
- Тестируют реальные запросы к внешним сервисам
- Запускаются только с флагом `RUN_INTEGRATION_TESTS=true`

## 🛠️ Общие хелперы

### `makeAuthRequest(app, endpoint)`
Создает авторизованный HTTP запрос для API тестов:

```typescript
import { makeAuthRequest } from '../helpers'

const response = await makeAuthRequest(app, 'calculate').send({
    coordinates: TEST_COORDINATES.IN_ZONE,
    order: { weight: 5, cost: 1000 }
})
```

### `TEST_COORDINATES`
Стандартные тестовые координаты:

```typescript
import { TEST_COORDINATES } from '../helpers'

// В зоне доставки (Хабаровск)
TEST_COORDINATES.IN_ZONE    // { lat: 48.5, lon: 135.1 }

// Вне зоны доставки (Москва)  
TEST_COORDINATES.OUT_OF_ZONE // { lat: 55.7558, lon: 37.6173 }
```

## 🎭 Моки и подделки

### Настройка моков
Все моки настраиваются в `setup.ts`:
- **Supabase** - имитирует проверку зон доставки
- **Файловая система** - предотвращает создание реальных логов

### Согласованность моков
Моки в `services.ts` используют ту же логику, что и в `setup.ts`:
- Координаты в Хабаровске → в зоне доставки
- Координаты вне Хабаровска → вне зоны доставки

## 📊 Покрытие кода

Текущее покрытие: **79%** (отличный результат!)

```bash
npm run test:coverage
```

## 🔧 Как это работает

1. **setup.ts** загружается первым и настраивает окружение
2. **Моки** заменяют внешние сервисы на подделки
3. **Unit тесты** проверяют отдельные функции
4. **API тесты** проверяют полные HTTP запросы
5. **E2E тесты** (опционально) проверяют реальные сервисы

---

## 🆕 Добавление нового функционала

### 1. **Новый сервис**
```typescript
// 1. Создайте сервис в src/services/newService.ts
// 2. Добавьте мок в src/__tests__/mocks/services.ts
export const mockNewService = jest.fn().mockImplementation(...)

// 3. Создайте unit тест в src/__tests__/unit/newService.test.ts
import '../setup'
import '../mocks/services'

describe('Новый сервис', () => {
    test('тестирует функцию', () => {
        // тест
    })
})
```

### 2. **Новый API эндпоинт**
```typescript
// 1. Создайте роут в src/routes/newRoute.ts
// 2. Добавьте в src/__tests__/app.ts
apiRouter.use('/new', newRoutes)

// 3. Создайте API тест в src/__tests__/api/newRoute.test.ts
import { makeAuthRequest, TEST_COORDINATES } from '../helpers'

describe('API нового эндпоинта', () => {
    test('тестирует эндпоинт', async () => {
        const response = await makeAuthRequest(app, 'new').send({
            // данные
        })
        expect(response.status).toBe(200)
    })
})
```

### 3. **Новый middleware**
```typescript
// 1. Создайте middleware в src/middleware/newMiddleware.ts
// 2. Создайте unit тест в src/__tests__/unit/newMiddleware.test.ts
import '../setup'

describe('Новый middleware', () => {
    test('тестирует middleware', () => {
        // тест
    })
})
```

### 4. **Новые тестовые данные**
```typescript
// Добавьте в src/__tests__/helpers.ts
export const NEW_TEST_DATA = {
    // новые константы
}
```

## 📝 Памятка разработчикам

### ✅ **Обязательно делайте:**
- Используйте `makeAuthRequest()` для API тестов
- Используйте `TEST_COORDINATES` для координат
- Добавляйте моки для внешних сервисов
- Тестируйте и положительные, и отрицательные сценарии
- Обновляйте документацию при изменении API

### ❌ **Никогда не делайте:**
- Не храните учетные данные в коде тестов
- Не делайте реальные запросы в unit/API тестах
- Не дублируйте тестовые данные в разных файлах
- Не забывайте добавлять тесты для нового функционала

### 🎯 **Принципы хороших тестов:**
- **Быстрые** - unit тесты выполняются мгновенно
- **Независимые** - каждый тест работает сам по себе
- **Повторяемые** - одинаковый результат при каждом запуске
- **Понятные** - ясно что и зачем тестируется

### 🚀 **Команды для разработки:**
```bash
# Запуск тестов при изменении файлов
npm run test:watch

# Запуск только unit тестов
npm test -- unit/

# Запуск только API тестов  
npm test -- api/

# Проверка покрытия кода
npm run test:coverage
```

---

**Помните: хорошие тесты = надежный код!** 🎉