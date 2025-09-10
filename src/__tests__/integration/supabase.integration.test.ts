import { checkDeliveryZone } from '@services/zoneService'

describe('Интеграционные тесты Supabase', () => {
    // Эти тесты запускаются только если установлена переменная RUN_INTEGRATION_TESTS
    const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true'
    if (!shouldRunIntegrationTests) {
        test.skip('Интеграционные тесты пропущены (установите RUN_INTEGRATION_TESTS=true)', () => {})
        return
    }

    test('реальный запрос к Supabase (в зоне)', async () => {
        // Реальные координаты в зоне доставки Хабаровска
        const coordinates = { lat: 48.480223, lon: 135.071917 }
        const result = await checkDeliveryZone(coordinates)
        expect(result.inZone).toBe(true)
        expect(result.zoneName).toBeDefined()
    }, 10000)

    test('реальный запрос к Supabase (вне зоны)', async () => {
        // Координаты заведомо вне зоны доставки (Москва)
        const coordinates = { lat: 55.7558, lon: 37.6173 }
        const result = await checkDeliveryZone(coordinates)
        expect(result.inZone).toBe(false)
    }, 10000)
})
