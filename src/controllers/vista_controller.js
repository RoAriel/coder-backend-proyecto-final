import { productService } from '../repository/product.services.js';
import {cartService} from '../repository/cart.services.js'

export const getProducts = async (req, res) => {

    let cart
    let { limit, pagina, query, sort } = req.query
    if (!pagina) pagina = 1
    try {
        let user = req.user
        
        cart = {_id: req.user.cart}
        
        let {
            payload,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        } = await productService.getProductsPaginate(limit, pagina, query, sort)

        res.setHeader('Content-Type', 'text/html')
        res.status(200).render("products", {
            payload
            , page
            , totalPages
            , hasPrevPage
            , hasNextPage
            , prevPage
            , nextPage
            , prevLink
            , nextLink
            , cart
            , user
        })

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                detalle: `${error.message}`
            }
        )

    }
}

export const getCartID = async (req, res) => {

    let { cid } = req.params
    let user = req.user

    let cart = await cartService.getCartPopulate(cid)

    let totalCart = 0

    cart.products.forEach(producto => {

        let quantity = producto.quantity

        let totalProduct = producto.pid.price * quantity

        totalCart = totalCart+totalProduct
    });

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("cart", { cart, user, totalCart });
}