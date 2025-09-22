// Координаты адреса
export interface Coordinates {
    lat: number
    lon: number
}

// Информация о заказе
export interface OrderInfo {
    weight: number // Вес в кг
    cost: number // Стоимость заказа в рублях
    items?: number // Количество товаров (опционально)
}

// Запрос на расчет доставки
export interface DeliveryCalculationRequest {
    lat: number
    lon: number
    order: OrderInfo
    zoneInfo?: ZoneInfo // Информация о зоне доставки
}

// Дополнительные опции
export interface DeliveryOption {
    name: string
    cost: number
    description: string
}

// Информация о зоне доставки
export interface ZoneInfo {
    inZone: boolean
    zoneName?: string
    error?: string // Сообщение об ошибке, если адрес вне зоны
}

// Ответ с расчетом доставки
export interface DeliveryCalculationResponse {
    delivery_cost: number // Стоимость доставки в рублях
    delivery_time: string // Примерное время доставки (например, "1-2 дня")
    options?: DeliveryOption[]
    zoneInfo?: ZoneInfo // Информация о зоне доставки
}

// Интерфейс для данных зоны доставки
export interface DeliveryZoneData {
    zone_name: string
    zone_description?: string
    metadata?: any
    city_id?: number
}
