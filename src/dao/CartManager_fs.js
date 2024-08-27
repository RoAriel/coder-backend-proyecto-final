import fs from 'node:fs';
import ProductManager from './ProductManager_fs.js';

export default class CartManager {

    constructor(pathFile, producManager) {
        this.pathFile = pathFile
        this.producManager = producManager
    }

    async getCarts() {

        if (fs.existsSync(this.pathFile)) {
            return JSON.parse(await fs.promises.readFile(this.pathFile, { encoding: "utf-8" }));

        } else {
            return [];
        };
    }

    async getProductByCartId(cid) {
        let carts_bd = await this.getCarts();

        let cart = carts_bd.find(p => p.cid == cid);

        if (cart) {

            let { products } = cart
            return products
        } else {
            return `Cart no encontrado con el id: ${cid}`;
        }

    };
    async addCart(listProducts) {

        let newID

        let bd_carts = await this.getCarts() // para ver el ID

        let maxCartID = Math.max(...(bd_carts.map(c => c.cid))) // Obtengo el maxID (esto si es por si el  carts.json esta inicializado)

        let bd_idProducts = (await this.producManager.getProducts()).map(pr => pr.id)// para controlar que el pr exista

        let pIds = listProducts.map(pr => pr.pid) // obtengo los pids de los productos a agregar

        if (pIds.every(id => bd_idProducts.includes(id))) {

            newID = maxCartID + 1
            let cart = {
                cid: newID,
                products: listProducts
            }

            bd_carts.push(cart);
            await fs.promises.writeFile(this.pathFile, JSON.stringify(bd_carts, null, 2));
            return `Carrito agregado. ID: ${newID}`;

        } else {
            return 'Producto/s no encontrado/s en la DB de productos'
        }

    };

    async addProductToCart(cid, pid) {
        let pr = await this.producManager.getProductById(pid)
        let prCart = await this.getProductByCartId(cid)

        let cart = (await this.getCarts()).filter(cart => cart.cid == cid)

        let bd_carts = (await this.getCarts()).filter(cart => cart.cid != cid)

        if ((prCart.map(pr => pr.pid)).includes(pid)) {
            prCart.forEach(pr => { if (pr.pid == pid) pr.quantity++ })
            cart[0].products = prCart

            bd_carts.push(cart[0])

            await fs.promises.writeFile(this.pathFile, JSON.stringify(bd_carts, null, 2));
            return `ProductId ${pid} agregado al Cart Id ${cid} `;

        } else {

            let pr = await this.producManager.getProductById(pid)

            if (!(typeof(pr) != Object)) {
                prCart.push({ pid: pid, quantity: 1 })
                cart[0].products = prCart

                bd_carts.push(cart[0])

                await fs.promises.writeFile(this.pathFile, JSON.stringify(bd_carts, null, 2));
                return `ProductId ${pid} agregado al Cart Id ${cid} `;
            } else {
                return `El producto de ID ${pid} no existe`
            }
        }




    }
}