import { Request, Response, NextFunction } from 'express';
import Pay from '../../services/pay';
import getData from '../../services/getData';
import { userPaymentData } from '../../helpers/types';
import response from '../../helpers/Response'
import { Types } from 'mongoose';
import User from '../../models/user';

export async function pay(req: Request, res: Response, next: NextFunction) {

    try {

        const delevary: number = req.body.delevary;
        const mobile: string = req.body.mobile;
        const long: number = req.body.long;
        const lat: number = req.body.lat;
        const adress: string = req.body.adress;
        const city: string = req.body.city;
        const token: string = req.body.token;
        //calculate cart

        const userCart = await User.findById(req.user)
            .select('cart')
            .populate({
                path: 'cart.product',
                select: 'price OfferAvilable offerPrice' 
            });

    

        const {total, cart} = await getData.calculateCart(userCart?.cart);


        const userPayData: userPaymentData = {
            delevary: delevary * 100,
            mobile: mobile,
            Location: {
                type: "Point",
                coordinates: [long, lat]
            },
            adress: adress,
            cartPrice: total * 100,
            city: city,
            token: token,
            cart:cart
        };

        const payment = new Pay(<Types.ObjectId>req.user, userPayData);

        const order = await payment.pay();

        return response.created(res, 'order created', order)


    } catch (err) {

        next(err);
    }
}