import { validateApiKey, basicAuth } from '@middleware/auth'
import { Request, Response, NextFunction } from 'express'
import '../setup'

describe('Middleware авторизации', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let nextFunction: NextFunction

    beforeEach(() => {
        if (!process.env.API_USERNAME || !process.env.API_PASSWORD || !process.env.API_KEY_CS_CART) {
            console.warn('⚠️ Тестовые переменные окружения не найдены в .env.test')
        }
        mockRequest = { headers: {} }
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            set: jest.fn().mockReturnThis(),
        }
        nextFunction = jest.fn()
    })

    describe('validateApiKey', () => {
        test('пропускает запрос с правильным API ключом', () => {
            mockRequest.headers = { 'x-api-key': process.env.API_KEY_CS_CART }
            validateApiKey(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            )

            expect(nextFunction).toHaveBeenCalled()
        })

        test('возвращает ошибку с неверным API ключом', () => {
            mockRequest.headers = { 'x-api-key': 'wrong_key' }
            validateApiKey(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            )
            expect(mockResponse.status).toHaveBeenCalledWith(401)
        })
    })

    describe('basicAuth', () => {
        test('пропускает запрос с правильными учетными данными', () => {
            const authString = Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString(
                'base64'
            )
            mockRequest.headers = { authorization: `Basic ${authString}` }
            basicAuth(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            )
            expect(nextFunction).toHaveBeenCalled()
        })

        test('возвращает ошибку с неверными учетными данными', () => {
            const authString = Buffer.from('wrong:wrong').toString('base64')
            mockRequest.headers = { authorization: `Basic ${authString}` }
            basicAuth(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            )
            expect(mockResponse.status).toHaveBeenCalledWith(401)
        })
    })
})
