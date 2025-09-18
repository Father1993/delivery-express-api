import express, { Request, Response } from 'express'
import { checkDeliveryZone } from '@services/zoneService'
import { apiProtection } from '@middleware/auth'
import { logger } from '@utils/logger'

const router = express.Router()

const checkZoneHandler = async (req: Request, res: Response) => {
    const coordinates = req.body.coordinates
    
    logger.info('Получен запрос на проверку зоны доставки', { coordinates })

    if (
        !coordinates ||
        typeof coordinates.lat !== 'number' ||
        typeof coordinates.lon !== 'number'
    ) {
        logger.warn('Некорректные координаты в запросе', { coordinates })
        return res.status(400).json({
            error: true,
            message: 'Необходимо указать корректные координаты (lat, lon)',
        })
    }

    try {
        const zoneCheck = await checkDeliveryZone(coordinates)
        
        const response = {
            ...zoneCheck,
            timestamp: new Date().toISOString(),
        }
        
        if (zoneCheck.inZone) {
            logger.info(`Успешная проверка зоны: ${zoneCheck.zoneName}`)
        } else {
            logger.info('Адрес вне зоны доставки', { coordinates })
        }
        
        return res.json(response)
    } catch (err: any) {
        logger.error('Ошибка при проверке зоны доставки', { 
            error: err.message,
            stack: err.stack,
            coordinates 
        })
        
        return res.status(500).json({
            error: true,
            message: 'Ошибка при проверке зоны доставки',
        })
    }
}

router.post('/', apiProtection, checkZoneHandler)

export default router
