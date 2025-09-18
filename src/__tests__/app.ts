import express from 'express'
import cors from 'cors'
import calculationRoutes from '@routes/calculation'
import zoneRoutes from '@routes/zone'

export function createTestApp() {
    const app = express()
    app.use(cors())
    app.use(express.json())

    const apiRouter = express.Router()
    apiRouter.use('/calculate', calculationRoutes)
    apiRouter.use('/zone', zoneRoutes)

    app.use('/api', apiRouter)

    return app
}
