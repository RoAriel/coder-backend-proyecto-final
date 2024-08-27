import { logger } from "../utils/logger.js"

export const middLogger=(req, res, next)=>{
    req.logger=logger

    next()
}