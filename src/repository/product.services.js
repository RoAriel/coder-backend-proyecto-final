import { ProductManagerMongo as ProductDao } from '../dao/ProductManager_mongo.js'
import { CustomError } from '../utils/CustomError.js'
import { errorCause } from '../utils/errorCause.js'
import { TIPOS_ERROR } from '../utils/EErrors.js'
let errorName

class ProductService {
    constructor(dao) {
        this.dao = dao
    }

    getProducts = async (filtro={}) => {
        return await this.dao.get(filtro)
    }

    getProductBy = async (filter) => {
        return await this.dao.getBy(filter)

    }

    getProductsPaginate = async (limit, page, query, sort) => {
        try {

            return await this.dao.getAllPaginate(limit, page, query, sort)
        } catch (error) {
            errorName = 'Error en getProductsPaginate.service'
            return CustomError.createError(errorName,
                errorCause('getProductsPaginate', errorName, error.message),
                error.message, TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }
    }

    addProduct = async (product) => {
        try {
            return await this.dao.create(product)
        } catch (error) {
            errorName = 'Error en addProduct.service'
            return CustomError.createError(errorName,
                errorCause('addProduct', errorName, error.message),
                error.message, TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }
    }


    deleteProduct = async (pid) => {

        let product = await this.dao.getBy({ _id: pid })

        if (!product) {
            errorName = 'Error en deleteProduct.service'
            return CustomError.createError(errorName,
                errorCause('deleteProduct', errorName, `Producto no econtrado ID value: ${pid}`),
                'Producto no econtrado', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }
        return await this.dao.delete(pid)

    }

    updtadeProduct = async (pid, cambios) => {
        let product = await this.dao.update(pid, cambios)

        if (!product) {
            errorName = 'Error en updtadeProduct.service'
            return CustomError.createError(errorName,
                errorCause('updtadeProduct', errorName, `Product: ${product}`),
                'Error en Update', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }
        return product


    }
}

export const productService = new ProductService(new ProductDao)