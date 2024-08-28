import { productService } from '../repository/product.services.js';
import { fakerES_MX as faker } from "@faker-js/faker"
import { CustomError } from '../utils/CustomError.js';
import { TIPOS_ERROR } from '../utils/EErrors.js';
import { errorCause } from '../utils/errorCause.js'
import { errorSiNoEsValidoID } from '../utils/validaID.js';

let errorName

export const getAllProducts = async (req, res, next) => {

    let pages_products
    let d0, d1, d2, d3 = {}, clave, val, qry = {} // variables necesarias para generar el qry de filtro
    let { limit, page, query, sort, category } = req.query

    if (query) {

        let str = query.slice(1, -1)

        let datos = str.split(':')

        if (datos.length > 2) {

            d0 = datos[0]
            d1 = datos[1].slice(1)
            d2 = datos[2].slice(0, -1)
            d3[d1] = d2
            qry[d0] = d3

        } else {

            clave = datos[0]
            val = datos[1].slice(1, -1)
            qry[clave] = val

        }
    }

    try {

        pages_products = await productService.getProductsPaginate(limit, page, qry, sort)
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({ payload: pages_products });

    } catch (error) {
        return next(error)
    }
}

export const getProductByPid = async (req, res, next) => {

    let { pid } = req.params

    try {
        errorSiNoEsValidoID(pid, 'PID')

        let product = await productService.getProductBy({ _id: pid })
        if (product) {
            res.setHeader('Content-Type', 'application/json');

            return res.status(200).json({ product });
        } else {
            errorName = 'Error en getProductByPid - controller'
            CustomError.createError(errorName,
                errorCause('getProductByPid', errorName, `PID: ${pid} no encontrado`),
                'Producto no encotrado', TIPOS_ERROR.NOT_FOUND)
        }
    } catch (error) {
        return next(error)

    }
}

export const createNewProduct = async (req, res, next) => {

    try {

        let propiedadesProductoNuevo = Object.keys(req.body)
        let propiedadesValidas = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnail']


        let valido = propiedadesValidas.every(prop => propiedadesProductoNuevo.includes(prop))
        let { title, description, code, price, status, stock, category, thumbnail } = req.body
        let user = req.user
        let prd

        if (!valido) {
            errorName = 'Error en createNewProduct-controller'
            CustomError.createError(errorName,
                errorCause('createNewProduct-controller', errorName, 'Argumentos invalidos o faltantes'),
                'Argumentos invalidos o faltantes', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }


        let prExist = await productService.getProductBy({ code })

        if (prExist) {
            errorName = 'Error en createNewProduct-controller'
            CustomError.createError(errorName,
                errorCause('createNewProduct-controller', errorName, 'Codigo de producto existente'),
                'Argumento Code existente', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        } else {
            // valido que status venga con contenido, de no ser así pongo True
            (status == null) ? status = true : status

            if (user.rol != 'admin') {

                prd = { title, description, code, price, status, stock, category, thumbnail, owner: user.email }
            } else {
                prd = { title, description, code, price, status, stock, category, thumbnail }

            }

            let newProduct = await productService.addProduct(prd)

            res.setHeader('Content-Type', 'application/json');
            return res.status(201).json({ payload: newProduct });

        }

    } catch (error) {

        return next(error)

    }

}

export const updateProduct = async (req, res, next) => {
    let { pid } = req.params
    let prdUpd = req.body

    try {

        errorSiNoEsValidoID(pid, 'PID')

        if (prdUpd._id) {
            delete prdUpd._id
        }

        if (prdUpd.code) {
            let exists = await productService.getProductBy({ _id: { $ne: pid }, code: prdUpd.code })
            if (exists) {

                errorName = 'Error en updateProduct-controller'
                CustomError.createError(errorName,
                    errorCause('updateProduct', errorName, `Ya existe otro producto con el nro de codigo ${prdUpd.code}`),
                    'Codigo de producto existente', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
            }

        }


        let prodUpdated = await productService.updtadeProduct(pid, prdUpd)
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ prodUpdated });
    } catch (error) {

        return next(error)
    }

}

export const deleteProduct = async (req, res, next) => {
    let { pid } = req.params
    let user = req.user
    try {
        errorSiNoEsValidoID(pid, 'PID')

        let { title, owner } = await productService.getProductBy({ _id: pid })

        if (user.rol != 'admin' & user.rol != owner) {
            errorName = 'Error en  deleteProduct-controller'
            CustomError.createError(errorName,errorCause('deleteProduct',
                errorName,
                'El producto no pertenece a la lista de productos creados por el usuario'),
                'No puede eliminar este producto', TIPOS_ERROR.AUTORIZACION)
        }

        let data = await productService.deleteProduct(pid)

        if (data.deletedCount > 0) {

            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ payload: `Producto ${title} eliminado` });
        }
    } catch (error) {

        return next(error)

    }

}

export const mockingproducts = (req, res) => {

    let products = []
    for (let index = 0; index < 100; index++) {
        let product = {

            _id: faker.database.mongodbObjectId(),
            price: faker.commerce.price(),
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            code: `${index}-MK`,
            status: true,
            stock: Math.ceil(Math.random() * 1000),
            category: 'Mocks',
            thumbnail: [`https://products/${faker.commerce.productName().replace(/\s+/g, '')}`],
            updatedAt: new Date()
        }

        products.push(product)

    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ payload: products });
}