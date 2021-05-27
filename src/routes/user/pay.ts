import {Router} from 'express';
import * as payController from '../../controllers/user/pay' ;
import {body} from 'express-validator'
import isAuth from '../../helpers/isAuthUser'

const router = Router();

router.post('/',[
    body('delevary')
    .not().isEmpty()
    .isNumeric(),
    body('mobile')
    .not().isEmpty(),
    body('long')
    .not().isEmpty(),
    body('lat')
    .not().isEmpty(),
    body('adress')
    .not().isEmpty(),
    body('city')
    .not().isEmpty(),
    body('token')
    .not().isEmpty(),
],isAuth, payController.pay);

export default router ;