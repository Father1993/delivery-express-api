import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import calculationRoutes from '@routes/calculation'
import zoneRoutes from '@routes/zone'
import { logger } from '@utils/logger'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Логирование запросов
app.use(
    (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        logger.info(`${req.method} ${req.url} - IP: ${req.ip}`)
        
        // Логируем завершение запроса
        const startTime = Date.now()
        res.on('finish', () => {
            const duration = Date.now() - startTime
            const logLevel = res.statusCode >= 400 ? 'warn' : 'info'
            logger[logLevel](
                `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
            )
        })
        
        next()
    }
)

const apiRouter = express.Router()
apiRouter.use('/calculate', calculationRoutes)
apiRouter.use('/zone', zoneRoutes)

app.use('/api', apiRouter)

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
        status: 'Ok',
        message: 'API сервис калькуляции доставки работает | Уровень',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    })
})

app.use((req: express.Request, res: express.Response) => {
    logger.warn(`Маршрут не найден: ${req.originalUrl}`)
    res.status(404).json({
        error: true,
        message: 'Маршрут не найден',
        path: req.originalUrl,
    })
})

app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        logger.error(`Ошибка сервера: ${err.message}`, { 
            stack: err.stack,
            url: req.originalUrl,
            method: req.method
        })
        
        res.status(500).json({
            error: true,
            message: 'Внутренняя ошибка сервера',
        })
    }
)

app.listen(port, () => {
    logger.info(`Сервер запущен на порту ${port}`)
})
