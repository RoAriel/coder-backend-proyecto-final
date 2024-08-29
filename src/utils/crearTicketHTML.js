export const ticketHtml = (productos, purchase_datetime, total, idTicket) =>{

    let rows_productos = ''

    productos.forEach(producto => {
        let row = `<tr>
                    <td style='border: 1px solid #09f'>${producto.title}</td>
                    <td style='border: 1px solid #09f'>$ ${producto.price}</td> 
                    <td style='border: 1px solid #09f'>${producto.quantity}</td>
                  </tr>\n`
        rows_productos = rows_productos+row
    });

    let tckHtml = `
            <h1>Gracias por tu compra!!</h1>
            <p>El resumen de tu compra es el siguiente: </p>
            <table style='border: 2px solid #09f;  text-align: center'>
            <tr>
                <th style='border: 1px solid #09f'>Producto</th>
                <th style='border: 1px solid #09f'>Precio</th>
                <th style='border: 1px solid #09f'>Cantidad</th>
            </tr>
            <tr>
                ${rows_productos}
            </tr>
            </table>
            <h3>Total: $ ${total.toFixed(2)}<h3>
            <h5>Ticket id ${idTicket} fecha y hora: ${purchase_datetime}</h3>
            <p> Te esperamos pronto!!</p>
    `

    return tckHtml

}