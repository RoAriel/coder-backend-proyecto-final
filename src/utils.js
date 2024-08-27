import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt'
import passport from "passport";
import { isValidObjectId } from 'mongoose';
import { CustomError } from './utils/CustomError.js'
import { errorCause } from './utils/errorCause.js';
import { TIPOS_ERROR } from './utils/EErrors.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const generaHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const validaPasword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash);

export const passportCall = (strategy) => function (req, res, next) {

  passport.authenticate(strategy, function (err, user, info, status) {
    if (err) { return next(err) }
    if (!user) {
      res.setHeader('Content-Type', 'application/json');

      return res.status(400).json({ error: info.message ? info.message : info.toString() })
    }
    req.user = user
    return next()
  })(req, res, next);
}

export const errorSiNoEsValidoID = (id, description) => {
  if (!(isValidObjectId(id))) {
    let errorName = 'ObjectId no valido'
    return CustomError.createError(errorName,
      errorCause('addProductToCart', errorName, `${description} isValidObjectId: ${isValidObjectId(id)} - value: ${id}`),
      "Favor de corrigir el argumento", TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
  }

}



