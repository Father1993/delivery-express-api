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
                order: { weight: 500, cost: 10000 }
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
                order: { weight: 500, cost: 10000 },
                zoneInfo: { inZone: true, zoneName: 'Тестовая зона' }
            }
            const result = calculateDelivery(request)
            expect(result).toHaveProperty('delivery_cost')
            expect(typeof result.delivery_cost).toBe('number')
        })

        test('рассчитывает экспресс доставку', () => {
            const request: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 1000, cost: 15000 }
            }
            const result = calculateDelivery(request)
            expect(result).toHaveProperty('express_delivery_cost')
            expect(result.express_delivery_cost).toBeGreaterThan(result.delivery_cost)
            expect(result.options?.[0].name).toBe('Экспресс доставка')
            expect(result.options?.[0].cost).toBe(result.express_delivery_cost)
        })

        test('учитывает объем при расчете загрузки', () => {
            // Малый вес, но большой объем
            const request1: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 100, volume: 8, cost: 5000 }
            }
            // Большой вес, но малый объем
            const request2: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 1800, volume: 2, cost: 5000 }
            }
            const result1 = calculateDelivery(request1)
            const result2 = calculateDelivery(request2)
            // Оба должны иметь схожую стоимость, так как загрузка близка к максимальной
            expect(Math.abs(result1.delivery_cost - result2.delivery_cost)).toBeLessThan(100)
        })
        
        test('проверка расчета с данными из примера', () => {
            const request: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 0.1, volume: 0.1, cost: 10000 }
            }
            const result = calculateDelivery(request)
            expect(result.delivery_cost).toBe(700)
            expect(result.express_delivery_cost).toBe(800)
        })

        test('увеличивает количество рейсов при превышении грузоподъемности', () => {
            const request: DeliveryCalculationRequest = {
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 2500, cost: 20000 } // Больше грузоподъемности (2000 кг)
            }
            const result = calculateDelivery(request)
            expect(result.delivery_time).toContain('2-3') // Ожидаем 2 рейса
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
