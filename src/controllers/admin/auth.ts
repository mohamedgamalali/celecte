import { Request, Response, NextFunction } from 'express';
import response from '../../helpers/Response'
import { validationResult } from 'express-validator'
import authServices from '../../services/auth'

// hash('admin',12)
// .then(result=>{
//     const admin = new Admin({
//         email:'admin@admin.com',
//         password:result
//     })
//     admin.save(r=>{
//         console.log("created");

//     })
// })

export async function postLogin(req: Request, res: Response, next: NextFunction) {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        // const admin:any = await Admin.findOne({
        //     email: email
        // });

        // if (!admin) {
        //     return response.NotFound(res, 'admin not found')
        // }

        // const isEqual = await compare(password, admin.password);
        // if (!isEqual) {
        //     return response.unauthorized(res, 'wrong password')
        // }

        // const token = sign(
        //     {
        //         email: admin.email,
        //         adminId: admin._id.toString(),
        //     },
        //     <string>process.env.JWT_PRIVATE_KEY_ADMIN,
        //     { expiresIn: '3h' }
        // );

        const token = await authServices.login(email, password, res, 'admin', <string>process.env.JWT_PRIVATE_KEY_ADMIN)

        return response.ok(
            res,
             'logged in successfully',
             {...token});

    } catch (err) {
        next(err);
    }
}