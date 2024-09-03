import { CartManagerMongo as CartDao } from '../dao/CartManager_mongo.js'
import { CustomError } from '../utils/CustomError.js'
import { TIPOS_ERROR } from '../utils/EErrors.js'
import { errorCause } from '../utils/errorCause.js'

let errorName
let cart

class CartService {

    constructor(dao) {
        this.dao = dao
    }

    getCarts = async () => {
        try {
            return await this.dao.getAll()
        } catch (error) {
            errorName = 'Error en getCarts'
            return CustomError.createError(errorName, errorCause('getCarts', errorName, error.message), error.message, TIPOS_ERROR.INTERNAL_SERVER_ERROR)
        }
    }

    getCartById = async (cid) => {
        cart = await this.dao.getById(cid)
        if (!cart) {
            errorName = 'Error en getCartById'
            return CustomError.createError(errorName, errorCause('getCartById', errorName, `Cart id : ${cid} - Cart ${cart}`), `Carrito Inexistente`, TIPOS_ERROR.NOT_FOUND)
        }

        return cart
    }


    getProductsByCartId = async (cid) => {

        try {
            return (await this.getCartById(cid)).products
        } catch (error) {
            errorName = 'Error en getProductsByCartId'
            return CustomError.createError(errorName, errorCause('getProductsByCartId', errorName, error.message), error.message, TIPOS_ERROR.INTERNAL_SERVER_ERROR)
        }
    }

    createCart = async (products) => {
        try {
            return this.dao.create(products)
        } catch (error) {
            errorName = 'Error en createCart'
            return CustomError.createError(errorName, errorCause('createCart', errorName, error.message), error.message, TIPOS_ERROR.INTERNAL_SERVER_ERROR)
        }
    }

    addProductToCart = async (cid, products) => {
        try {
            return await this.dao.update(cid, products)
        } catch (error) {
            errorName = 'Error en addProductToCart'
            return CustomError.createError(errorName, errorCause('addProductToCart', errorName, error.message), error.message, TIPOS_ERROR.INTERNAL_SERVER_ERROR)
        }
    }

    getCartPopulate = async (cid) => {
        try {
            return this.dao.getOneByPopulate(cid)
        } catch (error) {
            errorName = 'Error en getCartPopulate'
            return CustomError.createError(errorName, errorCause('getCartPopulate', errorName, error.message), error.message, TIPOS_ERROR.INTERNAL_SERVER_ERROR)
        }
    }

    deleteCart = async(cid) =>{

        let cart = await this.dao.getOneBy({ _id: cid })

        if (!cart) {
            errorName = 'Error en deleteCart.service'
            return CustomError.createError(errorName,
                errorCause('deleteCart', errorName, `Cart no econtrado ID value: ${cid}`),
                'Cart no econtrado', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }
        return await this.dao.delete(cid)
    }
}
export const cartService = new CartService(new CartDao)
