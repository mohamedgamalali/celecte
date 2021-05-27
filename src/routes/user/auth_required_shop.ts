import {Router} from 'express';
import * as shopController from '../../controllers/user/auth_rerquired_shop' ;
import {body} from 'express-validator'
import isAuth from '../../helpers/isAuthUser'

const router = Router();

router.post('/addToCart',[
    body('productId')
    .not().isEmpty(),
    body('amount')
    .not().isEmpty()
    .isNumeric(),
    body('size')
    .not().isEmpty(),
],isAuth, shopController.addToCart);

router.get('/cart',isAuth, shopController.getCart);

router.delete('/cart',[
    body('itemId')
    .not().isEmpty(),
],isAuth, shopController.deleteCart);

router.post('/addToWishList',[
    body('productId')
    .not().isEmpty(),
],isAuth, shopController.addToWishList);

router.delete('/WishList',[
    body('productId')
    .not().isEmpty(),
],isAuth, shopController.removeWishList);

router.get('/WishList' ,isAuth, shopController.getWishList);

router.get('/orders'   ,isAuth, shopController.getOrders);

router.get('/singleOrder/:id'   ,isAuth, shopController.singleOrder);


export default router ;