import { Router } from "express";
import jwt from "jsonwebtoken"
import passport from 'passport';
import { auth } from '../middleware/auth.js';
import { passportCall } from '../utils/passportCallHandle.js'
import { updateRol, recuperarPWemail,updatePassword, deleteUser } from "../controllers/user_controller.js";

export const router = new Router()

router.post('/registro', passportCall('registro'), async (req, res) => {


    let web = req.body.web
    let newUser = req.user
    let token = jwt.sign(newUser, process.env.SECRET, { expiresIn: '1h' })
    res.cookie("ecommerseCookie", token, { httpOnly: true })
    if (web) {
        return res.redirect(`/login?mensaje=Registro correcto para ${newUser.first_name}`)
    } else {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({ payload: "Registro correcto", newUser: newUser, token })
    }

})

router.post('/login', passportCall('login'), async (req, res) => {
    let { web } = req.body
    let usr = { ...req.user }

    let token = jwt.sign(usr, process.env.SECRET, { expiresIn: '1h' })
    res.cookie("ecommerseCookie", token, { httpOnly: true })

    if (web) {
        res.redirect("/productos")
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: "Login correcto", usuarioLogueado: usr, token });
    }
})

router.get('/github', passport.authenticate("github", {}), (req, res) => {})


router.get('/callbackGithub', passport.authenticate("github",{session: false}), (req, res) => {

    let usr = { ...req.user }

    delete usr.profile
    
    let token = jwt.sign(usr, process.env.SECRET, { expiresIn: '1h' })
   
    res.cookie("ecommerseCookie", token, { httpOnly: true })
    res.redirect("/productos")
 

})

router.get("/logout", (req, res) => {
    res.clearCookie("ecommerseCookie")

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ payload: 'Logout correcto!' });
})

router.get('/current', passportCall('current'), (req, res) => {

    try {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ user: req.user });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                detalle: `${error.message}`
            }
        )

    }

})

router.post('/premium/:uid',passportCall('current'), auth(['admin']),updateRol)

router.post('/emailDeRecupero', recuperarPWemail)

router.post('/updatePassword', updatePassword)

router.delete('/deleteUser/:uid',passportCall('current'), auth(['admin']), deleteUser)