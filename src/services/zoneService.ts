import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Coordinates, DeliveryZoneData } from '@models/deliveryData'
import { logger } from '@utils/logger'

dotenv.config()

// Параметры подключения к Supabase из переменных окружения
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

// Инициализация клиента Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const delivery_method = 'is_in_delivery_zone'

/**
 * Проверяет, входят ли координаты в зону доставки
 * @param coordinates - координаты для проверки
 * @returns результат проверки зоны
 */
export const checkDeliveryZone = async (
    coordinates: Coordinates
): Promise<{
    inZone: boolean
    zoneName?: string
    error?: string
    zoneData?: DeliveryZoneData[]
}> => {
    try {
        logger.info(`Проверка зоны доставки для координат: ${coordinates.lat}, ${coordinates.lon}`)
        
        // Используем метод rpc клиента Supabase вместо прямого fetch
        const { data, error } = await supabase.rpc(delivery_method, {
            lat: coordinates.lat,
            lon: coordinates.lon,
        })
        
        if (error) {
            logger.error(`Ошибка при запросе к Supabase: ${error.message}`, { 
                coordinates,
                errorCode: error.code,
                errorDetails: error.details
            })
            return {
                inZone: false,
                error: `Ошибка при проверке зоны доставки: ${error.message}`,
            }
        }
        
        logger.debug('Ответ Supabase:', data)

        // Если массив пустой - адрес вне зоны доставки
        // Если есть хотя бы одна зона - адрес входит в зону доставки
        if (!data || !Array.isArray(data) || data.length === 0) {
            logger.info(`Точка (${coordinates.lat}, ${coordinates.lon}) не входит ни в одну зону доставки`)
            return { inZone: false, error: 'Адрес находится вне зоны доставки' }
        }

        // Берем данные первой зоны доставки
        const firstZone = data[0]
        logger.info(`Точка (${coordinates.lat}, ${coordinates.lon}) входит в зону: ${firstZone.zone_name}`)
        
        return {
            inZone: true,
            zoneName: firstZone.zone_name,
            // Дополнительно можно вернуть всю информацию о зонах
            zoneData: data,
        }
    } catch (error: any) {
        logger.error('Ошибка при проверке зоны доставки:', { 
            error: error.message,
            stack: error.stack,
            coordinates 
        })
        
        return {
            inZone: false,
            error: `Ошибка: ${error.message}`,
        }
    }
}
