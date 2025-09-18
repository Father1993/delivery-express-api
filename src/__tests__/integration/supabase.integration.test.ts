import { checkDeliveryZone } from '@services/zoneService'
import { TEST_COORDINATES } from '../helpers'

describe('Интеграционные тесты Supabase', () => {
    // Эти тесты запускаются только если установлена переменная RUN_INTEGRATION_TESTS
    const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true'
    if (!shouldRunIntegrationTests) {
        test.skip('Интеграционные тесты пропущены (установите RUN_INTEGRATION_TESTS=true)', () => {})
        return
    }

    test('реальный запрос к Supabase (в зоне)', async () => {
        // Используем стандартные тестовые координаты в зоне
        const coordinates = TEST_COORDINATES.IN_ZONE
        const result = await checkDeliveryZone(coordinates)
        expect(result.inZone).toBe(true)
        expect(result.zoneName).toBeDefined()
    }, 10000)

    test('реальный запрос к Supabase (вне зоны)', async () => {
        // Используем стандартные тестовые координаты вне зоны
        const coordinates = TEST_COORDINATES.OUT_OF_ZONE
        const result = await checkDeliveryZone(coordinates)
        expect(result.inZone).toBe(false)
    }, 10000)
})
