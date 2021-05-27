import {Router} from 'express';
import {body} from 'express-validator'
import * as userController from '../../controllers/admin/user' ;
import isAuth from '../../helpers/isAuthAdmin'


const router = Router();

router.get('/users', isAuth, userController.getUsers);

router.get('/user/:id', isAuth, userController.getSingleUser);

export default router ;