import { describe, it } from "mocha"
import { expect } from "chai"
import supertest from "supertest"
import mongoose, { isValidObjectId } from "mongoose";
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
        logger.error("Error al conectar a DB", error.message)
    }

}

connDB()

const requester = supertest(`http://localhost:${PORT}`)

describe('Test products router', async function () {
    this.timeout(10000)

    let cookie
    let newProducto = {
        title: "Tomaco",
        description: "600gr",
        code: "Tomaco-T1000",
        price: 10000,
        status: true,
        stock: 1000,
        category: "Empaquetados",
        thumbnail: "thumbnail"
    }

    before(async function () {

        let res = await requester.post("/api/sessions/login").send({
            email: `${process.env.ADMIN_MAIL}`,
            password: `${process.env.ADMIN_MAIL_PASSWORD}`
        })

        cookie = res.header['set-cookie'][0]
        cookie = {
            name: cookie.split('=')[0],
            token: cookie.split('=')[1]
        }
    })

    after(async function () {

        let productExample = await productService.getProductBy({ title: 'Tomaco' })
        await productService.deleteProduct(productExample._id)
    })

    it('La ruta /api/products/, en su metodo post, crea un producto nuevo', async () => {

        let res = await requester.post('/api/products/') // Si no hay un body falla
        expect(res.statusCode).to.exist.and.to.be.equal(400)

        let { body } = await requester.post('/api/products/').send(newProducto).set('Cookie', [`${cookie.name}=${cookie.token}`])
        expect(body.payload).to.exist
        
        let producto = body.payload

        expect(isValidObjectId(producto._id)).to.be.true
        expect(producto.title).to.be.equal(newProducto.title)

    })

    it("La ruta /api/products/:pid, en su metodo get, retorna un object con el producto buscado", async () => {

        let pid = '66ce852f6ece9aa0717b80fe'
        let product = await productService.getProductBy({ _id: pid })

        let res = await requester.get(`/api/products/${pid}`)
        expect(res.statusCode).to.exist.and.to.be.equal(200)

        let { body } = await requester.get(`/api/products/${pid}`)
        expect(body.product._id).to.be.equal(product._id.toString())
    })

    it('La ruta /api/products/:pid, en su metodo put, actualiza una propiedad dada', async () => {

        let tomaco = await productService.getProductBy({ title: 'Tomaco' })
        expect(tomaco.stock).to.be.equal(newProducto.stock)
        expect(tomaco.stock).to.be.equal(1000)


        let updProduct = { stock : 123 }

        let { body } = await requester.put(`/api/products/${tomaco._id}`).send(updProduct).set('Cookie', [`${cookie.name}=${cookie.token}`])
        expect(body.prodUpdated).to.be.exist

        let productoUpd = body.prodUpdated

        expect((productoUpd._id).toString()).to.be.equal((tomaco._id).toString())
        expect(productoUpd.stock).to.be.not.equal(1000)
        expect(productoUpd.stock).to.be.equal(123)

    })

})
