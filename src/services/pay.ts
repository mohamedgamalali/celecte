import { Types, Document } from 'mongoose';
import Stripe from 'stripe';
import User, { user as userType } from '../models/user';
import Product from '../models/product';
import Order, { order } from '../models/order';
import httpError from '../helpers/httpError';
import { userPaymentData } from '../helpers/types';
import { config } from 'dotenv';

console.log(process.env.STRIPE);


const stripe = new Stripe('sk_test_e9IVtxb4lQSwEc2dfVzOtAeQ00008MTkMh', {
    apiVersion: '2020-08-27'
});


export default class stripePay {

    private userId: Types.ObjectId;
    private userPayData: userPaymentData;

    constructor(userId: Types.ObjectId, userPayData: userPaymentData) {
        this.userId = userId;
        this.userPayData = userPayData;
    }

    private async createCustomer() {
        try {
            let userInfo: object = {};
            const user: any = await User.findById(this.userId).select('-mobile -blocked -cart -wishList');
            switch (user?.method) {
                case 'local':
                    userInfo = {
                        name: user.local.name,
                        email: user.local.email,
                        source: this.userPayData.token
                    };
                    break;
                case 'google':
                    userInfo = {
                        name: user.google.name,
                        email: user.google.email,
                        source: this.userPayData.token
                    };
                    break;
                case 'facebook':
                    userInfo = {
                        name: user.facebook.name,
                        email: user.facebook.email,
                        source: this.userPayData.token
                    };
                    break;
            }
            const newCustomer = await stripe.customers.create({ ...userInfo });
            user.stripeId = newCustomer.id;
            await user.save();
            return newCustomer;
        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }

    }

    private async isCustomerEx() {
        try {
            let userInfo: object = {};
            const user = await User.findById(this.userId).select('stripeId');
            if (user?.stripeId) {
                const customer = await stripe.customers.retrieve(user.stripeId);
                if (customer) {
                    return customer;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }
    }

    async pay() {

        try {
            let customer: object;
            let charge: any;
            const userCart = await User.findById(this.userId)
                .select('cart')
                .populate({
                    path: 'cart.product',
                    select: 'price stock hide sold'
                });
            //prePay

            await this.prePay(userCart?.cart);


            //1st check for customer
            const isCustomer: any = await this.isCustomerEx();

            if (!isCustomer) {
                customer = await this.createCustomer();
            } else {
                customer = isCustomer;
            }

            try {
                charge = await stripe.charges.create({
                    amount: this.userPayData.cartPrice + this.userPayData.delevary,
                    currency: 'EGP',
                    source: this.userPayData.token,
                    description: `payment for user ${this.userId}`,
                    metadata: {
                        user: this.userId.toString(),
                        orderId: 'not assingned yet',
                        delevary: this.userPayData.delevary
                    }
                });
            } catch (err1) {
                console.log(err1.raw);

                await this.errorHandler(err1.raw);
            }



            if (charge.status !== 'succeeded') {
                await this.errorHandler(charge);
            }

            const order = await this.afterPay(userCart, charge.id)

            const upadteCharge = await stripe.charges.update(charge.id, { metadata: { orderId: order._id.toString() } });

            return order;


        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }


        //to be contenue
    }

    private async prePay(cart: any) {
        try {

            if (cart.length == 0) {
                const err = new httpError(409, 1009, 'empty cart');
                throw err;
            }

            cart.forEach((i: any) => {

                if (i.product.stock == 0 || i.product.stock < -1) {
                    const err = new httpError(409, 1000, 'out of stock product');
                    throw err;
                }

                if (i.product.hide) {
                    const err = new httpError(409, 1001, 'deleted product');
                    throw err;
                }

            });


        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }
    }

    private async afterPay(user: userType & Document | null, transactionId: string) {
        try {


            const newOrder = new Order({
                cart: this.userPayData.cart,
                user: user?._id,
                mobile: this.userPayData.mobile,
                Location: this.userPayData.Location,
                adress: this.userPayData.adress,
                transactionId: transactionId,
                cartPrice: this.userPayData.cartPrice,
                delevary: this.userPayData.delevary,
                city: this.userPayData.city
            });

            const finalOrder = await newOrder.save();

            if (user) user.cart = [];

            await user?.save();


            finalOrder?.cart.forEach(async (i: any) => {
                const product = await Product.findById(i.product).select('stock sold');


                if (product) {

                    if (product.stock != -1)
                        product.stock -= i.amount;
                        
                    product.sold += i.amount;
                    await product?.save();

                }


            });

            return finalOrder;


        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }
    }

    private async errorHandler(body: any) {
        try {

            let err: any;
            switch (body.type) {
                case 'StripeCardError':
                    // A declined card error
                    // => e.g. "Your card's expiration year is invalid."
                    err = new httpError(402, 1002, body.message);
                    throw err;
                case 'StripeRateLimitError':
                    // Too many requests made to the API too quickly
                    err = new httpError(402, 1003, 'Too many requests made to the API too quickly');
                    throw err;
                case 'StripeInvalidRequestError':
                    // Invalid parameters were supplied to Stripe's API
                    err = new httpError(402, 1004, "Invalid parameters were supplied to Stripe's API");
                    throw err;
                case 'StripeAPIError':
                    // An error occurred internally with Stripe's API
                    err = new httpError(402, 1005, "An error occurred internally with Stripe's API");
                    throw err;
                case 'StripeConnectionError':
                    // Some kind of error occurred during the HTTPS communication
                    err = new httpError(402, 1006, "Some kind of error occurred during the HTTPS communication");
                    throw err;
                case 'StripeAuthenticationError':
                    // You probably used an incorrect API key
                    err = new httpError(402, 1007, "You probably used an incorrect API key");
                    throw err;
                default:
                    // Handle any other types of unexpected errors
                    err = new httpError(402, 1008, body.message);
                    throw err;
            }

        } catch (err) {
            if (!err.status) {
                err.status = 500;
                err.state = 0;
            }
            throw err;
        }
    }
}