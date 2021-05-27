import passport from 'passport';

import facebookStrategy, { Profile } from 'passport-facebook-token';

const googlePlusToken = require('passport-google-plus-token');

import { Request } from 'express'
import User from '../models/user';

import Auth from '../helpers/isAuth' ;

passport.use('facebookToken', new facebookStrategy({
    clientID:'488236982553763',
    clientSecret: 'cf8acb643ff8f6dc582983c90ecee103',
    passReqToCallback: true
}, async (req:Request, accessToken:any, refreshToken:any, profile:Profile, done) => {
    try {

        

        const result = await Auth.regesterSocialMedia(profile, 'facebook', req);
        return done(null, result);

    } catch (err) {
        done(err, false);
    }

}));

passport.use('googleToken', new googlePlusToken({
    clientID:'    1028860407773-pggkpmij4dr643njcl5tr955uist2aec.apps.googleusercontent.com',
    clientSecret: '28Crc7QyMAcpDgItQlO2C-d9',
    passReqToCallback: true
}, async (req:Request, accessToken:any, refreshToken:any, profile:Profile, done:any) => {
    try {

        const result = await Auth.regesterSocialMedia(profile, 'google', req);
        return done(null, result);

    } catch (err) {
        done(err, false);
    }
    

}))

export default passport;