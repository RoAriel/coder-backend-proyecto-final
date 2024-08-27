export class UserDto {
    constructor(user) {
        this.first_name = user.first_name
        this.last_name = user.last_name ? user.last_name : null
        this.age = user.age
        this.email = user.email
        this.cart = user.cart
        this.rol = user.rol
    }
}