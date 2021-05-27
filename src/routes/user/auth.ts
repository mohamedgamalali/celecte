import {Router} from 'express';
import * as authController from '../../controllers/user/auth' ;
import {body} from 'express-validator'
import passport from 'passport'

const router = Router();

router.put('/regester',[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail(),
    body('password','enter a password with only number and text and at least 5 characters.')
    .isLength({min:5})
    .isAlphanumeric()
    .trim(),
    body('comfirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value!=req.body.password){
            return Promise.reject('password has to match');
        }
        return true ;
    }),
    body('name').not().isEmpty().trim(),
    body('mobile')
    .not().isEmpty()
    .trim()
], authController.regester) ;


router.post('/regester/facebook',passport.authenticate('facebookToken',{session:false}),authController.facebookAuth)

router.post('/regester/google',passport.authenticate('googleToken',{session:false}),authController.googleAuth)

router.post('/login/local',[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail(),
    body('password')
    .not().isEmpty()
    .trim(),
],authController.localLogin);

export default router ;