import {Router, Request, Response, NextFunction} from 'express';
import * as shopController from '../../controllers/user/shop' ;


const router = Router();

router.get('/landing',shopController.getLandingPage);

router.get('/category',shopController.getCategories);

router.get('/products',shopController.getProducts);

router.get('/product/:id',shopController.singleProduct);

router.get('/products/search',shopController.search);



export default router ;