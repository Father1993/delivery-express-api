import express, { Request, Response } from 'express'
import { checkDeliveryZone } from '@services/zoneService'
import { apiProtection } from '@middleware/auth'

const router = express.Router()

const checkZoneHandler = async (req: Request, res: Response) => {
    const coordinates = req.body.coordinates

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
        const zoneCheck = await checkDeliveryZone(coordinates)
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

router.post('/', apiProtection, checkZoneHandler)

export default router
