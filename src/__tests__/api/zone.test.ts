import request from 'supertest'
import { createTestApp } from '../app'

// Загружаем настройки тестов и моки
import '../setup'
import '../mocks/services'

describe('API проверки зоны', () => {
    const app = createTestApp()

    // Хелпер для создания запроса с авторизацией
    const makeAuthRequest = () => {
        const authString = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString(
            'base64'
        )
        return request(app)
            .post('/api/zone')
            .set('Authorization', `Basic ${authString}`)
            .set('x-api-key', process.env.API_KEY_CS_CART || '')
    }

    test('требует авторизацию', async () => {
        const response = await request(app).post('/api/zone').send({})
        expect(response.status).toBe(401)
    })

    test('возвращает информацию о зоне (в зоне)', async () => {
        const response = await makeAuthRequest().send({
            coordinates: { lat: 48.5, lon: 135.1 }, // Координаты в зоне доставки
        })

        expect(response.status).toBe(200)
        expect(response.body.inZone).toBe(true)
        expect(response.body.zoneName).toBe('Центр Хабаровска')
    })

    test('возвращает информацию о зоне (вне зоны)', async () => {
        const response = await makeAuthRequest().send({
            coordinates: { lat: 55.7558, lon: 37.6173 }, // Москва - вне зоны
        })

        expect(response.status).toBe(200)
        expect(response.body.inZone).toBe(false)
    })
})
