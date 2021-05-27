import { Request, Response, NextFunction } from 'express';
import response from '../../helpers/Response'
import isAuth from '../../helpers/isAuth'
import { validationResult } from 'express-validator'
import Product from '../../models/product';
import Category from '../../models/category';
import { Types } from 'mongoose'
import getData from '../../services/getData';
import product from '../../models/product';
import User from '../../models/user';

export async function getLandingPage(req: Request, res: Response, next: NextFunction) {


    try {

        const landingPage = await getData.LandingPage();

        return response.ok(res, 'landing page', landingPage);


    } catch (err) {

        next(err);
    }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {


    try {

        const Categories = await getData.getCategories();

        return response.ok(res, 'Categories', Categories);


    } catch (err) {

        next(err);
    }
}

export async function getProducts(req: Request, res: Response, next: NextFunction) {


    try {

        const catigory: any = req.query.catigory || false;
        const page: any = req.query.page || 1;
        const sort: any = req.query.sort || 1;
        const order: any = req.query.order || -1  // or 1;

        const getDataResult = await getData.getProducts(page, sort, catigory, order, false);


        return response.ok(res, `products in page ${page}, with sort ${sort}, and order ${order}`, getDataResult);




    } catch (err) {

        next(err);
    }
}

export async function singleProduct(req: Request, res: Response, next: NextFunction) {


    try {

        let inWishList: boolean = false;

        const id: Types.ObjectId | string = req.params.id;

        const product = await getData.singleProduct(id);

        if (!product) {
            return response.NotFound(res, 'product not found with this id', product)
        }
        if (product.hide == true) {
            return response.Forbidden(res, 'you are not allowed to assess this data')
        }

        await isAuth.optionalAuth(req, res, next);

        const user = await User.findById(req?.user).select('wishList');
        
        const found = user?.wishList.find((i: any) =>  i.product == id );
    
        if (found) inWishList = true;


        const relatedProducts = await getData.getProducts(1, 3, product.category._id, -1, false)

        return response.ok(res, 'product', {
            product: product,
            inWishList: inWishList,
            relatedProducts: relatedProducts
        });



    } catch (err) {

        next(err);
    }
}

export async function search(req: Request, res: Response, next: NextFunction) {


    try {

        const query: any = req.query.searchQ;
        const page: any = req.query.page || 1;
        const category: any = req.query.category || false;

        const searchResult = await getData.search(query, category, page);

        return response.ok(res, 'search', searchResult);



    } catch (err) {
        console.log(err);

        next(err);
    }
}

