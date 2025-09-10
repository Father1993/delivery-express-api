import {
    Coordinates,
    DeliveryCalculationRequest,
    DeliveryCalculationResponse,
    ZoneInfo,
} from '@/models/deliveryData'

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
    return {
        inZone: true,
        zoneName: 'Тестовая зона',
    }
}

// Настройка моков для Jest
jest.mock('@services/calculationService', () => ({
    calculateDelivery: jest.fn().mockImplementation(mockCalculateDelivery),
}))

jest.mock('@services/zoneService', () => ({
    checkDeliveryZone: jest.fn().mockImplementation(mockCheckDeliveryZone),
}))
