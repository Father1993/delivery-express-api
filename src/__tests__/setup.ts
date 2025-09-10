import dotenv from 'dotenv'
import path from 'path'

// Загружаем переменные окружения для тестов
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

// Мокируем fs, чтобы не создавать реальные логи
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    appendFileSync: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
}))

// Мокируем Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        rpc: jest.fn().mockImplementation((method, params) => {
            // Имитируем ответ для метода проверки зоны доставки
            return {
                data: [
                    {
                        zone_name: 'Тестовая зона',
                        zone_description: 'Описание тестовой зоны',
                    },
                ],
                error: null,
            }
        }),
    })),
}))
