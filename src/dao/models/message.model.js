import mongoose from "mongoose"

const messagesColl="messages"
const messagesSchema=new mongoose.Schema(
    {
        user: String, 
        message: String
    },
    {
        timestamps:true,
        strict: false
    }
)

export const messageModel=mongoose.model(
    messagesColl, messagesSchema
)