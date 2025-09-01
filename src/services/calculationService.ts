import {
    DeliveryCalculationRequest,
    DeliveryCalculationResponse,
} from '@models/deliveryData'

// Базовые тарифы
const BASE_DELIVERY_COST = 150 // Базовая стоимость доставки
const COST_PER_KM = 10 // Стоимость за километр
const WEIGHT_MULTIPLIER = 5 // Множитель стоимости за кг веса

// Базовые координаты (центр доставки)
const BASE_COORDINATES = {
    lat: 48.480223,
    lon: 135.071917,
}

/**
 * Простой расчет расстояния между двумя точками (имитация)
 * В реальном проекте здесь может быть более сложная логика
 */
const calculateDistance = (
    point1: { lat: number; lon: number },
    point2: { lat: number; lon: number }
): number => {
    // Простая формула для демонстрации
    const latDiff = Math.abs(point1.lat - point2.lat)
    const lonDiff = Math.abs(point1.lon - point2.lon)

    // Приблизительное расстояние в км (для демонстрации)
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 100
}

/**
 * Расчет стоимости доставки на основе координат и данных заказа
 */
export const calculateDelivery = (
    data: DeliveryCalculationRequest
): DeliveryCalculationResponse => {
    const { coordinates, order } = data

    // Расчет расстояния в километрах (упрощенно)
    const distanceInKm = calculateDistance(BASE_COORDINATES, coordinates)

    // Расчет стоимости доставки
    let deliveryCost = BASE_DELIVERY_COST + distanceInKm * COST_PER_KM

    // Учет веса заказа
    deliveryCost += order.weight * WEIGHT_MULTIPLIER

    // Учет стоимости заказа (например, если заказ дорогой - доставка дешевле)
    if (order.cost > 5000) {
        deliveryCost = deliveryCost * 0.9 // Скидка 10% на доставку
    }

    // Определение времени доставки в зависимости от расстояния
    let deliveryTime = '1-2 дня'
    if (distanceInKm > 10) {
        deliveryTime = '2-3 дня'
    }
    if (distanceInKm > 30) {
        deliveryTime = '3-5 дней'
    }

    // Формирование ответа
    const response: DeliveryCalculationResponse = {
        delivery_cost: Math.round(deliveryCost), // Округляем до целого числа
        delivery_time: deliveryTime,
    }

    // Добавление опциональных вариантов доставки
    if (distanceInKm < 20) {
        response.options = [
            {
                name: 'Экспресс доставка',
                cost: Math.round(deliveryCost * 1.5),
                description: 'Доставка в течение 3-5 часов',
            },
        ]
    }

    return response
}
