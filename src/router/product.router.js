import { Router } from 'express';
import { passportCall } from '../utils/passportCallHandle.js'
import { auth } from '../middleware/auth.js';
import { getAllProducts, getProductByPid, createNewProduct, updateProduct,deleteProduct, mockingproducts} from '../controllers/product_controller.js';

export const router = Router()

router.get('/mockingproducts',mockingproducts)

router.get('/', passportCall('current'), getAllProducts)

router.get('/:pid', getProductByPid)

router.post('/', passportCall('current'), auth(['admin','premium']), createNewProduct)

router.delete('/:pid', passportCall('current'), auth(['admin','premium']), deleteProduct)

router.put('/:pid', passportCall('current'), auth(['admin']), updateProduct)
