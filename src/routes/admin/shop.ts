import { Router } from 'express';
import { body } from 'express-validator'
import * as shopController from '../../controllers/admin/shop';
import isAuth from '../../helpers/isAuthAdmin'


const router = Router();



router.put('/addProduct', [
    body('name')
        .not().isEmpty(),
    body('category')
        .not().isEmpty(),
    body('desc')
        .not().isEmpty(),
    body('price')
        .not().isEmpty()
        .isNumeric(),
    body('size')
        .not().isEmpty(),
    body('stock')
        .not().isEmpty()
        .isNumeric(),
], isAuth, shopController.putProduct);

router.post('/editProduct', [
    body('productId')
        .not().isEmpty(),
    body('name')
        .not().isEmpty(),
    body('desc')
        .not().isEmpty(),
    body('price')
        .not().isEmpty()
        .isNumeric(),
    body('size')
        .not().isEmpty(),
    body('stock')
        .not().isEmpty()
        .isNumeric(),
], isAuth, shopController.editProduct);

router.post('/hide', [
    body('productId')
        .not().isEmpty()
], isAuth, shopController.postHide);

router.get('/products', shopController.getProducts)

//category
router.put('/addCategory', [
    body('name')
        .not().isEmpty()
], isAuth, shopController.putCategory);

router.post('/edit/category', [
    body('name')
        .not().isEmpty(),
    body('categoryId')
        .not().isEmpty()
], isAuth, shopController.editCategory);

router.post('/hide/category', [
    body('categoryId')
        .not().isEmpty()
], isAuth, shopController.hideCategory);

router.get('/category', isAuth, shopController.getCategory);

//make product as new arrival
router.post('/product/newArrival', [
    body('productId')
        .not().isEmpty()
], isAuth, shopController.postNewArrial);


router.post('/product/addOffer', [
    body('productId')
        .not().isEmpty(),
    body('price')
        .not().isEmpty()
], isAuth, shopController.postOffer);

router.post('/product/cancelOffer', [
    body('productId')
        .not().isEmpty()
], isAuth, shopController.postCancelOffer);

router.get('/product/:id', isAuth, shopController.singleProduct);

router.get('/products/search', isAuth, shopController.search);

//customize

router.post('/customize/add/chain', [
    body('name')
        .not().isEmpty(),
    body('item')
        .not().isEmpty(),
], isAuth, shopController.addChain);

router.post('/customize/add/medal', [
    body('name')
        .not().isEmpty(),
    body('price')
        .not().isEmpty().isNumeric()
        .custom((value)=>{
            if(value<= 0){
                return Promise.reject('price must be greater than 0');
            }
            return true ;
        }),
], isAuth, shopController.addMedal);

router.get('/customize/medal', isAuth, shopController.getMedal);

router.get('/customize/chain', isAuth, shopController.getChain);

//orders
router.get('/orders', isAuth, shopController.getOrders);

router.get('/singleOrder/:id'   ,isAuth, shopController.singleOrder);


export default router;