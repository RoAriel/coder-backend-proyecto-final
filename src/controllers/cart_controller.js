import { v4 as uuidv4 } from "uuid"
import { cartService } from '../repository/cart.services.js';
import { productService } from '../repository/product.services.js';
import { ticketService } from '../repository/ticket.services.js';
import { CustomError } from '../utils/CustomError.js';
import { TIPOS_ERROR } from '../utils/EErrors.js';
import { errorCause } from '../utils/errorCause.js';
import { errorSiNoEsValidoID } from '../utils/validaID.js'
import { ticketHtml } from '../utils/crearTicketHTML.js';
import { enviarEmail } from "../utils/mailer.js";
let errorName


export const getCartByCid = async (req, res, next) => {
    let { cid } = req.params

    try {

        errorSiNoEsValidoID(cid, 'CID')

        let cart = await cartService.getCartPopulate(cid)
        if (cart) {

            return res.status(200).json({ cart });
        } else {
            errorName = 'ID cart no existe'
            CustomError.createError(errorName, errorCause('getCartByCid', errorName, `CID: ${cid} --> Cart: ${cart}`), "Ingrese carrito existente", TIPOS_ERROR.NOT_FOUND)
        }
    } catch (error) {
        return next(error)
    }
}

export const createCart = async (req, res, next) => {

    let productCart = req.body
    let cartNew

    try {

        if (!productCart.hasOwnProperty('products')) {
            errorName = 'No hay lista de productos'
            CustomError.createError(errorName,
                errorCause('createCart',
                    errorName,
                    `body: ${JSON.stringify(productCart)}`),
                'Favor de corregir el argumento',
                TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }

        if (typeof (productCart.products) != typeof ([])) {
            errorName = 'Products no es una lista'
            CustomError.createError(errorName,
                errorCause('createCart',
                    errorName,
                    `body: ${JSON.stringify(productCart)}`),
                'Favor de corregir el argumento',
                TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }

        if (productCart.products.length == 1) {

            let prod_id = productCart.products[0].pid
            let prod_cantidad = productCart.products[0].quantity

            errorSiNoEsValidoID(prod_id)

            let existProduct = await productService.getProductBy({ _id: prod_id })

            if (!existProduct & (prod_cantidad <= 0)) {

                errorName = 'ID Producto no existe o cantidad menor o igual a 0'
                CustomError.createError(errorName,
                    errorCause('createCart', errorName,
                        `El producto: ${prod_id} - cantidad: ${prod_cantidad}`), "Ingrese producto existente o una cantidad mayor a 0", TIPOS_ERROR.NOT_FOUND)

            } else {
                cartNew = await cartService.createCart(productCart.products)
            }

        }

        if (productCart.products.length > 1) {

            let productsDB = await productService.getProducts()
            let idProductos = productsDB.map(pr => pr._id.toString())

            let productsACargar = productCart.products.map(pr => pr.pid)
            productsACargar.forEach(pr_id => errorSiNoEsValidoID(pr_id))

            let cantidadPorPrd = productCart.products.map(pr => pr.quantity)

            let todosLosProductosExisten = productsACargar.every(e => idProductos.includes(e))

            let cantidadesCorrectas = cantidadPorPrd.every(cant => cant > 0)

            if (todosLosProductosExisten & cantidadesCorrectas) {
                cartNew = await cartService.createCart(productCart.products)

            } else {
                errorName = 'Uno o mas productos no existen o alguna cantidad es menor a 0'
                CustomError.createError(errorName, errorCause('createCart', errorName, 'Uno o mas productos no existen o alguna cantidad es menor a 0'), "Ingrese productos existentes y cantidades mayor a 0", TIPOS_ERROR.NOT_FOUND)
            }


        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ cartNew });

    } catch (error) {

        return next(error)
    }
}

export const addProductToCart = async (req, res, next) => {
    let { cid, pid } = req.params
    let user = req.user
    let existCart
    let existProduct

    try {

        errorSiNoEsValidoID(cid, 'CID')
        errorSiNoEsValidoID(pid, 'PID')


        //Controlo que existe el PID
        existProduct = await productService.getProductBy({ _id: pid })

        if (!existProduct) {
            errorName = 'No existe el producto'
            CustomError.createError(errorName,
                errorCause('addProductToCart', errorName, `Product ID: ${pid} no encontrado`), //  --> aca la correccion es sacar el error.message porque no esta def error 
                'PID inexistente en DB', TIPOS_ERROR.NOT_FOUND
            )
        }

        // Controlo que el producto no sea uno creado por el usuario
        if (existProduct.owner == user.email) {
            errorName = 'No Puede agregar el producto'
            CustomError.createError(errorName,
                errorCause('addProductToCart', errorName, `Product ID: ${pid} tiene como owner al usuario de esta operacion ${user.email}`), //  --> aca la correccion es sacar el error.message porque no esta def error 
                'No puede agregar un producto que usted creo', TIPOS_ERROR.ARGUMENTOS_INVALIDOS
            )
        }


        //Controlo que existe el CID

        existCart = await cartService.getCartById(cid)

        let productsInCart = existCart.products

        if ((productsInCart.map(pr => (pr.pid).toString())).includes(pid)) {

            productsInCart.forEach(pr => { if ((pr.pid).toString() == pid) pr.quantity++ })

            await cartService.addProductToCart(cid, productsInCart)

            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(`El producto ${existProduct.title} ya existia, se agrega una unidad más`);

        } else {

            productsInCart.push({ pid: pid, quantity: 1 })

            await cartService.addProductToCart(cid, productsInCart)

            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(`Se agrego el producto ${existProduct.title} al Cart`);
        }
    } catch (error) {

        return next(error)
    }
}

export const removeProductFromCart = async (req, res, next) => {

    let { cid, pid } = req.params
    let cart
    let existProduct

    try {
        errorSiNoEsValidoID(cid, 'CID')
        errorSiNoEsValidoID(pid, 'PID')

        //Controlo que existe el CID
        cart = await cartService.getCartById(cid)


        //Controlo que existe el PID
        existProduct = await productService.getProductBy({ _id: pid })

        if (!existProduct) {
            errorName = 'No existe el producto'
            CustomError.createError(errorName,
                errorCause('addProductToCart', errorName, `Product ID: ${pid} no encontrado`), //  --> aca la correccion es sacar el error.message porque no esta def error 
                'PID inexistente en DB', TIPOS_ERROR.NOT_FOUND
            )
        }


        let cart_products = cart.products.filter(item => item.pid != pid)

        await cartService.addProductToCart(cid, cart_products)

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json('Carrito actializado');

    } catch (error) {
        return next(error)
    }
}

export const changeProductsfromCart = async (req, res, next) => {

    let { cid } = req.params
    let prods = req.body.products
    let cart

    try {
        errorSiNoEsValidoID(cid, 'CID')

        //Controlo que existe el CID
        cart = await cartService.getCartById(cid)

        // Controlo que los productos que llegan al body existan
        let products = await productService.getProducts()
        let existenProductos = prods.every(e => (products.map(pr => (pr._id).toString())).includes(e.pid))

        if (!existenProductos) {
            errorName = 'Error en changeProductsfromCart'
            CustomError.createError(errorName,
                errorCause('changeProductsfromCart', errorName, `Todos lo productos enviados existen? : ${existenProductos}`),
                'Producto no encontrado en la lista enviada', TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }

        // Cargo los nuevos productos

        await cartService.addProductToCart(cid, prods)
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json('Se agregan productos');


    } catch (error) {

        return next(error)

    }
}

export const updateQuantityOfProduct = async (req, res, next) => {

    let { cid, pid } = req.params
    let cantidad = Number(req.body.quantity)

    let isNAN = isNaN(cantidad)
    if (isNAN || cantidad <= 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Quantity no valido.` })
    }
    try {

        errorSiNoEsValidoID(cid, 'CID')
        errorSiNoEsValidoID(pid, 'PID')


        //Controlo que existe el CID
        let cart = await cartService.getCartById(cid)

        //Controlo que existe el PID
        let product = await productService.getProductBy({ _id: pid })

        if (!product) {
            errorName = 'No existe el producto'
            CustomError.createError(errorName,
                errorCause('updateQuantityOfProduct', errorName, `Product ID: ${pid} no encontrado`), //  --> aca la correccion es sacar el error.message porque no esta def error 
                'PID inexistente en DB', TIPOS_ERROR.NOT_FOUND
            )
        }

        let products = cart.products
        let indiceProducto = cart.products.findIndex(p => p.pid.toString() == product._id.toString())

        if (!products[indiceProducto]) {
            errorName = 'No existe el producto en el carrito'
            CustomError.createError(errorName,
                errorCause('updateQuantityOfProduct', errorName, `Product ID: ${pid} no encontrado`), //  --> aca la correccion es sacar el error.message porque no esta def error 
                'PID inexistente en Cart', TIPOS_ERROR.NOT_FOUND)
        } else {
            products[indiceProducto].quantity = cantidad
        }
        await cartService.addProductToCart(cid, products)
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(`Updated quantity del Producto ${pid}`);
    } catch (error) {
        return next(error)
    }
}
export const deleteCartProducts = async (req, res, next) => {

    let { cid } = req.params

    try {
        errorSiNoEsValidoID(cid, 'CID')

        //Controlo que existe el CID
        let cart = await cartService.getCartById(cid)

        await cartService.addProductToCart(cid, [])
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(`Carrito de CID ${cid}, fue vaciado.`);
    } catch (error) {
        return next(error)
    }
}

export const purchase = async (req, res, next) => {

    let { cid } = req.params
    let user = req.user
    let cart
    let cartWithNoStock = []
    let amount = 0
    let productosComprados = []
    try {
        errorSiNoEsValidoID(cid, 'CID')

        cart = await cartService.getCartById(cid)

        for (const product of cart.products) {
            let prd = await productService.getProductBy({ _id: product.pid })

            if (product.quantity < prd.stock) {

                await productService.updtadeProduct(prd._id, { stock: prd.stock - product.quantity })
                amount = amount + (product.quantity * prd.price)
                productosComprados.push({
                    title: prd.title,
                    quantity: product.quantity,
                    price: prd.price
                })

            } else {
                cartWithNoStock.push(product)
            }

        }

        if (cartWithNoStock.length > 0) {
            await cartService.addProductToCart(cid, cartWithNoStock)
        } else {
            await cartService.addProductToCart(cid, [])

        }

        let code = uuidv4()
        let purchase_datetime = new Date()
        let purchaser = user.email

        let tckHtml = ticketHtml(productosComprados, purchase_datetime, amount, code)


        let ticket = {
            code,
            purchase_datetime,
            amount,
            purchaser
        }

        await ticketService.createTicket(ticket)

        enviarEmail(purchaser, 'Gracias!, te acercamos el ticket de compra', tckHtml)

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: `Compra completada, revise su email. Estos son los productos que no contaban con stock: ${cartWithNoStock.map(prod => prod.id)}` })

    } catch (error) {
        return next(error)
    }
}
