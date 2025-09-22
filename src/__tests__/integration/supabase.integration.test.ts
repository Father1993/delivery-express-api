import { checkDeliveryZone } from '@services/zoneService'
import { calculateDelivery } from '@services/calculationService'
import { TEST_COORDINATES } from '../helpers'

describe('Интеграционные тесты Supabase', () => {
    // Эти тесты запускаются только если установлена переменная RUN_INTEGRATION_TESTS
    const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true'
    if (!shouldRunIntegrationTests) {
        test.skip('Интеграционные тесты пропущены (установите RUN_INTEGRATION_TESTS=true)', () => {})
        return
    }

    describe('Проверка зон доставки', () => {
        test('реальный запрос к Supabase (в зоне)', async () => {
            const coordinates = TEST_COORDINATES.IN_ZONE
            const result = await checkDeliveryZone(coordinates)
            expect(result.inZone).toBe(true)
            expect(result.zoneName).toBeDefined()
        }, 10000)

        test('реальный запрос к Supabase (вне зоны)', async () => {
            const coordinates = TEST_COORDINATES.OUT_OF_ZONE
            const result = await checkDeliveryZone(coordinates)
            expect(result.inZone).toBe(false)
        }, 10000)
    })

    describe('Полный цикл расчета доставки', () => {
        test('автоматическая проверка зоны + расчет доставки (в зоне)', async () => {
            // Проверяем зону
            const zoneResult = await checkDeliveryZone(TEST_COORDINATES.IN_ZONE)
            expect(zoneResult.inZone).toBe(true)

            // Рассчитываем доставку
            const calculationResult = calculateDelivery({
                ...TEST_COORDINATES.IN_ZONE,
                order: { weight: 2.5, cost: 3000 }
            })

            expect(calculationResult).toHaveProperty('delivery_cost')
            expect(calculationResult.delivery_cost).toBeGreaterThan(0)
            expect(calculationResult).toHaveProperty('delivery_time')
        }, 10000)

        test('автоматическая проверка зоны + расчет доставки (вне зоны)', async () => {
            // Проверяем зону
            const zoneResult = await checkDeliveryZone(TEST_COORDINATES.OUT_OF_ZONE)
            expect(zoneResult.inZone).toBe(false)
            expect(zoneResult.error).toBeDefined()

            // В реальном API здесь должен быть возврат ошибки 400
            // Но для тестирования сервиса мы просто проверяем, что зона не найдена
        }, 10000)
    })
})
