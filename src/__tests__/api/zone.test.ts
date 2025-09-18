import request from 'supertest'
import { createTestApp } from '../app'
import { makeAuthRequest, TEST_COORDINATES } from '../helpers'

// Загружаем настройки тестов и моки
import '../setup'
import '../mocks/services'

describe('API проверки зоны', () => {
    const app = createTestApp()

    test('требует авторизацию', async () => {
        const response = await request(app).post('/api/zone').send({})
        expect(response.status).toBe(401)
    })

    test('возвращает информацию о зоне (в зоне)', async () => {
        const response = await makeAuthRequest(app, 'zone').send({
            coordinates: TEST_COORDINATES.IN_ZONE,
        })

        expect(response.status).toBe(200)
        expect(response.body.inZone).toBe(true)
        expect(response.body.zoneName).toBe('Центр Хабаровска')
    })

    test('возвращает информацию о зоне (вне зоны)', async () => {
        const response = await makeAuthRequest(app, 'zone').send({
            coordinates: TEST_COORDINATES.OUT_OF_ZONE,
        })

        expect(response.status).toBe(200)
        expect(response.body.inZone).toBe(false)
    })
})
