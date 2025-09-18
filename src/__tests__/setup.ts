import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Загружаем переменные из .env.test, если файл существует
const envTestPath = path.resolve(__dirname, '../../.env.test')

// Сначала пробуем загрузить .env.test
if (fs.existsSync(envTestPath)) {
    console.log('🔧 Загружены тестовые переменные из .env.test')
    dotenv.config({ path: envTestPath })
} else {
    console.log('⚠️ Файл .env.test не найден')
}

// NODE_ENV устанавливаем вручную для правильной настройки тестового окружения
process.env.NODE_ENV = 'test' 
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'ERROR'
process.env.LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE || 'false'

// Мокируем fs, чтобы не создавать реальные логи
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    appendFileSync: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
}))

// Мокируем Supabase с реалистичными данными
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        rpc: jest.fn().mockImplementation((method, params) => {
            // Проверяем что вызывается правильный метод
            if (method !== 'is_in_delivery_zone') {
                return Promise.resolve({ data: null, error: { message: 'Unknown method' } })
            }
            const { lat, lon } = params
            // Тестовые координаты: если в центре Хабаровска - в зоне, иначе - вне зоны
            const isInZone = lat >= 48.4 && lat <= 48.6 && lon >= 135.0 && lon <= 135.2
            if (isInZone) {
                return Promise.resolve({
                    data: [
                        {
                            zone_name: 'Центр Хабаровска',
                            zone_description: 'Зона доставки — Центр Хабаровска',
                            metadata: {
                                fill: '#ed4543',
                                stroke: '#ed4543',
                                'fill-opacity': 0.6,
                                'stroke-width': '5',
                                'stroke-opacity': 0.9
                            },
                            city_id: 2
                        }
                    ],
                    error: null,
                })
            } else {
                // Вне зоны доставки
                return Promise.resolve({
                    data: [],
                    error: null,
                })
            }
        }),
    })),
}))
