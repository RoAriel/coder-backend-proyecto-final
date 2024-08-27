import { usersModel } from "./models/user.model.js"

export class UserManagerMongo{

    async create(obj){
        let newUser=await usersModel.create(obj)
        return newUser.toJSON()
    }

    async getBy(filtro={}){
        return await usersModel.findOne(filtro).lean()
    }

    async getByPopulate(filtro={}){
        return await usersModel.findOne(filtro).populate("cart").lean()
    }

    async update(id, obj) {
        return await usersModel.findByIdAndUpdate(id, obj, { runValidators: true, returnDocument: "after" })
    }

    async delete(filtro={}){
        return await usersModel.deleteOne(filtro)
    }
}