const comprar=async(pid,prdName)=>{
    let inputCart=document.getElementById("cart")
    let cid=inputCart.value

    let respuesta=await fetch(`/api/carts/${cid}/products/${pid}`,{
        method:"post"
    })
    if(respuesta.status===200){
        let datos=await respuesta.json()
        Swal.fire({
            text:`Producto ${prdName} agregado!!!`,
            toast:true,
            position:"top-right"
        })
    }
}