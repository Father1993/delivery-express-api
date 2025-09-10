import { validateApiKey, basicAuth } from '@middleware/auth'
import { Request, Response, NextFunction } from 'express'

// Загружаем настройки тестов
import '../setup'

describe('Middleware авторизации', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let nextFunction: NextFunction

    beforeEach(() => {
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
            mockRequest.headers = { 'x-api-key': 'test_api_key' }

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
            const authString = Buffer.from('test_user:test_password').toString(
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
