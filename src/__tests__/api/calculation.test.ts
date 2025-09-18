import request from 'supertest'
import { createTestApp } from '../app'
import { makeAuthRequest, TEST_COORDINATES } from '../helpers'
import '../setup'
import '../mocks/services'

describe('API расчета доставки', () => {
    const app = createTestApp()

    test('требует авторизацию', async () => {
        const response = await request(app).post('/api/calculate').send({})
        expect(response.status).toBe(401)
    })

    test('рассчитывает стоимость доставки', async () => {
        const response = await makeAuthRequest(app, 'calculate').send({
            coordinates: TEST_COORDINATES.IN_ZONE,
            order: { weight: 5, cost: 1000 },
            zoneInfo: { inZone: true, zoneName: 'Центр Хабаровска' },
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('delivery_cost')
        expect(response.body.delivery_cost).toBeGreaterThan(0)
        expect(response.body).toHaveProperty('delivery_time')
    })

    test('отклоняет запрос для адреса вне зоны', async () => {
        const response = await makeAuthRequest(app, 'calculate').send({
            coordinates: TEST_COORDINATES.OUT_OF_ZONE,
            order: { weight: 5, cost: 1000 },
            zoneInfo: { inZone: false },
        })

        expect(response.status).toBe(400)
        expect(response.body.error).toBe(true)
        expect(response.body.message).toContain('вне зоны доставки')
    })
})
