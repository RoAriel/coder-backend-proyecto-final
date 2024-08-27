import mongoose from 'mongoose'

export const usersModel = mongoose.model('users', new mongoose.Schema({
    first_name: String,
    last_name: String,
    age: Number,
    email: {
        type: String, unique: true
    },
    password: String,
    rol: {
        type: String,
        enum: ['admin', 'user', 'premium'],
        default: "user"
    },
    cart: {
        type: mongoose.Types.ObjectId, ref: "carts"
    }
},
    {
        timestamps: true,
        strict: false
    }
))