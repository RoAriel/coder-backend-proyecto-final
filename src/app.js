import __dirname from './utils.js';
import {logger} from'./utils/logger.js'
import path from 'node:path';
import express from 'express';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import passport from 'passport';
import { initPassport } from './config/passport.config.js';
import { router as sessionsRouter } from './router/sessions.router.js';
import { router as productRouter } from './router/product.router.js';
import { router as cartRouter } from './router/cart.router.js';
import { router as vistasRouter } from '../src/router/vistas.router.js'
import { router as loggerTest } from '../src/router/loggerTest.router.js'
import { messageModel } from './dao/models/message.model.js';
import cookieParser from 'cookie-parser';
import cords from 'cors'
import { errorHandler } from '../src/middleware/errorHandler.js'
import { middLogger } from './middleware/middLogger.js';
import swaggerUi from 'swagger-ui-express'
import { spec } from './utils/swaggerConfig.js';


const PORT = process.env.PORT || 8080;
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE = process.env.DATABASE;

let io

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middLogger)
app.use(cords())

app.use(cookieParser())
initPassport()
app.use(passport.initialize())

app.engine('handlebars', engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.use('/api/sessions', sessionsRouter)
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/loggerTest', loggerTest)
app.use('/', vistasRouter)
app.use(errorHandler)


const server = app.listen(PORT, () => {
    logger.info(`SERVER ONLINE  >>> PORT: ${PORT}`);
});

const connDB = async () => {
    try {

        await mongoose.connect(`${DATABASE_URL}`, { dbName: `${DATABASE}` })
        logger.info(`DB ONLINE  >>> DBNAME: ${DATABASE}`)
    } catch (error) {
        logger.error("Error al conectar a DB", error.message)
    }

}
connDB()

io = new Server(server)

io.on("connection", socket => {
    socket.on("id", async (user) => {

        let mensajes = await messageModel.find().lean()

        mensajes = mensajes.map(m => {
            return { user: m.user, mensaje: m.mensaje }
        })

        socket.emit("mensajesPrevios", mensajes)
        socket.broadcast.emit("nuevoUsuario", user)
    })

    socket.on("mensaje", async (user, mensaje) => {
        await messageModel.create({ user: user, mensaje })
        io.emit("nuevoMensaje", user, mensaje)
    })

})

process.on('uncaughtException', error => {
    logger.fatal(error.message, "Error no capturado");

})