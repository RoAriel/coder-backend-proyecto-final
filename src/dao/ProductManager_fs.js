import fs from "node:fs"

export default class ProductManager {

    constructor(pathFile) {
        this.pathFile = pathFile
    }

    async getProducts() {

        if (fs.existsSync(this.pathFile)) {
            return JSON.parse(await fs.promises.readFile(this.pathFile, { encoding: "utf-8" }));

        } else {
            return [];
        };
    }

    async addProduct(title, description, code, price, status, stock, category, thumbnail) {

        let prd;
        let pid;

        if (!title || !description || !price || !thumbnail || !code || !stock || !category)
            return 'Todos los campos son requeridos, compruebe que todos los campos esten.';

        let productos_db = await this.getProducts();

        let existCode = productos_db.some(p => p.code == code);

        if (existCode) {
            return `El codigo: ${code}, ya existe para otro producto.`;
        } else {

            let maxIdProducts = Math.max(...productos_db.map(p => p.pid));
            pid = maxIdProducts + 1
            prd = {
                pid: pid,
                title: title,
                description: description,
                code: code,
                price: price,
                status: true,
                stock: stock,
                category: category,
                thumbnail: [thumbnail]

            };

            productos_db.push(prd);
            await fs.promises.writeFile(this.pathFile, JSON.stringify(productos_db,null,2));

            return `Producto agregado. ID: ${pid}`;
        };

    };

    async getProductById(pid) {
        let productos_db = await this.getProducts();

        let prd = productos_db.find(p => p.pid == pid);        

        if (prd) {
            return prd;
        } else {
            return `Producto no encontrado con el pid: ${pid}`;
        }

    };

    async updateProduct(pid, campo, nuevoValor) {

        if (campo == "pid") { return "No puede modificar este atributo" }

        let prd = await this.getProductById(pid)

        let productos_db = (await this.getProducts()).filter(p => p.pid != pid);


        if (prd[`${campo}`]) {

            prd[`${campo}`] = nuevoValor;

            productos_db.push(prd);

            await fs.promises.writeFile(this.pathFile, JSON.stringify(productos_db,null,2));

            return (`Update completo al producto ID: ${pid}`);

        } else { return "No se encontro artibuto" };
    };

    async deleteProduct(pid) {

        let productos_db = await this.getProducts();
        let existCode = productos_db.some(p => p.pid == pid);

        if (existCode) {

            let newProductos_db = (await this.getProducts()).filter(p => p.pid != pid);
            await fs.promises.writeFile(this.pathFile, JSON.stringify(newProductos_db,null,2));
            return "Producto eliminado."
        } else {
            return "Producto Id no encontrado."
        }
    };
};
