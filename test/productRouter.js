import { describe, it } from "mocha"
import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose";
import { logger } from '../src/utils/logger.js'
import { productService } from '../src/repository/product.services.js';


const PORT = process.env.PORT || 8080;
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE = process.env.DATABASE;

const connDB = async () => {
    try {

        await mongoose.connect(`${DATABASE_URL}`, { dbName: `${DATABASE}` })
        logger.info(`DB ONLINE (En modulo Test)>>> DBNAME: ${DATABASE}`)
    } catch (error) {
        console.log('ERROR:', error);

        logger.error("Error al conectar a DB", error.message)
    }

}

connDB()

const requester = supertest(`http://localhost:${PORT}`)

describe('Test products router', async function () {
    this.timeout(10000)

    it("La ruta /api/products/:pid, en su metodo get, retorna un object con el producto buscado", async () => {

        let pid = '6674a1436f05df233631f749'
        let product = await productService.getProductBy({ _id: pid })

        let res = await requester.get(`/api/products/${pid}`)
        expect(res.statusCode).to.exist.and.to.be.equal(200)
        
        let {body} = await requester.get(`/api/products/${pid}`)
        expect(body.product._id).to.be.equal(product._id.toString())
    })

})
