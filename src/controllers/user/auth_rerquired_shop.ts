import { Request, Response, NextFunction } from 'express';
import response from '../../helpers/Response'
import { validationResult } from 'express-validator'
import Product from '../../models/product';
import User from '../../models/user';
import Category from '../../models/category';
import { Types } from 'mongoose'
import getData from '../../services/getData';

export async function addToCart(req: Request, res: Response, next: NextFunction) {

    try {

        const productId: Types.ObjectId = req.body.productId;
        const amount: number = req.body.amount;
        const size: string = req.body.size;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const product = await Product.findById(productId);

        if (!product) {
            return response.NotFound(res, 'product not found with this id', product)
        }
        if (product.hide === true) {
            return response.CustomResponse(res, 409, 'hidden product', product.hide, 12);

        }

        if (((product.stock - amount) < 0 && product.stock >= 0)) {
            return response.CustomResponse(res, 409, 'out of stock', product.stock, 11);
        }
        const productSize: any = product.size;
        const foundSize: string[] = productSize.filter((item: any) => { return item === size; });
        if (foundSize.length === 0) {
            return response.ValidationFaild(res, 'size not found in product', productSize);
        }


        const user = await User.findById(req.user).select('cart');

        const UpdatedUser = await user?.addToCart(product._id, amount, size, 'product', product.stock);

        return response.ok(res, 'added to cart', UpdatedUser);


    } catch (err) {

        next(err);
    }
}


export async function deleteCart(req: Request, res: Response, next: NextFunction) {

    try {

        const itemId: Types.ObjectId = req.body.itemId;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const user = await User.findById(req.user).select('cart');

        const updatedUser = await user?.removeFromCart(itemId);

        return response.ok(res, 'deleted from cart', updatedUser);


    } catch (err) {

        next(err);
    }
}


export async function getCart(req: Request, res: Response, next: NextFunction) {

    try {

        const user = await User.findById(req.user)
            .select('cart')
            .populate({
                path: 'cart.product',
                select: 'name stock price OfferAvilable offerPrice hide images'
            });

        const {total,cart} = await getData.calculateCart(user?.cart);

        return response.ok(res, 'user cart', { user, total });


    } catch (err) {

        next(err);
    }
}


export async function addToWishList(req: Request, res: Response, next: NextFunction) {

    try {

        const productId: Types.ObjectId = req.body.productId;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const product = await Product.findById(productId);

        if (!product) {
            return response.NotFound(res, 'product not found with this id', product)
        }
        if (product.hide === true) {
            return response.CustomResponse(res, 409, 'hidden product', product.hide, 12);

        }



        const user = await User.findById(req.user).select('wishList');

        const UpdatedUser = await user?.addToWishList(product._id, 'product');

        return response.ok(res, 'added to wish list', UpdatedUser);


    } catch (err) {

        next(err);
    }
}


export async function removeWishList(req: Request, res: Response, next: NextFunction) {

    try {

        const productId: Types.ObjectId = req.body.productId;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }



        const user = await User.findById(req.user).select('wishList');

        const UpdatedUser = await user?.removeWishList(productId);

        return response.ok(res, 'removed from wish list', UpdatedUser);


    } catch (err) {

        next(err);
    }
}

export async function getWishList(req: Request, res: Response, next: NextFunction) {

    try {


        const user = await User.findById(req.user).select('wishList')
            .populate({
                path: 'wishList.product',
                select: 'name stock price OfferAvilable offerPrice hide images'
            });

        return response.ok(res, 'user wish list', user);


    } catch (err) {

        next(err);
    }
}

//orders
export async function getOrders(req: Request, res: Response, next: NextFunction) {

    try {

        const page = req.query.page || 1 ;
        const arrived = Boolean(Number(req.query.arrived))  ;
        

        const {orders, total} = await getData.getOrders(<number> page,<boolean> arrived,req.user);

        return response.ok(res, `user:${req.user} orders`, {
            orders:orders,
            total:total
        })


    } catch (err) {

        next(err);
    }
}

export async function singleOrder(req: Request, res: Response, next: NextFunction) {

    try {

        const id:any = req.params.id ;
        const order = await getData.singleOrder(id);

        if(!order){
            return response.NotFound(res, 'order not found', order)
        }   

        return response.ok(res, 'order found', order) ;


    } catch (err) {

        next(err);
    }
}
