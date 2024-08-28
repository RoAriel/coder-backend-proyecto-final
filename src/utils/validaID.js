import { isValidObjectId } from 'mongoose';
import { CustomError } from './CustomError.js'
import { errorCause } from './errorCause.js';
import { TIPOS_ERROR } from './EErrors.js';

export const errorSiNoEsValidoID = (id, description) => {
    if (!(isValidObjectId(id))) {
      let errorName = 'ObjectId no valido'
      return CustomError.createError(errorName,
        errorCause('addProductToCart', errorName, `${description} isValidObjectId: ${isValidObjectId(id)} - value: ${id}`),
        "Favor de corrigir el argumento", TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
    }
  
  }