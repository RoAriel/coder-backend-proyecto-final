import winston from "winston"

let env = `${process.env.NODE_ENV}`

const customLevels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  }
  
  const logColors = {
    fatal: "bold inverse red",
    error: "bold  red",
    warning: "bold yellow",
    info: "bold inverse white",
    http: "cyan",
    debug: "bold inverse green"
  }
  
  let m_format = winston.format.combine(
    winston.format.colorize({ colors: logColors, }),
    winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A', }),
    winston.format.simple(),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  )
  
  export const logger = winston.createLogger(
    {
      levels: customLevels,
      transports: []
    }
  )
  
  const transpConsola = (level) => {
    return new winston.transports.Console(
      {
        level: `${level}`,
        format: m_format,
      }
    )
  }
  
  
  const transpFile = (level) => {
    return new winston.transports.File(
      {
        level: `${level}`,
        filename: `./src/logs/${level}.log`,
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A', }),
          winston.format.json()
        )
      }
    )
  }
  
  if (env == 'DEV') {
  
    logger.add(transpConsola('debug'))
  
  } else {
    logger.add(transpConsola('info'))
    logger.add(transpFile('error'))
  }