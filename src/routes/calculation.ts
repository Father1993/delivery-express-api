import express, { Request, Response } from 'express'
import { calculateDelivery } from '@services/calculationService'
import { DeliveryCalculationRequest } from '@models/deliveryData'
import { apiProtection } from '@middleware/auth'
import { logger } from '@utils/logger'

const router = express.Router()

const validateCalculationRequest = (
    data: any
): { isValid: boolean; error?: string } => {
    if (!data?.lat || !data?.lon || !data?.order || !data?.zoneInfo) {
        logger.warn('Неполные данные запроса', { data })
        return {
            isValid: false,
            error: 'Отсутствуют обязательные поля (lat, lon, order, zoneInfo)',
        }
    }

    if (!data.zoneInfo.inZone) {
        logger.warn('Запрос с адресом вне зоны доставки', { lat: data.lat, lon: data.lon })
        return { isValid: false, error: 'Адрес находится вне зоны доставки' }
    }

    const { lat, lon } = data
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        logger.warn('Некорректная широта', { lat })
        return {
            isValid: false,
            error: 'Широта должна быть числом в диапазоне от -90 до 90',
        }
    }
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
        logger.warn('Некорректная долгота', { lon })
        return {
            isValid: false,
            error: 'Долгота должна быть числом в диапазоне от -180 до 180',
        }
    }

    const { weight, cost } = data.order
    if (typeof weight !== 'number' || weight <= 0) {
        logger.warn('Некорректный вес', { weight })
        return { isValid: false, error: 'Вес должен быть положительным числом' }
    }
    if (typeof cost !== 'number' || cost < 0) {
        logger.warn('Некорректная стоимость', { cost })
        return {
            isValid: false,
            error: 'Стоимость должна быть неотрицательным числом',
        }
    }

    return { isValid: true }
}

const calculateHandler = async (req: Request, res: Response) => {
    const data = req.body
    logger.info('Получен запрос на расчет доставки', { 
        lat: data?.lat,
        lon: data?.lon,
        orderWeight: data?.order?.weight,
        orderCost: data?.order?.cost
    })
    
    const validation = validateCalculationRequest(data)

    if (!validation.isValid) {
        logger.warn('Ошибка валидации запроса', { error: validation.error })
        return res.status(400).json({
            error: true,
            message: validation.error,
        })
    }

    try {
        const result = calculateDelivery(data as DeliveryCalculationRequest)
        result.zoneInfo = data.zoneInfo

        logger.info(
            `Расчет выполнен успешно: координаты (${data.lat},${data.lon}), зона "${data.zoneInfo.zoneName}", стоимость ${result.delivery_cost} руб.`
        )

        return res.json(result)
    } catch (err: any) {
        logger.error('Ошибка при расчете доставки', { 
            error: err.message,
            stack: err.stack,
            data
        })
        
        return res.status(500).json({
            error: true,
            message: 'Ошибка при расчете доставки',
        })
    }
}

router.post('/', apiProtection, calculateHandler)

export default router
