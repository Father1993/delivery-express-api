import request from 'supertest'
import { createTestApp } from '../app'

// Загружаем настройки тестов и моки
import '../setup'
import '../mocks/services'

describe('API расчета доставки', () => {
    const app = createTestApp()

    // Хелпер для создания запроса с авторизацией
    const makeAuthRequest = () => {
        const authString = Buffer.from('test_user:test_password').toString(
            'base64'
        )

        return request(app)
            .post('/api/calculate')
            .set('Authorization', `Basic ${authString}`)
            .set('x-api-key', 'test_api_key')
    }

    test('требует авторизацию', async () => {
        const response = await request(app).post('/api/calculate').send({})

        expect(response.status).toBe(401)
    })

    test('рассчитывает стоимость доставки', async () => {
        const response = await makeAuthRequest().send({
            coordinates: { lat: 55.7558, lon: 37.6173 },
            order: { weight: 5, cost: 1000 },
            zoneInfo: { inZone: true, zoneName: 'Тестовая зона' },
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('delivery_cost')
    })
})
