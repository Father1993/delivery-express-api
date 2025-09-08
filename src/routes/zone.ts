/**
 * API маршруты для проверки зоны доставки
 */
import express, { Request, Response } from 'express'
import { checkDeliveryZone } from '@services/zoneService'
import { apiProtection } from '@middleware/auth'

const router = express.Router()

/**
 * Обработчик для проверки зоны доставки
 *
 * Принимает координаты и проверяет, находятся ли они в зоне доставки
 * Возвращает информацию о зоне доставки, которую нужно включить в запрос на расчет
 *
 * @route POST /api/zone/check
 * @param {Object} req.body.coordinates - Координаты для проверки {lat, lon}
 * @returns {Object} Информация о зоне доставки
 */
const checkZoneHandler = async (req: Request, res: Response) => {
    const coordinates = req.body.coordinates

    // Проверка наличия координат
    if (
        !coordinates ||
        typeof coordinates.lat !== 'number' ||
        typeof coordinates.lon !== 'number'
    ) {
        return res.status(400).json({
            error: true,
            message: 'Необходимо указать корректные координаты (lat, lon)',
        })
    }

    try {
        // Проверка зоны доставки через Supabase
        const zoneCheck = await checkDeliveryZone(coordinates)

        // Возвращаем результат проверки
        return res.json({
            ...zoneCheck,
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        console.error('Ошибка при проверке зоны доставки:', err)
        return res.status(500).json({
            error: true,
            message: 'Ошибка при проверке зоны доставки',
        })
    }
}

// POST /api/zone/ - Проверка зоны доставки
router.post('/', apiProtection, checkZoneHandler)

export default router
