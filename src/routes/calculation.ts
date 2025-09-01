import express, { Request, Response } from 'express'
import { calculateDelivery } from '@services/calculationService'
import { DeliveryCalculationRequest } from '@models/deliveryData'

const router = express.Router()

// API ключи (в реальном приложении должны храниться в базе данных или защищенном хранилище)
const API_KEYS: Record<string, boolean> = {
    'cs-cart-delivery': true, // ключ для CS-Cart
    'test-api-key': true, // тестовый ключ для разработки
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

// Функция валидации запроса
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

// POST /api/calculate - Расчет стоимости доставки
router.post('/calculate', validateApiKey, (req: Request, res: Response) => {
    // Валидация запроса
    const validation = validateCalculationRequest(req.body)

    if (!validation.isValid) {
        return res.status(400).json({
            error: true,
            message: validation.error,
        })
    }

    try {
        // Расчет доставки
        const result = calculateDelivery(req.body as DeliveryCalculationRequest)

        // Логирование успешного запроса
        console.log(
            `Расчет для координат: ${req.body.coordinates.lat},${req.body.coordinates.lon} - Стоимость: ${result.delivery_cost}`
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
})

// GET /api/test - Тестовый метод для проверки доступности API
router.get('/test', validateApiKey, (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'API доступен и защищен',
        timestamp: new Date().toISOString(),
    })
})

export default router
