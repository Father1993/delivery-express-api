import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Coordinates } from '@models/deliveryData'

dotenv.config()

// Параметры подключения к Supabase из переменных окружения
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

// Инициализация клиента Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Проверяет, входят ли координаты в зону доставки
 * @param coordinates - координаты для проверки
 * @returns результат проверки зоны
 */
// Интерфейс для данных зоны доставки
interface DeliveryZoneData {
    zone_name: string
    zone_description?: string
    metadata?: any
    city_id?: number
}

export const checkDeliveryZone = async (
    coordinates: Coordinates
): Promise<{
    inZone: boolean
    zoneName?: string
    error?: string
    zoneData?: DeliveryZoneData[]
}> => {
    try {
        // Используем прямой REST запрос по аналогии с примером PHP кода
        const url = `${supabaseUrl}/rest/v1/rpc/is_in_delivery_zone`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
                lat: coordinates.lat,
                lon: coordinates.lon,
            }),
        })

        // Обработка HTTP ошибок
        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                `Ошибка при запросе к Supabase: ${response.status}. Ответ: ${errorText}`
            )
            return {
                inZone: false,
                error: `Ошибка при проверке зоны доставки: ${response.status} ${response.statusText}`,
            }
        }

        const data = await response.json()

        // Подробное логирование для отладки
        console.log('Ответ Supabase:', JSON.stringify(data, null, 2))

        // Обработка результата - функция возвращает массив зон
        // Если массив пустой - адрес вне зоны доставки
        // Если есть хотя бы одна зона - адрес входит в зону доставки
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.log('Точка не входит ни в одну зону доставки')
            return { inZone: false, error: 'Адрес находится вне зоны доставки' }
        }

        // Берем данные первой зоны доставки
        const firstZone = data[0]
        return {
            inZone: true,
            zoneName: firstZone.zone_name,
            // Дополнительно можно вернуть всю информацию о зонах
            zoneData: data,
        }
    } catch (error: any) {
        console.error('Ошибка при проверке зоны доставки:', error)
        return {
            inZone: false,
            error: `Ошибка: ${error.message}`,
        }
    }
}
