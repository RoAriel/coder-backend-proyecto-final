Swal.fire({
    title:"Identifiquese",
    input:"text",
    text:"Ingrese su nickname",
    inputValidator: (value)=>{
        return !value && "Debe ingresar un user...!!!"
    },
    allowOutsideClick:false
}).then(datos=>{
    let user=datos.value
    document.title=user

    let inputMensaje=document.getElementById("mensaje")
    let divMensajes=document.getElementById("mensajes")
    inputMensaje.focus()
    
    const socket=io()
    
    socket.emit("id", user)

    socket.on("nuevoUsuario", user=>{
        Swal.fire({
            text:`${user} se ha conectado...!!!`,
            toast:true,
            position:"top-right"
        })
    })

    socket.on("mensajesPrevios", mensajes=>{
        mensajes.forEach(m=>{
            divMensajes.innerHTML+=`<span class="mensaje"><strong>${m.user}</strong> dice <i>${m.mensaje}</i></span><br>`
            divMensajes.scrollTop=divMensajes.scrollHeight
        })
    })

    socket.on("saleUsuario", user=>{
        divMensajes.innerHTML+=`<span class="mensaje"><strong>${user}</strong> ha salido del chat... :(</span><br>`
        divMensajes.scrollTop=divMensajes.scrollHeight
    })

    inputMensaje.addEventListener("keyup", e=>{
        e.preventDefault()

        if(e.code==="Enter" && e.target.value.trim().length>0){
            socket.emit("mensaje", user, e.target.value.trim())
            e.target.value=""
            e.target.focus()
        }
    })

    socket.on("nuevoMensaje", (user, mensaje)=>{
        divMensajes.innerHTML+=`<span class="mensaje"><strong>${user}</strong> dice <i>${mensaje}</i></span><br>`
        divMensajes.scrollTop=divMensajes.scrollHeight
    })

}) // fin then swal