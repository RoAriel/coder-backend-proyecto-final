import { Router } from 'express';

export const router = Router()

router.get('/', (req,res) =>{
    req.logger.fatal("Fatal logger capturado");
    req.logger.error("Error logger capturado");
    req.logger.warning("Warning logger capturado");
    req.logger.info("Info logger capturado");
    req.logger.http("Http logger capturado");
    req.logger.debug("Debug logger capturado");

    res.setHeader('Content-Type','application/json');
    return res.status(200).json({payload:'Test Logger completo' });
})