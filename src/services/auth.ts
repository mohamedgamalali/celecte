import isAuth, { Token } from '../helpers/isAuth';
import { model } from 'mongoose'
import response from '../helpers/Response'
import { Response } from 'express'
import { compare } from 'bcryptjs';
import httpError from '../helpers/httpError';


export default class authServices extends isAuth {



    static async login(email: string, password: string, res: Response, DBmodel: string, privateKey: string) {

        try {
            let find: object = { email: email };

            if (DBmodel == 'user') {
                find = { 'local.email': email }
            }
            const User: any = model(DBmodel);

            //find user
            let user = await User.findOne(find);

            if (!user) {
                //regular error throw
                if(DBmodel == 'user'){
                    const ifFacebook = await User.findOne({ 'facebook.email': email })
                    if (ifFacebook) {
                        const error = new httpError(404, 9, 'user not found but have facebook account');
                        throw error;
                    }
    
                    const ifGoogle = await User.findOne({ 'google.email': email })
                    if (ifGoogle) {
                        const error = new httpError(404, 10, 'user not found but have google account');
                        throw error;
                    }
                }
                
                const error = new httpError(404, 5, 'user not found');
                throw error;
                //return response.NotFound(res, 'admin not found');
            }
            if (DBmodel == 'user') {
                const temp: any = user;
                user = {
                    ...temp.local,
                    _id: temp._id
                }
            }


            //compare pass
            const isEqual = await this.comparePassword(password, user.password);
            if (!isEqual) {
                //regular error throw
                const error = new httpError(401, 2, 'wrong password');
                throw error;
                //return response.unauthorized(res, 'wrong password')
            }

            const token: any = await this.generateJWT(user, privateKey);

            return token;

        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }

    }

}