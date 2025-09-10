import { calculateDelivery } from '@services/calculationService'
import { checkDeliveryZone } from '@services/zoneService'
import { DeliveryCalculationRequest } from '@models/deliveryData'

// Загружаем настройки тестов
import '../setup'

describe('Сервисы', () => {
    describe('Сервис расчета доставки', () => {
        test('рассчитывает стоимость доставки', () => {
            const request: DeliveryCalculationRequest = {
                coordinates: { lat: 55.7558, lon: 37.6173 },
                order: { weight: 5, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Тестовая зона' },
            }

            const result = calculateDelivery(request)

            expect(result).toHaveProperty('delivery_cost')
            expect(typeof result.delivery_cost).toBe('number')
        })

        test('увеличивает стоимость при увеличении веса', () => {
            const request1 = {
                coordinates: { lat: 55.7558, lon: 37.6173 },
                order: { weight: 1, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Центр' },
            }

            const request2 = {
                coordinates: { lat: 55.7558, lon: 37.6173 },
                order: { weight: 10, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Центр' },
            }

            const result1 = calculateDelivery(request1)
            const result2 = calculateDelivery(request2)

            expect(result2.delivery_cost).toBeGreaterThan(result1.delivery_cost)
        })
    })

    describe('Сервис проверки зоны', () => {
        test('проверяет зону доставки', async () => {
            const coordinates = { lat: 55.7558, lon: 37.6173 }

            const result = await checkDeliveryZone(coordinates)

            expect(result).toHaveProperty('inZone')
            expect(result.inZone).toBe(true)
        })
    })
})
