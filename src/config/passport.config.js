import passport from "passport";
import local from 'passport-local'
import passportJWT from 'passport-jwt'
import github from 'passport-github2'
import { generaHash, validaPasword } from '../utils/passwordHandle.js'
import { UserDto } from "../dto/UserDTO.js";
import { cartService } from "../repository/cart.services.js";
import { userService } from "../repository/user.services.js";

const searchTk = (req) => {
    let token = null

    if (req.cookies.ecommerseCookie) token = req.cookies.ecommerseCookie

    return token
}


export const initPassport = () => {

    const GIT_CLIENT = process.env.GIT_CLIENT
    const GIT_CLIENT_SECTRET = process.env.GIT_CLIENT_SECTRET
    const SECRET = process.env.SECRET

    passport.use('registro',

        new local.Strategy(
            {
                usernameField: 'email',
                passReqToCallback: true

            },

            async (req, username, password, done) => {

                try {

                    let { first_name, last_name, age} = req.body
                    if (!first_name || !last_name) return done(null, false, {message:"Ingrese Nombre completo."})

                    let exist = await userService.getUserBy({ email: username })
                    if (exist) return done(null, false, {message:"El mail ya existe registrado."})

                    password = generaHash(password)

                    let cart = await cartService.createCart([])

                    let newUser = await userService.createUser({ first_name, last_name, age, email: username, password, rol: 'user', cart: cart._id })
                    return done(null, newUser)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use('login',
        new local.Strategy(
            {
                usernameField: 'email'
            },

            async (username, password, done) => {
                try {

                    let user = await userService.getUserBy({ email: username })

                    if (!user)
                        return done(null, false, {message:"Credenciales inválidas"})

                    if (!validaPasword(password, user.password))
                        
                        return done(null, false, {message:"Credenciales inválidas"})

                    user = new UserDto(user)
                    return done(null, user)

                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use('github',
        new github.Strategy(
            {
                clientID: `${GIT_CLIENT}`,
                clientSecret: `${GIT_CLIENT_SECTRET}`,
                callbackURL: 'http://localhost:3000/api/sessions/callbackGithub'
            },

            async (tokenAccess, tokenRefresh, profile, done) => {

                try {

                    let first_name = profile._json.name.split(' ')[0]
                    let last_name = profile._json.name.split(' ')[1]
                    let email = profile._json.email
                    let age = -1
                    if (!first_name || !email) return done(null, false)

                    let newUser = await userService.getUserBy({ email: email })

                    if (!newUser) {
                        let cart = await cartService.createCart([])
                        
                        newUser = await userService.createUser({ first_name, last_name, age, email, rol: 'user', cart: cart._id, profile: profile })
                    }

                    return done(null, newUser)
                } catch (error) {
                    return done(error)
                }
            }

        )
    )

    passport.use("current", new passportJWT.Strategy(
        {
            secretOrKey: `${SECRET}`,
            jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([searchTk])
        },
        async (user, done) => {
            try {
                return done(null, user)
            } catch (error) {                
                return done(error)
            }
        }

    ))
}