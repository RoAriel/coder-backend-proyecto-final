export const errorCause = (errorSite, errorName, cause) =>{

    let descripcion = `[ ${errorName} ] ${errorSite} --> ${cause}`

    return descripcion

    }