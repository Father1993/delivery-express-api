// Типы данных для API калькуляции доставки

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
    coordinates: Coordinates
    order: OrderInfo
}

// Ответ с расчетом доставки
export interface DeliveryCalculationResponse {
    delivery_cost: number // Стоимость доставки в рублях
    delivery_time: string // Примерное время доставки (например, "1-2 дня")
    options?: Array<{
        // Опциональные дополнительные варианты доставки
        name: string // Название опции
        cost: number // Дополнительная стоимость
        description: string // Описание опции
    }>
}
