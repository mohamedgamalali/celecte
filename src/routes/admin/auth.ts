import {Router} from 'express';
import {body} from 'express-validator'
import * as authController from '../../controllers/admin/auth' ;


const router = Router();

router.post('/login',[
    body('email')
    .not().isEmpty()
    .trim(),
    body('password')
    .not().isEmpty()
],authController.postLogin );

export default router ;