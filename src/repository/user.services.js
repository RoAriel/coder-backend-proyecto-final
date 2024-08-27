import { UserManagerMongo as UserDao } from "../dao/UserManager_mongo.js";
import { CustomError } from "../utils/CustomError.js";
import { errorCause } from '../utils/errorCause.js'
import { TIPOS_ERROR } from '../utils/EErrors.js'
let errorName

class UserService {
    constructor(dao) {
        this.dao = dao
    }

    createUser = async (user) => {
        try {
            return await this.dao.create(user)
        } catch (error) {
            errorName = 'Error en createUser-services'
            return CustomError.createError(errorName,
                errorCause('createUser', errorName, error.message),
                error.message, TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }

    }

    getUserBy = async (filter) => {
        try {
            let user = await this.dao.getBy(filter)

            // if(!user){
            //     errorName = 'Error en getUserBy-services'
            //     return CustomError.createError(errorName,
            //         errorCause('getUserId', errorName, `Usuario : ${user}`),
            //         errorName, TIPOS_ERROR.NOT_FOUND)
            // }

            return user
        } catch (error) {
            errorName = 'Error en getUserId-services'
            return CustomError.createError(errorName,
                errorCause('getUserId', errorName, error.message),
                error.message, TIPOS_ERROR.INTERNAL_SERVER_ERROR)
        }

    }

    getUserPopulate = async (filter) => {
        try {
            return await this.dao.getByPopulate(filter)
        } catch (error) {
            errorName = 'Error en getUserPopulate-services'
            return CustomError.createError(errorName,
                errorCause('getUserPopulate', errorName, error.message),
                error.message, TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }

    }

    updateUser = async (uid, cambio) => {
        try {
            return await this.dao.update(uid, cambio)
        } catch (error) {
            errorName = 'Error en updateUser-services'
            return CustomError.createError(errorName,
                errorCause('updateUser', errorName, error.message),
                error.message, TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }
    }

    deleteUser = async (filtro = {}) => {
        return await this.dao.delete(filtro)
    }
}

export const userService = new UserService(new UserDao)