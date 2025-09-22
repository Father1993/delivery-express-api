import {
    Coordinates,
    DeliveryCalculationRequest,
    DeliveryCalculationResponse,
    ZoneInfo,
} from '@models/deliveryData'

// Мок для сервиса расчета доставки
export const mockCalculateDelivery = (
    data: DeliveryCalculationRequest
): DeliveryCalculationResponse => {
    // Простой расчет для тестов
    const baseCost = 150
    const weightCost = data.order.weight * 5
    const distanceCost = 10 // Фиксированное расстояние для тестов
    let totalCost = baseCost + weightCost + distanceCost

    // Применяем скидку для дорогих заказов
    if (data.order.cost > 5000) {
        totalCost *= 0.9
    }

    return {
        delivery_cost: Math.round(totalCost),
        delivery_time: '1-2 дня',
        options: [
            {
                name: 'Экспресс доставка',
                cost: Math.round(totalCost * 1.5),
                description: 'Доставка в течение 3-5 часов',
            },
        ],
    }
}

// Мок для сервиса проверки зоны
export const mockCheckDeliveryZone = async (
    coordinates: Coordinates
): Promise<ZoneInfo> => {
    // Простая логика проверки зоны для тестов
    const isInZone = coordinates.lat >= 48.4 && coordinates.lat <= 48.6 && 
                    coordinates.lon >= 135.0 && coordinates.lon <= 135.2
    
    if (isInZone) {
        return {
            inZone: true,
            zoneName: 'Центр Хабаровска',
        }
    } else {
        return {
            inZone: false,
            error: 'Адрес находится вне зоны доставки'
        }
    }
}

// Настройка моков для Jest
jest.mock('@services/calculationService', () => ({
    calculateDelivery: jest.fn().mockImplementation(mockCalculateDelivery),
}))
jest.mock('@services/zoneService', () => ({
    checkDeliveryZone: jest.fn().mockImplementation(mockCheckDeliveryZone),
}))
