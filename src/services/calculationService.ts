import {
    DeliveryCalculationRequest,
    DeliveryCalculationResponse,
} from '@models/deliveryData'
import { logger } from '@utils/logger'

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
    
    logger.debug('Начало расчета доставки', { coordinates, order })

    // Расчет расстояния в километрах (упрощенно)
    const distanceInKm = calculateDistance(BASE_COORDINATES, coordinates)
    logger.debug(`Расстояние: ${distanceInKm.toFixed(2)} км`)

    // Расчет стоимости доставки
    let deliveryCost = BASE_DELIVERY_COST + distanceInKm * COST_PER_KM

    // Учет веса заказа
    deliveryCost += order.weight * WEIGHT_MULTIPLIER
    logger.debug(`Стоимость после учета веса: ${deliveryCost.toFixed(2)} руб.`)

    // Учет стоимости заказа (например, если заказ дорогой - доставка дешевле)
    if (order.cost > 5000) {
        const oldCost = deliveryCost
        deliveryCost = deliveryCost * 0.9 // Скидка 10% на доставку
        logger.debug(`Применена скидка 10%: ${oldCost.toFixed(2)} → ${deliveryCost.toFixed(2)} руб.`)
    }

    // Определение времени доставки в зависимости от расстояния
    let deliveryTime = '1-2 дня'
    if (distanceInKm > 10) {
        deliveryTime = '2-3 дня'
    }
    if (distanceInKm > 30) {
        deliveryTime = '3-5 дней'
    }
    logger.debug(`Время доставки: ${deliveryTime}`)

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
        logger.debug('Добавлена опция экспресс-доставки')
    }

    logger.info(`Расчет доставки завершен: ${response.delivery_cost} руб., ${response.delivery_time}`)
    return response
}
