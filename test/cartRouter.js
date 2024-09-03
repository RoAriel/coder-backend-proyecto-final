import { describe, it } from "mocha"
import { expect } from "chai"
import supertest from "supertest"
import mongoose, { isValidObjectId } from "mongoose";
import { logger } from '../src/utils/logger.js'
import { cartService } from '../src/repository/cart.services.js';
import { userService } from "../src/repository/user.services.js";

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

describe('Test cart router', async function () {
    this.timeout(10000)

    let id_cart_1
    let id_cart_2
    let cookie
    let userTest = {
        first_name: "Test",
        last_name: "TestDoc",
        age: -1,
        email: "test@test.com", //cambiar email para pruebas
        password: "123"
    }

    let productsToCart

    
    before(async function () {
        
        await requester.post("/api/sessions/registro").send(userTest)

        let res = await requester.post("/api/sessions/login").send({
            email: userTest.email,
            password: userTest.password
        })

        cookie = res.header['set-cookie'][0]
        cookie = {
            name: cookie.split('=')[0],
            token: cookie.split('=')[1]
        }
    })

    after(async function() {
        
        await cartService.deleteCart(id_cart_1)
        await cartService.deleteCart(id_cart_2)
        await userService.deleteUser({ email: "test@test.com" })
    })


    it("La ruta /api/carts/:cid, en su metodo get, retorna un object con el cart buscado", async () => {

        let cid = '66cfd9ed1c8126b8548cc74f'
        let cart = await cartService.getCartById(cid)

        let res = await requester.get(`/api/carts/${cid}`)
        expect(res.statusCode).to.exist.and.to.be.equal(200)

        let { body } = await requester.get(`/api/carts/${cid}`)

        expect(body.cart._id).to.be.equal(cart._id.toString())
    })

    it('La ruta /api/carts/, en su metodo post, crea un carrito nuevo, con un producto', async () => {

        productsToCart = { products: [{ pid: "66ce852f6ece9aa0717b8111", quantity: 1000 }] }

        let { body } = await requester.post('/api/carts/').send(productsToCart)

        expect(body.cartNew).to.be.exist

        let cart = body.cartNew
        id_cart_1 = cart._id
        
        expect(isValidObjectId(cart._id)).to.be.true
        expect(cart.products).to.be.an('array')
        expect(cart.products[0].pid).to.be.equal(productsToCart.products[0].pid)
    })

    it('La ruta /api/carts/, en su metodo post, crea un carrito nuevo, con una lista de productos', async () => {
        let productsToCart ={products: [

            {"pid":"66ce852f6ece9aa0717b8126", "quantity": 10},
            {"pid":"66ce852f6ece9aa0717b810b", "quantity": 20},
            {"pid":"66ce852f6ece9aa0717b8111", "quantity": 30}
            ]
        }
        let { body } = await requester.post('/api/carts/').send(productsToCart)

        expect(body.cartNew).to.be.exist

        let cart = body.cartNew
        id_cart_2 = cart._id
        
        expect(isValidObjectId(cart._id)).to.be.true
        expect(cart.products).to.be.an('array')
        expect(cart.products.length).to.be.equal(3)

    })

    it('La ruta /api/carts/:cid/products/:pid, en su metodo put, actualiza la cantidad del producto en el carrito', async () =>{

        let cart = await cartService.getCartById(id_cart_1)
        expect(cart.products[0].quantity).to.be.equal(1000)

        let cant = { quantity : 20 }

        let {body} = await requester.put(`/api/carts/${id_cart_1}/products/${productsToCart.products[0].pid}`)
        .send(cant)
        .set('Cookie', [`${cookie.name}=${cookie.token}`])

        let cartUpd = await cartService.getCartById(id_cart_1)

        expect(body.split(' ')[0]).to.be.equal('Updated')
        expect(cartUpd.products[0].quantity).to.be.equal(20)

        

    })

})