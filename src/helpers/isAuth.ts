import { compare, hash } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import httpError from './httpError'
import Admin from '../models/admin'
import User from '../models/user'
import { Profile } from 'passport-facebook-token'

//create new object in request
export interface IGetUserAuthInfoRequest extends Request {
    userId: string
}

//token type
export type Token = {
    email: string,
    id: string,
} | any;

export default class Auth {

    static async hashedPassword(password: string) {
        return await hash(password, 12);
    }

    static async comparePassword(password: string, hashedPassword: string) {
        return await compare(password, hashedPassword);
    }

    static async generateJWT(user: any, privateKye: string) {
        return {
            token: sign(
                {
                    email: user.email,
                    id: user._id.toString(),
                },
                privateKye,
                { expiresIn: '3h' }
            ),
            expiresIn: 10000000,
            email: user.email
        };
    }

    static async getToken(req: Request) {
        try {
            const authHeader: string | undefined = req.get('Authorization');

            if (!authHeader) {
                //regular error throw
                const error = new httpError(401, 2, 'missed JWT header');
                throw error;
            }
            return authHeader.split(' ')[1];
        } catch (err) {

            throw err;
        }

    }

    static async verifyToken(token: string, privateKey: string) {

        try {
            const decodedToken: Token = await verify(token, privateKey);
            if (!decodedToken) {
                //regular error throw
                const error = new httpError(401, 2, 'not authrized');
                throw error;
            }
            return decodedToken;

        } catch (err) {
            //regular error throw
            const error = new httpError(401, 2, err.message);
            throw error;
        }

    }
    static async IsAuthrizedAdmin(req: any, res: Response, next: NextFunction) {
        try {
            //get token

            const token: string = await this.getToken(<Request>req);


            //decode token
            const decodedToken: Token = await this.verifyToken(token, <string>process.env.JWT_PRIVATE_KEY_ADMIN);

            //check for admin
            const admin = await Admin.findById(decodedToken.id);

            if (!admin) {
                //regular error throw
                const error = new httpError(404, 2, 'admin not found');
                throw error;
            }

            req.userId = decodedToken.id;

            next();
        } catch (err) {
            next(err);
        }
    }

    //user
    private static async checkForRegesteredEmail(email: string) {
        try {

            const userFacebook = await User.findOne({ 'facebook.email': email })
            const userGoogle = await User.findOne({ 'google.email': email })
            const userLocal = await User.findOne({ 'local.email': email })

            if (userFacebook || userGoogle || userLocal) {
                const error = new httpError(409, 8, 'email allready regestered try login');
                throw error;
            }

            return false;

        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0
            }
            throw err
        }
    }

    private static async checkForRegesteredMobile(mobile: string) {
        try {

            const userFacebook = await User.findOne({ mobile: mobile })

            if (userFacebook) {
                const error = new httpError(409, 8, 'mobile allready regestered try login');
                throw error;
            }

            return false;

        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0
            }
            throw err
        }
    }

    static async registerLocal(email: string, password: string, name: string, mobile: string) {
        try {

            //values come here after validation for:-
            //mobile 'valid mobile'
            //email 'valid normalized email'
            //password 'valida pass'


            const emailRegesterd = await this.checkForRegesteredEmail(email);

            if (emailRegesterd) {
                const error = new httpError(409, 8, 'email allready regestered try login');
                throw error;
            }

            const mobileRegesterd = await this.checkForRegesteredMobile(mobile);

            if (mobileRegesterd) {
                const error = new httpError(409, 8, 'mobile allready regestered try login');
                throw error;
            }

            const hasedPass: string = await this.hashedPassword(password);

            const newUser = new User({
                method: 'local',
                local: {
                    email: email,
                    password: hasedPass,
                    name: name,
                },
                mobile: mobile,
            });

            const user = await newUser.save();

            const token: Token = await this.generateJWT({
                _id: user._id,
                email: user.local.email
            }, <string>process.env.JWT_PRIVATE_KEY_USER)

            return token;


        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0
            }
            throw err
        }
    }

    static async regesterSocialMedia(profile: Profile, method: string, req: any) {
        try {

            //this method works for social media "facebook, google" with merging accounts, login or regestration
            if (method == 'facebook') {
                const user = await User.findOne({ 'facebook.id': profile.id }).select('local google facebook mobile');

                if (user) {
                    req.user = {
                        _id: user._id,
                        email: user.facebook.email
                    };
                    return user;
                }

                const ifUserLocal = await User.findOne({ 'local.email': profile.emails[0].value }).select('-blocked -local.password')
                if (ifUserLocal) {
                    req.user = {
                        _id: ifUserLocal._id,
                        email: ifUserLocal.local.email
                    };
                    return ifUserLocal;
                }

                const ifUserGoogle = await User.findOne({ 'google.email': profile.emails[0].value }).select('local google facebook mobile');
                if (ifUserGoogle) {
                    req.user = {
                        _id: ifUserGoogle._id,
                        email: ifUserGoogle.google.email
                    };
                    return ifUserGoogle;
                }

                const newUser = new User({
                    method: 'facebook',
                    facebook: {
                        id: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        photo: profile.photos[0].value
                    }
                });

                const newClientFacebook = await newUser.save();

                req.user = {
                    _id: newClientFacebook._id,
                    email: newClientFacebook.facebook.email
                };

                return newClientFacebook;
            } else if (method == 'google') {
                const user = await User.findOne({ 'google.id': profile.id }).select('blocked method local google facebook mobile');

                if (user) {
                    req.user = {
                        _id: user._id,
                        email: user.google.email
                    };
                    return user;
                }

                const ifUserLocal = await User.findOne({ 'local.email': profile.emails[0].value }).select('-blocked -local.password')
                if (ifUserLocal) {
                    req.user = {
                        _id: ifUserLocal._id,
                        email: ifUserLocal.local.email
                    };
                    return ifUserLocal;
                }

                const ifUserFacebook = await User.findOne({ 'facebook.email': profile.emails[0].value }).select('blocked method local google facebook mobile');
                if (ifUserFacebook) {
                    req.user = {
                        _id: ifUserFacebook._id,
                        email: ifUserFacebook.facebook.email
                    };
                    return ifUserFacebook;
                }

                const newUser = new User({
                    method: 'google',
                    google: {
                        id: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        photo: profile.photos[0].value
                    }
                });

                const newClientGoogle = await newUser.save();

                req.user = {
                    _id: newClientGoogle._id,
                    email: newClientGoogle.google.email
                };

                return newClientGoogle;
            }



        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0
            }
            throw err
        }
    }

    static async IsAuthrizedUser(req: Request, res: Response, next: NextFunction) {
        try {
            //get token

            const token: string = await this.getToken(<Request>req); 


            //decode token
            const decodedToken: Token = await this.verifyToken(token, <string>process.env.JWT_PRIVATE_KEY_USER);

            //check for admin
            const user = await User.findById(decodedToken.id);

            if (!user) {
                //regular error throw
                const error = new httpError(404, 2, 'user not found');
                throw error;
            }

            if (user.blocked == true) {
                //regular error throw
                const error = new httpError(403, 4, 'user blocked');
                throw error;
            }

            req.user = decodedToken.id;

            next();
        } catch (err) {
            next(err);
        }
    }

    static async optionalAuth(req: Request, res: Response, next: NextFunction) {
        try {
            //get token

            const authHeader: string | undefined = req.get('Authorization');

            if (!authHeader) {
                return false
            }
            const token = authHeader.split(' ')[1];
            const decodedToken: Token = await verify(token, <string>process.env.JWT_PRIVATE_KEY_USER);
            if (!decodedToken) {
                return false
            }
            
            const user = await User.findById(decodedToken.id);

            if (!user) {
                return false
            }

            req.user = decodedToken.id;

            return true ;
        } catch (err) {
            throw err ;
        }
    }


}

