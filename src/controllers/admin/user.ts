import { Request, Response, NextFunction } from 'express';
import response from '../../helpers/Response'
import { validationResult } from 'express-validator'
import authServices from '../../services/auth'
import getData from '../../services/getData';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {

        const page:any = req.query.page || 1 ;

        const resData = await getData.getUsers(page);

        return response.ok(res, '12 user per page', resData);


    } catch (err) {
        next(err);
    }
}

export async function getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {

        const id:any = req.params.id ;

        const resData = await getData.getSingleUser(id);

        return response.ok(res, `user with id ${id}`, resData);


    } catch (err) {
        next(err);
    }
}