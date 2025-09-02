import express, { Request, Response } from 'express'
import { calculateDelivery } from '@services/calculationService'
import { DeliveryCalculationRequest } from '@models/deliveryData'

const router = express.Router()

const API_KEYS: Record<string, boolean> = {
    [process.env.API_KEY_CS_CART as string]: true,
}

// Middleware для проверки API ключа
const validateApiKey = (
    req: Request,
    res: Response,
    next: express.NextFunction
) => {
    const apiKey = req.headers['x-api-key'] as string
    if (!apiKey || !API_KEYS[apiKey]) {
        return res.status(401).json({
            error: true,
            message: 'Неверный или отсутствующий API ключ',
        })
    }
    next()
}

// Middleware для Basic Authentication
const basicAuth = (req: Request, res: Response, next: express.NextFunction) => {
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

// Middleware для защиты API - комбинируем Basic Auth и API Key
const apiProtection = [basicAuth, validateApiKey]

// Валидации запроса
const validateCalculationRequest = (
    data: any
): { isValid: boolean; error?: string } => {
    // Проверка наличия необходимых полей
    if (!data || !data.coordinates || !data.order) {
        return { isValid: false, error: 'Отсутствуют обязательные поля' }
    }

    // Проверка координат
    const { lat, lon } = data.coordinates
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        return {
            isValid: false,
            error: 'Широта должна быть числом в диапазоне от -90 до 90',
        }
    }
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
        return {
            isValid: false,
            error: 'Долгота должна быть числом в диапазоне от -180 до 180',
        }
    }

    // Проверка данных заказа
    const { weight, cost } = data.order
    if (typeof weight !== 'number' || weight <= 0) {
        return { isValid: false, error: 'Вес должен быть положительным числом' }
    }
    if (typeof cost !== 'number' || cost < 0) {
        return {
            isValid: false,
            error: 'Стоимость должна быть неотрицательным числом',
        }
    }

    return { isValid: true }
}

// Обработчик расчета доставки
const calculateHandler = (req: Request, res: Response) => {
    let data: any

    // Проверяем метод запроса и извлекаем данные соответствующим образом
    if (req.method === 'POST') {
        // Для POST получаем данные из тела запроса
        data = req.body
    } else if (req.method === 'GET') {
        // Для GET пытаемся получить JSON из query параметра 'data'
        try {
            const jsonData = req.query.data
            if (typeof jsonData === 'string') {
                data = JSON.parse(jsonData)
            } else {
                return res.status(400).json({
                    error: true,
                    message:
                        'Для GET запроса необходим параметр data с JSON данными',
                })
            }
        } catch (e) {
            return res.status(400).json({
                error: true,
                message: 'Некорректный JSON в параметре data',
            })
        }
    }

    // Валидация запроса
    const validation = validateCalculationRequest(data)

    if (!validation.isValid) {
        return res.status(400).json({
            error: true,
            message: validation.error,
        })
    }

    try {
        // Расчет доставки
        const result = calculateDelivery(data as DeliveryCalculationRequest)

        // Логирование успешного запроса
        console.log(
            `Расчет для координат: ${data.coordinates.lat},${data.coordinates.lon} - Стоимость: ${result.delivery_cost}`
        )

        // Возвращаем результат
        return res.json(result)
    } catch (err) {
        console.error('Ошибка при расчете доставки:', err)
        return res.status(500).json({
            error: true,
            message: 'Ошибка при расчете доставки',
        })
    }
}

// POST /api/calculate - Расчет стоимости доставки (POST)
router.post('/calculate', apiProtection, calculateHandler)
// GET /api/calculate - Расчет стоимости доставки (GET)
router.get('/calculate', apiProtection, calculateHandler)
// GET /api/test - Тестовый метод для проверки доступности API
router.get('/test', apiProtection, (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'API доступен и защищен',
        timestamp: new Date().toISOString(),
    })
})

export default router
