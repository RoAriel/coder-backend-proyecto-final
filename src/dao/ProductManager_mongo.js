import { productModel } from './models/product.model.js'

export class ProductManagerMongo {

    async get(filtro = {}) {
        return await productModel.find(filtro)
    }

    async getBy(filtro) {
        return await productModel.findOne(filtro)
    }

    async getAllPaginate(limit = 10, page = 1, query, sort) {

        let orden = sort == 'desc' ? -1 : 1

        let options = {
            limit,
            page,
            lean: true,
            sort: { price: orden }
        }

        let filter = query ? query : {}
        let ret
        try {
            let { docs: payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage } = await productModel.paginate(filter, options)

            let prevLink = hasPrevPage ? `/productos?pagina=${prevPage}` : null
            let nextLink = hasNextPage ? `/productos?pagina=${nextPage}` : null

            ret = {
                status: 'success',
                payload,
                totalPages,
                prevPage,
                nextPage,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink,
                nextLink
            }
        } catch (error) {

            ret = {
                status: 'error',
                docs: `${error.message}`
            }
        }

        return ret
    }

    async create(obj) {

        return await productModel.create(obj)
    }

    async delete(id) {
        return await productModel.deleteOne({ _id: id })
    }

    async update(id, obj) {
        return await productModel.findByIdAndUpdate(id, obj, { runValidators: true, returnDocument: "after" })
    }
}