import request from 'supertest'
import { createTestApp } from '../app'
import '../setup'
import '../mocks/services'

describe('API расчета доставки', () => {
    const app = createTestApp()

    // Хелпер для создания запроса с авторизацией
    const makeAuthRequest = () => {
        const authString = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString(
            'base64'
        )
        return request(app)
            .post('/api/calculate')
            .set('Authorization', `Basic ${authString}`)
            .set('x-api-key', process.env.API_KEY_CS_CART || '')
    }

    test('требует авторизацию', async () => {
        const response = await request(app).post('/api/calculate').send({})
        expect(response.status).toBe(401)
    })

    test('рассчитывает стоимость доставки', async () => {
        const response = await makeAuthRequest().send({
            coordinates: { lat: 48.5, lon: 135.1 }, // Координаты в зоне
            order: { weight: 5, cost: 1000 },
            zoneInfo: { inZone: true, zoneName: 'Центр Хабаровска' },
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('delivery_cost')
        expect(response.body.delivery_cost).toBeGreaterThan(0)
        expect(response.body).toHaveProperty('delivery_time')
    })

    test('отклоняет запрос для адреса вне зоны', async () => {
        const response = await makeAuthRequest().send({
            coordinates: { lat: 55.7558, lon: 37.6173 }, // Москва - вне зоны
            order: { weight: 5, cost: 1000 },
            zoneInfo: { inZone: false },
        })

        expect(response.status).toBe(400)
        expect(response.body.error).toBe(true)
        expect(response.body.message).toContain('вне зоны доставки')
    })
})
