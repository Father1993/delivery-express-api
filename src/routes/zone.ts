import express, { Request, Response } from 'express'
import { checkDeliveryZone } from '@services/zoneService'
import { apiProtection } from '@middleware/auth'
import { logger } from '@utils/logger'

const router = express.Router()

const checkZoneHandler = async (req: Request, res: Response) => {
    const { lat, lon } = req.body
    
    logger.info('Получен запрос на проверку зоны доставки', { lat, lon  })

    if (
        typeof lat !== 'number' ||
        typeof lon !== 'number'
    ) {
        logger.warn('Некорректные координаты в запросе', { lat, lon  })
        return res.status(400).json({
            error: true,
            message: 'Необходимо указать корректные координаты (lat, lon)',
        })
    }

    try {
        const zoneCheck = await checkDeliveryZone({ lat, lon })
        
        const response = {
            ...zoneCheck,
            timestamp: new Date().toISOString(),
        }
        
        if (zoneCheck.inZone) {
            logger.info(`Успешная проверка зоны: ${zoneCheck.zoneName}`)
        } else {
            logger.info('Адрес вне зоны доставки', { lat, lon  })
        }
        
        return res.json(response)
    } catch (err: any) {
        logger.error('Ошибка при проверке зоны доставки', { 
            error: err.message,
            stack: err.stack,
            lat, lon  
        })
        
        return res.status(500).json({
            error: true,
            message: 'Ошибка при проверке зоны доставки',
        })
    }
}

router.post('/', apiProtection, checkZoneHandler)

export default router
