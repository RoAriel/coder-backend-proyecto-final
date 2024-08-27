import mongoose from "mongoose"

const cartsColl = "carts"
const cartSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    pid: { type: mongoose.Types.ObjectId, ref: 'products' },
                    quantity: { type: Number, required: true }
                }
            ]
        }
    },
    {
        timestamps: true,
        strict: false
    }
)

export const cartModel = mongoose.model(
    cartsColl, cartSchema
)