import { Router } from "express";
import { passportCall } from '../utils.js';
import { auth } from "../middleware/auth.js";
import { getProducts } from "../controllers/vista_controller.js";
import { cartService } from "../repository/cart.services.js";

export const router = Router()

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('home', {
        user: req.user, login: req.user
    });
})

router.get('/chat', passportCall('current'), auth(['user']), (req, res) => {
    res.status(200).render('chat')
})

router.get('/productos', passportCall('current'), getProducts)

router.get('/carrito/:cid', passportCall('current'), async (req, res) => {

    let { cid } = req.params
    let user = req.user

    let cart = await cartService.getCartPopulate(cid)
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("cart", { cart, user });
})

// LOG

router.get('/', (req, res) => {

    res.status(200).render('home', { login: req.session.user })
})

router.get('/registro', (req, res, next) => {
    if (req.user) {
        return res.redirect("/perfil")
    }

    next()
}, (req, res) => {
    let { error } = req.query

    res.status(200).render('registro', { error, login: req.user })
})

router.get('/login', (req, res) => {

    let { error, mensaje } = req.query

    res.status(200).render('login', { error, mensaje, login: req.user })
})

router.get('/perfil', passportCall('current'), (req, res) => {

    res.status(200).render('perfil', {
        user: req.user, login: req.user
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie("ecommerseCookie")
    res.setHeader('Content-Type', 'application/json');
    return res.redirect("/login")
})

// Recuepero
router.get('/recupero', (req, res) => {
    res.status(200).render('recupero')
})

router.get('/solicitudenviada', (req, res) => {

        let { email, first_name } = req.query
        let user = { nombre: first_name, email: email }

        res.status(200).render('reviseEmail', { user: user })

})
router.get('/newPassword/', (req, res) => {

    let { tk } = req.query
    res.status(200).render('newPassword', { token: tk })
})