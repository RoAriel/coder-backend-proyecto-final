import mongoose from "mongoose"
import paginate from "mongoose-paginate-v2"

const productsColl = "products"
const productsSchema = new mongoose.Schema(
    {
        title: { type: String, unique: true, required: true },
        description: { type: String, required: true },
        code: { type: String, unique: true, required: true },
        price: { type: Number, required: true },
        status: Boolean,
        stock: { type: Number, required: true },
        category: { type: String, required: true },
        thumbnail: { type: [], require: true },
        owner: { type: String, default: 'admin' }
    },
    {
        timestamps: true,
        strict: false
    }
)

productsSchema.plugin(paginate)

export const productModel = mongoose.model(
    productsColl, productsSchema
)