import { describe, it } from "mocha"
import { expect } from "chai"
import supertest from "supertest"
import mongoose from "mongoose";
import { logger } from '../src/utils/logger.js'
import { cartService } from '../src/repository/cart.services.js';

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

describe('Test cart router', async function () {
    this.timeout(10000)

    it("La ruta /api/carts/:cid, en su metodo get, retorna un object con el cart buscado", async () => {
        
       let cid = '6674a503c009b4436b1c71ae'
       let cart = await cartService.getCartById(cid)

       let res = await requester.get(`/api/carts/${cid}`)
       expect(res.statusCode).to.exist.and.to.be.equal(200)
       
       let {body} = await requester.get(`/api/carts/${cid}`)
       
       expect(body.cart._id).to.be.equal(cart._id.toString())
    })

})