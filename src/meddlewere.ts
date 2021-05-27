import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import authAdmin from './routes/admin/auth'
import adminUser from './routes/admin/user'
import shopAdmin from './routes/admin/shop'
import shopUser from './routes/user/shop'
import userAuth from './routes/user/auth'
import userShopAuth from './routes/user/auth_required_shop'
import userPay from './routes/user/pay'
import errorHandler from './helpers/error'
import path from 'path'
import passAuth from './services/passport';


//multer
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});




const fileFilter: any = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false, new Error('only images are allowed'));
    }
}


export default (app: Application) => {

    //bodyParser
    app.use(bodyParser.json());
    //passport
    app.use(passAuth.initialize());
    //multer
    app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).array('image'));
    app.use('/images', express.static(path.join(__dirname, '../', 'images')));

    //headers meddlewere
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        next();
    });

    //admin
    app.use('/admin', authAdmin);
   
    app.use('/admin/shop', shopAdmin);

    app.use('/admin/user', adminUser);


    
    //user
    //authrization not required
    app.use('/user', shopUser);
    
    //user auth
    app.use('/user/auth', userAuth);

    //user shop 
    //authrization required
    app.use('/user/auth/shop', userShopAuth);

    app.use('/user/pay', userPay);

    //error handler
    app.use(errorHandler);

    return app;
}