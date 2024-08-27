import path from 'node:path';
import __dirname from "../utils.js"
import swaggerJsdoc from "swagger-jsdoc"


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Api ABM Eccommerse Coder Backend",
            version: "1.0.0",
            description: "Documentación ABM Productos y Carro de compras"
        },
    },
    apis: [path.join(__dirname, '/docs/*.yaml')]
}
export const spec = swaggerJsdoc(options)