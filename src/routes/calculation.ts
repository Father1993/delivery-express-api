import express, { Request, Response } from 'express'
import { calculateDelivery } from '@services/calculationService'
import { DeliveryCalculationRequest } from '@models/deliveryData'
import { apiProtection } from '@middleware/auth'

const router = express.Router()

const validateCalculationRequest = (
    data: any
): { isValid: boolean; error?: string } => {
    if (!data?.coordinates || !data?.order || !data?.zoneInfo) {
        return {
            isValid: false,
            error: 'Отсутствуют обязательные поля (coordinates, order, zoneInfo)',
        }
    }

    if (!data.zoneInfo.inZone) {
        return { isValid: false, error: 'Адрес находится вне зоны доставки' }
    }

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

const calculateHandler = async (req: Request, res: Response) => {
    const data = req.body
    const validation = validateCalculationRequest(data)

    if (!validation.isValid) {
        return res.status(400).json({
            error: true,
            message: validation.error,
        })
    }

    try {
        const result = calculateDelivery(data as DeliveryCalculationRequest)
        result.zoneInfo = data.zoneInfo

        console.log(
            `Расчет для координат: ${data.coordinates.lat},${data.coordinates.lon} - Зона: ${data.zoneInfo.zoneName} - Стоимость: ${result.delivery_cost}`
        )

        return res.json(result)
    } catch (err) {
        console.error('Ошибка при расчете доставки:', err)
        return res.status(500).json({
            error: true,
            message: 'Ошибка при расчете доставки',
        })
    }
}

router.post('/', apiProtection, calculateHandler)

export default router
