import Products from '../models/product';
import Category from '../models/category';
import { Types } from 'mongoose';
import category from '../models/category';
import Medal from '../models/medal';
import Chain from '../models/chain';
import response from '../helpers/Response'
import { getUsers } from '../controllers/admin/user';
import User from '../models/user';
import Order, { order } from '../models/order';


export default class getData {

    static readonly productPerPage = 12;

    static async getProducts(page: number = 1, sort: number, category: Types.ObjectId, order: number = -1, hidden: boolean = true) {

        try {
            let find: object = {};
            enum sortFilds {
                createdAt = 1, //date
                sold,          //top selling
                views,         //hotItem
                price,         //price
                stock,         //stock
            }

            if (category) {
                find = {
                    category: <Types.ObjectId & undefined>category
                }

            }

            if (!hidden) {
                find = {
                    ...find,
                    hide: false
                }
            }



            const products = await Products.find(find)
                .sort([[sortFilds[sort], order]])
                .skip((page - 1) * this.productPerPage)
                .limit(this.productPerPage)
                .select('price name images hide');

            const total = await Products.find(find)
                .countDocuments();

            return {
                products: products,
                total: total
            }
        }
        catch (err) {
            throw err;
        }
    }


    static async getNewArrival() {

        try {
            const product = await Products.find({ newArrival: true }).select('images name');

            return product;

        }
        catch (err) {
            throw err;
        }
    }

    static async getHotItem() {

        try {
            const product = await Products.find()
                .sort({ views: -1 })
                .skip(0)
                .limit(2)
                .select('images name');

            return product[0];

        }
        catch (err) {
            throw err;
        }
    }

    static async getCategories() {

        try {
            const category = await Category.find({ hide: false });

            return category;

        }
        catch (err) {
            throw err;
        }
    }

    static async getOffers() {

        try {
            const offers = await Products.find({ OfferAvilable: true })
                .select('name images desc')
                .skip(0)
                .limit(5);

            const total = await Products.find({ OfferAvilable: true })
                .countDocuments();


            return {
                offers: offers,
                total: total
            };

        }
        catch (err) {
            throw err;
        }
    }

    static async LandingPage() {

        try {
            const NewArrival = await this.getNewArrival();
            const hotItem = await this.getHotItem();
            const categories = await this.getCategories();
            const offers = await this.getOffers();

            return {
                NewArrival: NewArrival,
                hotItem: hotItem,
                categories: categories,
                offers: offers
            }
        }
        catch (err) {
            throw err;
        }
    }

    static async singleProduct(id: Types.ObjectId | string, admin: boolean = false) {
        try {

            let product;
            if (!admin) {
                product = await Products.findById(id)
                    .select('name desc price size images stock hide category OfferAvilable offerPrice views')
                    .populate({ path: 'category', select: 'name' });
            } else {
                product = await Products.findById(id)
                    .populate({ path: 'category', select: 'name' });
            }

            if (!product) {
                return false
            }
            if (!admin) {
                product.views = product.views + 1;
                await product.save();
            }
            return product;
        }
        catch (err) {
            throw err;
        }
    }

    static async search(query: string, category: Types.ObjectId, page: number = 1) {
        try {
            let find: object = {
                $or: [
                    { name: new RegExp(query.trim(), 'i') },
                    { desc: new RegExp(query.trim(), 'i') },
                ],
            };
            if (category) {
                find = {
                    ...find,
                    category: category
                }
            }
            const products = await Products.find(find)
                .select('price name images hide')
                .skip((page - 1) * this.productPerPage)
                .limit(this.productPerPage);
            const total = await Products.find(find).countDocuments();

            return {
                products: products,
                total: total
            }
        }
        catch (err) {
            console.log(err);

            throw err;
        }
    }
    //customize
    static async getMedal(page: number = 1, sort: number, hidden: boolean = true) {

        try {
            let find: object = {};
            let order = -1;
            enum sortFilds {
                createdAt = -1, //date
                price = 1,         //price
            };

            if (!hidden) {
                find = {
                    hide: false
                }
            }

            if (sortFilds[sort] == 'price') {
                order = sortFilds.price;
            }



            const medals = await Medal.find(find)
                .sort([[sortFilds[sort], order]])
                .skip((page - 1) * this.productPerPage)
                .limit(this.productPerPage);

            const total = await Medal.find(find)
                .countDocuments();

            return {
                medals: medals,
                total: total
            }
        }
        catch (err) {
            throw err;
        }
    }

    static async getChain(page: number = 1, hidden: boolean = true) {

        try {
            let find: object = {};

            if (!hidden) {
                find = {
                    hide: false
                }
            }



            const chain = await Chain.find(find)
                .sort({ createdAt: -1 })
                .skip((page - 1) * this.productPerPage)
                .limit(this.productPerPage);

            const total = await Chain.find(find)
                .countDocuments();

            return {
                chain: chain,
                total: total
            }
        }
        catch (err) {
            throw err;
        }
    }

    static async getUsers(page: number = 1) {

        try {

            const users = await User.find({})
                .skip((page - 1) * this.productPerPage)
                .limit(this.productPerPage)
                .select('-local.password -cart');
            const total = await Chain.find({})
                .countDocuments();

            return {
                users: users,
                total: total
            }

        }

        catch (err) {
            throw err;
        }
    }

    static async getSingleUser(userId: Types.ObjectId) {

        try {

            const user = await User.findById(userId)
                .select('-local.password');


            return {
                user: user
            }

        }

        catch (err) {
            throw err;
        }
    }

    static async calculateCart(cart: any) {

        try {
            let total: number = 0;
            let cart: any = [];

            cart.forEach((i: any) => {
                if (i.product.OfferAvilable && i.product.offerPrice > 0) {
                    total += i.product.offerPrice * i.amount;
                    cart.push({
                        ...i,
                        price: i.product.offerPrice * i.amount
                    });

                } else {
                    total += i.product.price * i.amount;
                    cart.push({
                        ...i,
                        price: i.product.price * i.amount
                    });

                }
            });

            return { total, cart };
        }

        catch (err) {
            throw err;
        }

    }

    static async getOrders(page: number = 1, arrived: boolean = false, userId: any = null) {

        try {

            let orders: order & Document[] | any;
            let total: number = 0;

            if (userId) {
                orders = await Order.find({ user: userId, arrived: arrived })
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * this.productPerPage)
                    .limit(this.productPerPage)
                    .select('cartPrice delevary user arrived')
                    .populate({
                        path: 'user',
                        select: '-mobile -blocked -cart -wishList -stripeId -local.password'
                    });;

                total = await Order.find({ user: userId, arrived: arrived })
                    .countDocuments();
            } else {
                orders = await Order.find({ arrived: arrived })
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * this.productPerPage)
                    .limit(this.productPerPage)
                    .select('-transactionId')
                    .populate({
                        path: 'cart.product',
                        select: 'images name'
                    })
                    .populate({
                        path: 'user',
                        select: '-mobile -blocked -cart -wishList -local.password'
                    });;

                total = await Order.find({ arrived: arrived })
                    .countDocuments();
            }


            return { orders: orders, total: total }


        }

        catch (err) {
            throw err;
        }

    }

    static async singleOrder(orderId: Types.ObjectId) {

        try {

            const order = await Order.findById(orderId)
                .select('')
                .populate({
                    path: 'cart.product',
                    select: 'images name'
                })
                .populate({
                    path: 'user',
                    select: '-mobile -blocked -cart -wishList -local.password -stripeId'
                });

                return order ;


        } catch (err) {
            throw err;
        }

    }
}