import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import calculationRoutes from '@routes/calculation'
import zoneRoutes from '@routes/zone'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

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
        console.error('Ошибка сервера:', err.message)
        res.status(500).json({
            error: true,
            message: 'Внутренняя ошибка сервера',
        })
    }
)

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`)
})
