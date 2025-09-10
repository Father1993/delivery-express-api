import request from 'supertest'
import { createTestApp } from '../app'

// Загружаем настройки тестов и моки
import '../setup'
import '../mocks/services'

describe('API проверки зоны', () => {
    const app = createTestApp()

    // Хелпер для создания запроса с авторизацией
    const makeAuthRequest = () => {
        const authString = Buffer.from('test_user:test_password').toString(
            'base64'
        )

        return request(app)
            .post('/api/zone')
            .set('Authorization', `Basic ${authString}`)
            .set('x-api-key', 'test_api_key')
    }

    test('требует авторизацию', async () => {
        const response = await request(app).post('/api/zone').send({})

        expect(response.status).toBe(401)
    })

    test('возвращает информацию о зоне', async () => {
        const response = await makeAuthRequest().send({
            coordinates: { lat: 55.7558, lon: 37.6173 },
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('inZone')
    })
})
