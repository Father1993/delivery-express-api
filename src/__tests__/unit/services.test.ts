import { calculateDelivery } from '@services/calculationService'
import { checkDeliveryZone } from '@services/zoneService'
import { DeliveryCalculationRequest } from '@models/deliveryData'
import { TEST_COORDINATES } from '../helpers'
import '../setup'

describe('Сервисы', () => {
    describe('Сервис расчета доставки', () => {
        test('рассчитывает стоимость доставки', () => {
            const request: DeliveryCalculationRequest = {
                coordinates: TEST_COORDINATES.OUT_OF_ZONE,
                order: { weight: 5, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Тестовая зона' },
            }
            const result = calculateDelivery(request)
            expect(result).toHaveProperty('delivery_cost')
            expect(typeof result.delivery_cost).toBe('number')
        })

        test('увеличивает стоимость при увеличении веса', () => {
            const request1 = {
                coordinates: TEST_COORDINATES.OUT_OF_ZONE,
                order: { weight: 1, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Центр' },
            }
            const request2 = {
                coordinates: TEST_COORDINATES.OUT_OF_ZONE,
                order: { weight: 10, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Центр' },
            }
            const result1 = calculateDelivery(request1)
            const result2 = calculateDelivery(request2)
            expect(result2.delivery_cost).toBeGreaterThan(result1.delivery_cost)
        })
    })

    describe('Сервис проверки зоны', () => {
        test('проверяет зону доставки (в зоне)', async () => {
            const coordinates = TEST_COORDINATES.IN_ZONE // В зоне доставки
            const result = await checkDeliveryZone(coordinates)
            expect(result).toHaveProperty('inZone')
            expect(result.inZone).toBe(true)
            expect(result.zoneName).toBe('Центр Хабаровска')
        })
        test('проверяет зону доставки (вне зоны)', async () => {
            const coordinates = TEST_COORDINATES.OUT_OF_ZONE // Москва - вне зоны
            const result = await checkDeliveryZone(coordinates)
            expect(result).toHaveProperty('inZone')
            expect(result.inZone).toBe(false)
            expect(result.error).toBe('Адрес находится вне зоны доставки')
        })
    })
})
