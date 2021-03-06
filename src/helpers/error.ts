import { Request,Response, NextFunction} from 'express'
import httpError from './httpError'
import response from './Response'
 
export default function(error:httpError, req:Request, res:Response, next:NextFunction){
    const status:number  = error.status  || 500;
    const state:number   = error.state   || 0;
    const message:string = error.message || 'somesing went wrong';

    if(status===500){
        response.serverError(res, message);
    }else{
        response.CustomResponse(res, status, message, 'error', state );
    }
} 