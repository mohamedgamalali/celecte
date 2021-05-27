
import { Request, Response, NextFunction} from 'express';
import isAuth from '../helpers/isAuth'

export default async function(req:Request, res:Response, next:NextFunction){
    try{
        await isAuth.IsAuthrizedAdmin(req, res, next);
    }
    catch(err){
        next(err);
    }
}