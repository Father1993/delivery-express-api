import request from 'supertest'
import { Express } from 'express'

/**
 * Создает авторизованный запрос для API тестов
 */
export const makeAuthRequest = (app: Express, endpoint: string) => {
    const authString = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString(
        'base64'
    )
    return request(app)
        .post(`/api/${endpoint}`)
        .set('Authorization', `Basic ${authString}`)
        .set('x-api-key', process.env.API_KEY_CS_CART || '')
}

/**
 * Тестовые координаты для проверки зон
 */
export const TEST_COORDINATES = {
    IN_ZONE: { lat: 48.5, lon: 135.1 },       // В зоне доставки (Хабаровск)
    OUT_OF_ZONE: { lat: 55.7558, lon: 37.6173 } // Вне зоны доставки (Москва)
}
