import express from 'express'
import cors from 'cors'
import calculationRoutes from '@routes/calculation'
import dotenv from 'dotenv'

// Загрузка переменных окружения
dotenv.config()

// Инициализация приложения Express
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Логирование запросов
app.use(
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
        next()
    }
)

// Маршруты
app.use('/api', calculationRoutes)

// Простой маршрут для проверки работы API
app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
        status: 'ok',
        message: 'API сервис калькуляции доставки работает',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    })
})

// Обработка 404 ошибок (маршрут не найден)
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        error: true,
        message: 'Маршрут не найден',
        path: req.originalUrl,
    })
})

// Обработка ошибок
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error('Ошибка сервера:', err.message)
        res.status(500).json({
            error: true,
            message: 'Внутренняя ошибка сервера',
        })
    }
)

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`)
})
