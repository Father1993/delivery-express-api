# Примеры использования обновленного API

## 🚀 Новый способ (рекомендуемый)

### 1. Расчет доставки с автоматической проверкой зоны

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  -d '{
    "lat": 48.480223,
    "lon": 135.071917,
    "order": {
      "weight": 1500,
      "volume": 7,
      "cost": 50000
    }
  }'
```

**Ответ (успех):**
```json
{
  "delivery_cost": 838,
  "delivery_time": "1-2 дня",
  "express_delivery_cost": 957,
  "options": [
    {
      "name": "Экспресс доставка",
      "cost": 957,
      "description": "Приоритетная доставка"
    }
  ],
  "zoneInfo": {
    "inZone": true,
    "zoneName": "Зона доставки — Хабаровск"
  }
}
```

**Ответ (адрес вне зоны):**
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

### 2. Старый способ (все еще работает)

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  -d '{
    "lat": 48.480223,
    "lon": 135.071917,
    "order": {
      "weight": 1500,
      "volume": 7,
      "cost": 50000
    },
    "zoneInfo": {
      "inZone": true,
      "zoneName": "Хабаровск"
    }
  }'
```

## 🔍 Проверка зоны (отдельный endpoint)

```bash
curl -X POST http://localhost:3000/api/zone \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  -d '{
    "lat": 48.480223,
    "lon": 135.071917
  }'
```

**Ответ:**
```json
{
  "inZone": true,
  "zoneName": "Зона доставки — Хабаровск",
  "timestamp": "2025-09-22T23:30:00.000Z"
}
```

## 📝 JavaScript пример

```javascript
// Новый способ - автоматическая проверка зоны
async function calculateDelivery(coordinates, order) {
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key',
      'Authorization': 'Basic ' + btoa('username:password')
    },
    body: JSON.stringify({
      lat: coordinates.lat,
      lon: coordinates.lon,
      order: order
      // zoneInfo не нужен - проверяется автоматически
    })
  });
  
  return await response.json();
}

// Использование
const result = await calculateDelivery(
  { lat: 48.480223, lon: 135.071917 },
  { weight: 1500, volume: 7, cost: 50000 }
);

if (result.error) {
  console.log('Ошибка:', result.message);
  console.log('Зона:', result.zoneInfo);
} else {
  console.log('Стоимость доставки:', result.delivery_cost);
  console.log('Время доставки:', result.delivery_time);
  console.log('Экспресс доставка:', result.express_delivery_cost);
}
```

## ⚡ Преимущества нового подхода

1. **Простота**: Один запрос вместо двух
2. **Надежность**: API сам проверяет зону доставки
3. **Производительность**: Меньше сетевых запросов
4. **Совместимость**: Старый код продолжает работать
5. **Централизация**: Вся логика в одном месте
