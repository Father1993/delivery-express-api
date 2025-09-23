import {
    DeliveryCalculationRequest,
    DeliveryCalculationResponse,
} from '@models/deliveryData'
import { logger } from '@utils/logger'
import { DELIVERY_CONFIG } from '@config/deliveryConfig'

/**
 * Расчет стоимости доставки по формулам Excel
 */
export const calculateDelivery = (
    data: DeliveryCalculationRequest
): DeliveryCalculationResponse => {
    const { order } = data
    const config = DELIVERY_CONFIG
    
    logger.debug('Начало расчета доставки', { order })

    // B2: Реальная доля загрузки = MAX(вес/грузоподъемность, объем/объем кузова)
    const loadRatio = Math.max(
        order.weight / config.VEHICLE.CAPACITY_WEIGHT,
        (order.volume || 0.001) / config.VEHICLE.CAPACITY_VOLUME
    )

    // B3: Необходимое количество рейсов (округление вверх)
    const requiredTrips = Math.ceil(loadRatio)

    // B4: Количество дополнительных рейсов
    const additionalTrips = requiredTrips - 1

    // B5: Реальная доля загрузки с учетом минимума = MAX(B2, минимальный%)
    const effectiveLoadRatio = Math.max(loadRatio, config.TARIFF.MIN_LOAD_PERCENTAGE / 100)

    // B6: Время работ (погрузка/разгрузка) = время_погрузки * B5
    const loadingTime = config.TARIFF.LOADING_TIME * effectiveLoadRatio

    // B7: Среднее время доставки по городу = расстояние / скорость
    const avgDeliveryTime = config.TARIFF.CITY_DISTANCE / config.VEHICLE.AVERAGE_CITY_SPEED

    // B8: Время доставки с учетом % загрузки = B7 * B5
    const deliveryTime = avgDeliveryTime * effectiveLoadRatio

    // B9: Итоговая себестоимость = (B6 + B8) * ставка + доп_расходы
    const baseCost = (loadingTime + deliveryTime) * config.TARIFF.HOURLY_RATE + config.TARIFF.ADDITIONAL_COSTS

    // B10: Итоговая стоимость для клиента (с маржой, округление до 100 руб)
    const clientCost = Math.round(baseCost * (1 + config.TARIFF.MARGIN_PERCENTAGE / 100) / 100) * 100

    // B11: ЭКСПРЕСС доставка себестоимость
    const expressCostPrice = baseCost * (1 + config.TARIFF.EXPRESS_COEFFICIENT / 100)

    // B12: ЭКСПРЕСС доставка стоимость для клиента (округление до 100 руб)
    const expressClientCost = Math.round(expressCostPrice * (1 + config.TARIFF.MARGIN_PERCENTAGE / 100) / 100) * 100

    logger.info(`Расчет завершен: обычная - ${clientCost} руб., экспресс - ${expressClientCost} руб.`)

    // Формирование ответа
    return {
        delivery_cost: clientCost,
        delivery_time: requiredTrips <= 1 ? '1-2 дня' : `${requiredTrips}-${requiredTrips + 1} дня`,
        express_delivery_cost: expressClientCost,
        options: [{
            name: 'Экспресс доставка',
            cost: expressClientCost,
            description: 'Приоритетная доставка',
        }],
    }
}