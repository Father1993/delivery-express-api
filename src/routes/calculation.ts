/**
 * API маршруты для расчета доставки
 *
 * Процесс работы с API:
 * 1. Вызвать POST /api/zone/check с координатами для проверки возможности доставки
 * 2. Если зона доставки доступна, использовать полученную информацию в запросе к POST /api/calculate
 *
 * Раздельные эндпоинты позволяют:
 * - Проверять зону доставки отдельно от расчета
 * - Кэшировать результаты проверки зоны на стороне клиента
 * - Строить более гибкую логику в клиентском приложении
 */

import express, { Request, Response } from 'express'
import { calculateDelivery } from '@services/calculationService'
import { DeliveryCalculationRequest } from '@models/deliveryData'
import { apiProtection } from '@middleware/auth'

const router = express.Router()

// Валидации запроса
const validateCalculationRequest = (
    data: any
): { isValid: boolean; error?: string } => {
    // Проверка наличия необходимых полей
    if (!data || !data.coordinates || !data.order || !data.zoneInfo) {
        return {
            isValid: false,
            error: 'Отсутствуют обязательные поля (coordinates, order, zoneInfo)',
        }
    }

    // Проверка зоны доставки
    if (!data.zoneInfo.inZone) {
        return { isValid: false, error: 'Адрес находится вне зоны доставки' }
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

/**
 * Обработчик расчета доставки
 *
 * Важно: Перед вызовом этого метода нужно получить информацию о зоне доставки
 * через /api/check-zone и включить её в запрос
 *
 * @route POST /api/calculate
 * @param {Object} req.body - Данные для расчета доставки
 * @param {Object} req.body.coordinates - Координаты доставки
 * @param {Object} req.body.order - Информация о заказе
 * @param {Object} req.body.zoneInfo - Информация о зоне доставки (из /api/check-zone)
 * @returns {Object} Результат расчета доставки
 */
const calculateHandler = async (req: Request, res: Response) => {
    // Получаем данные из тела запроса
    const data = req.body

    // Валидация запроса
    const validation = validateCalculationRequest(data)

    if (!validation.isValid) {
        return res.status(400).json({
            error: true,
            message: validation.error,
        })
    }

    try {
        // Расчет доставки с использованием предоставленной информации о зоне
        const result = calculateDelivery(data as DeliveryCalculationRequest)

        // Используем информацию о зоне из запроса
        result.zoneInfo = data.zoneInfo

        // Логирование успешного запроса
        console.log(
            `Расчет для координат: ${data.coordinates.lat},${data.coordinates.lon} - Зона: ${data.zoneInfo.zoneName} - Стоимость: ${result.delivery_cost}`
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

// API маршруты
router.post('/', apiProtection, calculateHandler) // POST /api/calculate
router.get('/test', apiProtection, (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'API доступен и защищен',
        timestamp: new Date().toISOString(),
    })
})
// GET /api/test - Тестовый метод для проверки доступности API
router.get('/test', apiProtection, (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'API доступен и защищен',
        timestamp: new Date().toISOString(),
    })
})

export default router
