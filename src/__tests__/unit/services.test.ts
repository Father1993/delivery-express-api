import { calculateDelivery } from '@services/calculationService'
import { checkDeliveryZone } from '@services/zoneService'
import { DeliveryCalculationRequest } from '@models/deliveryData'
import { TEST_COORDINATES } from '../helpers'
import '../setup'

describe('Сервисы', () => {
    describe('Сервис расчета доставки', () => {
        test('рассчитывает стоимость доставки без zoneInfo', () => {
            const request: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 5, cost: 1000 }
                // zoneInfo не передаем - теперь это опционально
            }
            const result = calculateDelivery(request)
            expect(result).toHaveProperty('delivery_cost')
            expect(typeof result.delivery_cost).toBe('number')
            expect(result.delivery_cost).toBeGreaterThan(0)
        })

        test('рассчитывает стоимость доставки с zoneInfo (обратная совместимость)', () => {
            const request: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 5, cost: 1000 },
                zoneInfo: { inZone: true, zoneName: 'Тестовая зона' }
            }
            const result = calculateDelivery(request)
            expect(result).toHaveProperty('delivery_cost')
            expect(typeof result.delivery_cost).toBe('number')
        })

        test('увеличивает стоимость при увеличении веса', () => {
            const request1: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 1, cost: 1000 }
            }
            const request2: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 10, cost: 1000 }
            }
            const result1 = calculateDelivery(request1)
            const result2 = calculateDelivery(request2)
            expect(result2.delivery_cost).toBeGreaterThan(result1.delivery_cost)
        })

        test('применяет скидку для дорогих заказов', () => {
            const cheapOrder: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 5, cost: 1000 }
            }
            const expensiveOrder: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 5, cost: 6000 }
            }
            const result1 = calculateDelivery(cheapOrder)
            const result2 = calculateDelivery(expensiveOrder)
            expect(result2.delivery_cost).toBeLessThan(result1.delivery_cost)
        })
    })

    describe('Сервис проверки зоны', () => {
        test('проверяет зону доставки (в зоне)', async () => {
            const coordinates = TEST_COORDINATES.IN_ZONE
            const result = await checkDeliveryZone(coordinates)
            expect(result).toHaveProperty('inZone')
            expect(result.inZone).toBe(true)
            expect(result.zoneName).toBe('Центр Хабаровска')
        })
        
        test('проверяет зону доставки (вне зоны)', async () => {
            const coordinates = TEST_COORDINATES.OUT_OF_ZONE
            const result = await checkDeliveryZone(coordinates)
            expect(result).toHaveProperty('inZone')
            expect(result.inZone).toBe(false)
            expect(result.error).toBe('Адрес находится вне зоны доставки')
        })
    })
})
