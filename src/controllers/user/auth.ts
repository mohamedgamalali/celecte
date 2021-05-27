import { Request, Response, NextFunction } from 'express';
import response from '../../helpers/Response'
import Auth, { Token } from '../../helpers/isAuth'
import { validationResult } from 'express-validator'
import authServices from '../../services/auth';

const mobileValidator = require('validate-phone-number-node-js')

export async function regester(req: Request, res: Response, next: NextFunction) {

    try {

        const name: string = req.body.name;
        const mobile: string = req.body.mobile;
        const email: string = req.body.email;
        const password: string = req.body.password

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const validMobile = mobileValidator.validate(mobile);

        if (!validMobile) {
            return response.ValidationFaild(res, 'validation faild for mobile', errors.array())
        }

        const result = await Auth.registerLocal(email, password, name, mobile);

        return response.created(res, `account created with local method`, result);


    } catch (err) {

        next(err);
    }
}

export async function facebookAuth(req: Request, res: Response, next: NextFunction) {

    try {

        const token = await Auth.generateJWT(req.user, <string>process.env.JWT_PRIVATE_KEY_USER);

        return response.ok(res, 'OK', { 
            token: token, 
            user: req.user 
        });

    } catch (err) {

        next(err);
    }
}


export async function googleAuth(req: Request, res: Response, next: NextFunction) {

    try {

        const token = await Auth.generateJWT(req.user, <string>process.env.JWT_PRIVATE_KEY_USER);

        return response.ok(res, 'OK', { 
            token: token, 
            user: req.user 
        });

    } catch (err) {

        next(err);
    }
}

export async function localLogin(req: Request, res: Response, next: NextFunction) {

    try {

        const email = req.body.email;
        const password     = req.body.password;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }


        const token:Token = await authServices.login(email, password, res, 'user', <string>process.env.JWT_PRIVATE_KEY_USER)

        return response.ok(
            res,
             'logged in successfully',
             {...token});

    } catch (err) {

        next(err);
    }
}