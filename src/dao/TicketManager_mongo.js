import { ticketModel } from "./models/ticket.model.js";

export class TicketManagerMongo{

    async create(obj){
        let newTicket=await ticketModel.create(obj)
        return newTicket.toJSON()
    }
}