import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'

dotenv.config()

// API ключ из переменной окружения
const API_KEY = process.env.API_KEY_CS_CART as string

/**
 * Middleware для проверки API ключа
 */
export const validateApiKey = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({
            error: true,
            message: 'Неверный или отсутствующий API ключ',
        })
    }
    next()
}

/**
 * Middleware для Basic Authentication
 */
export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    const username = process.env.API_USERNAME
    const password = process.env.API_PASSWORD

    // Проверяем, настроены ли учетные данные
    if (!username || !password) {
        console.warn(
            'Basic Auth не настроен! Проверьте переменные окружения API_USERNAME и API_PASSWORD.'
        )
        return next()
    }

    // Получаем заголовок Authorization
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res
            .status(401)
            .set('WWW-Authenticate', 'Basic realm="API Access"')
            .json({
                error: true,
                message: 'Требуется Basic Authentication',
            })
    }

    // Обрабатываем заголовок
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':')
    const user = auth[0]
    const pass = auth[1]

    // Проверяем учетные данные
    if (user !== username || pass !== password) {
        return res
            .status(401)
            .set('WWW-Authenticate', 'Basic realm="API Access"')
            .json({
                error: true,
                message: 'Неверные учетные данные',
            })
    }

    next()
}

/**
 * Комбинированный middleware для защиты API
 */
export const apiProtection = [basicAuth, validateApiKey]
