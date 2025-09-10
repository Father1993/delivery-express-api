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
    return {
        delivery_cost: 300, // Фиксированная стоимость для тестов
        delivery_time: '1-2 дня',
        options: [
            {
                name: 'Экспресс доставка',
                cost: 450,
                description: 'Доставка в течение 3-5 часов',
            },
        ],
    }
}

// Мок для сервиса проверки зоны
export const mockCheckDeliveryZone = async (
    coordinates: Coordinates
): Promise<ZoneInfo> => {
    // Используем ту же логику что и в setup.ts для согласованности
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
