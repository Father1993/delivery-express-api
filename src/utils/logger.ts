import fs from 'fs'
import path from 'path'
import { format } from 'util'

// Уровни логирования
export enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
}

// Конфигурация логгера
interface LoggerConfig {
    logDir: string
    logFile: string
    logToConsole: boolean
    minLevel: LogLevel
}

// Значения по умолчанию
const defaultConfig: LoggerConfig = {
    logDir: process.env.LOG_DIR || 'logs',
    logFile: process.env.LOG_FILE || 'app.log',
    logToConsole: process.env.LOG_TO_CONSOLE !== 'false',
    minLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
}

// Цвета для консоли
const colors = {
    [LogLevel.ERROR]: '\x1b[31m', // Красный
    [LogLevel.WARN]: '\x1b[33m',  // Желтый
    [LogLevel.INFO]: '\x1b[36m',  // Голубой
    [LogLevel.DEBUG]: '\x1b[90m', // Серый
    reset: '\x1b[0m',
}

class Logger {
    private config: LoggerConfig
    private logFilePath: string
    private logLevelPriority: Record<LogLevel, number> = {
        [LogLevel.ERROR]: 0,
        [LogLevel.WARN]: 1,
        [LogLevel.INFO]: 2,
        [LogLevel.DEBUG]: 3,
    }

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...defaultConfig, ...config }
        
        // Создаем полный путь к файлу логов
        this.logFilePath = path.join(this.config.logDir, this.config.logFile)
        
        // Создаем директорию для логов, если она не существует
        this.ensureLogDirExists()
    }

    private ensureLogDirExists(): void {
        try {
            if (!fs.existsSync(this.config.logDir)) {
                fs.mkdirSync(this.config.logDir, { recursive: true })
                console.log(`Создана директория для логов: ${this.config.logDir}`)
            }
        } catch (err) {
            console.error(`Ошибка при создании директории для логов: ${err}`)
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return this.logLevelPriority[level] <= this.logLevelPriority[this.config.minLevel]
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString()
        const formattedMessage = args.length ? format(message, ...args) : message
        return `[${timestamp}] [${level}] ${formattedMessage}`
    }

    private writeToFile(message: string): void {
        try {
            fs.appendFileSync(this.logFilePath, message + '\n')
        } catch (err) {
            console.error(`Ошибка при записи в файл логов: ${err}`)
        }
    }

    private log(level: LogLevel, message: string, ...args: any[]): void {
        if (!this.shouldLog(level)) return

        const formattedMessage = this.formatMessage(level, message, ...args)
        
        // Запись в файл
        this.writeToFile(formattedMessage)
        
        // Вывод в консоль с цветом
        if (this.config.logToConsole) {
            console.log(`${colors[level]}${formattedMessage}${colors.reset}`)
        }
    }

    error(message: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, message, ...args)
    }

    warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, message, ...args)
    }

    info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, message, ...args)
    }

    debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, message, ...args)
    }
}

// Создаем и экспортируем экземпляр логгера
export const logger = new Logger()

// Экспортируем класс для создания кастомных логгеров
export default Logger
