import { userService } from "../repository/user.services.js"
import { CustomError } from "../utils/CustomError.js"
import { errorCause } from "../utils/errorCause.js"
import { TIPOS_ERROR } from "../utils/EErrors.js"
import { enviarEmail } from "../utils/mailer.js"
import jwt from "jsonwebtoken"
import { generaHash } from "../utils/passwordHandle.js"
import { errorSiNoEsValidoID } from "../utils/validaID.js"

let errorName
export const updateRol = async (req, res, next) => {
    let { uid } = req.params
    let userUpd
    let new_rol

    try {

        errorSiNoEsValidoID(uid, 'UID')

        let user = await userService.getUserBy({ _id: uid })

        if (user.rol == 'user') new_rol = 'premium'
        if (user.rol == 'premium') new_rol = 'user'
        if (user.rol == 'admin') {
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ msj: 'Admin simpre sera ADMIN' });
        }

        userUpd = await userService.updateUser(uid, { rol: new_rol })

        req.logger.info(`Se actualiza rol del usuario: ${user.email}, nuevo rol: ${userUpd.rol}`)

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: `Nuevo rol para user ${user.email}: ${userUpd.rol}` });

    } catch (error) {
        next(error)
    }

}

export const recuperarPWemail = async (req, res, next) => {

    let { email } = req.body
    let user = await userService.getUserBy({ email: email })

    let token = jwt.sign(user, process.env.SECRET, { expiresIn: '1h' })
    res.cookie("ecommerseRecupero", token, { httpOnly: true })

    let msj = `
    <p> Hola ${user.first_name} utiliza el siguiente botón para acceder al módulo de recuperación de contraseñas.</p>
    <a
    style = "background: #09f;
    cursor: pointer;
    border: none;
    padding: 15px 30px;
    color: white;
    font-size: 20px;
    font-weight: bold;
    position: relative;
    border-radius: 10px;
    text-decoration: none;" 
    href="http://localhost:${process.env.PORT}/newPassword/?tk=${token}">
  Recuperar contraseña
</a>
`
    enviarEmail(email, 'Solicitud de recuperacion de constraseña', msj)
    try {
        res.redirect(`/solicitudenviada/?email=${user.email}&first_name=${user.first_name}`);
    } catch (error) {
        next(error)
        
    }
}

const searchTk = (req) => {
    let token = null

    if (req.cookies.ecommerseRecupero) token = req.cookies.ecommerseRecupero

    return token
}
export const updatePassword = async (req, res, next) => {

    try {
        let { password, tk } = req.body
        let cookieToken = searchTk(req)
        let email
        if (cookieToken) {
            if (tk == cookieToken) {
                email = jwt.decode(cookieToken, process.env.SECRET, true).email
            } else {
                errorName = 'Token invalido'
                CustomError.createError(errorName, errorCause('updatePassword', errorName, `El token no conincide con la cookie`), errorName, TIPOS_ERROR.AUTENTICACION)

            }
        } else {
            errorName = 'No existe ecommerseRecupero'
            CustomError.createError(errorName, errorCause('updatePassword', errorName, `No se encuentra la ecommerseRecupero`), errorName, TIPOS_ERROR.AUTENTICACION)

        }
        let user = await userService.getUserBy({ email: email })

        if (user) {

            password = password = generaHash(password)
            await userService.updateUser(user._id, { password: password })

            res.setHeader('Content-Type', 'application/json');
            return res.redirect(`/login?mensaje=Cambio correcto de password para ${user.first_name}`)
        } else {
            errorName = 'No existe Usuario'
            CustomError.createError(errorName, errorCause('updatePassword', errorName, `No se encuetra usuario para el mail encontrado en el token`), errorName, TIPOS_ERROR.AUTENTICACION)

        }

    } catch (error) {
        next(error)
    }

}

export const deleteUser = async (req, res, next) => {

    try {
        let { uid } = req.params

        errorSiNoEsValidoID(uid, 'UID')

        let email = (await userService.getUserBy({_id : uid})).email

        let data = await userService.deleteUser({email : email})

        if (data.deletedCount > 0) {

            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ payload: `Usuario ${email} eliminado` });
        }
    } catch (error) {
        next(error)   
    }
}



