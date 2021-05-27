import mongoose, { Schema, Document, Types } from 'mongoose'
import httpError from '../helpers/httpError'


const userSchema: Schema = new Schema({
    method: {
        type: String,
        required: true,
        enum: ['facebook', 'google', 'local']
    },
    local: {
        email: {
            type: String,
            lowercase: true
        },
        password: {
            type: String
        },
        name: {
            type: String,

        },
    },
    google: {
        id: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        },
        name: {
            type: String
        },
        photo: {
            type: String,
        }
    },
    facebook: {
        id: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        },
        name: {
            type: String
        },
        photo: {
            type: String,
        }
    },
    mobile: {
        type: String
    },
    blocked: {
        type: Boolean,
        default: false
    },
    cart: [{
        product: {
            type: Schema.Types.Mixed,
            refPath: 'cart.path'
        },
        amount: {
            type: Number,
            required: true,
            min: [1, "amount can't be less than 1"]
        },
        itemSize: {
            type: String,
            required: true
        },
        path: {
            type: String,
            default: 'product'
        }
    }],
    wishList: [{
        product: {
            type: Schema.Types.Mixed,
            refPath: 'cart.path'
        },
        path: {
            type: String,
            default: 'product'
        }
    }],
    stripeId:String
});

export type user = {
    method: string,
    local: {
        email: string
        password: string,
        name: string,
    },
    google: {
        id: string,
        email: string,
        name: string,
        photo: string
    },
    facebook: {
        id: string,
        email: string,
        name: string,
        photo: string
    },
    mobile: string,
    blocked: boolean,
    cart: [{
        product: Types.ObjectId | any,
        amount: number,
        itemSize: string,
        path: string
    }]| [],
    wishList: [{
        product: Types.ObjectId | any,
        path: string
    }],
    stripeId:string

    //methods
    addToCart(prodductId: Types.ObjectId, amount: number, itemSize: string, ref: string, stock: number): user,
    removeFromCart(cartItemId: Types.ObjectId): user,
    addToWishList(prodductId: Types.ObjectId, ref: string,): user,
    removeWishList(prodductId: Types.ObjectId): user,
}

userSchema.methods.addToCart = function (prodductId: Types.ObjectId, amount: number, itemSize: string, ref: string, stock: number) {
    const CreatedBerore = this.cart.findIndex((val: any) => {
        return val.product.toString() === prodductId.toString() && itemSize === val.itemSize;
    });

    let newAmount = 1;
    const updatedCartItems = [...this.cart];

    if (CreatedBerore >= 0) {
        if (this.cart[CreatedBerore].amount + amount > stock && stock != -1) {
            const err = new httpError(409, 20, 'out of stock');
            throw err;
        }

        if (this.cart[CreatedBerore].amount + amount <= 0) {
            const err = new httpError(422, 7, 'validation faild for amount gonna be less than 0');
            throw err;
        }

        newAmount = this.cart[CreatedBerore].amount + amount;
        updatedCartItems[CreatedBerore].amount = newAmount;
    } else {
        if (amount > stock && stock != -1) {
            const err = new httpError(409, 20, 'out of stock');
            throw err;
        }
        if (amount <= 0) {
            const err = new httpError(422, 7, 'validation faild for amount gonna be less than 0');
            throw err;
        }
        updatedCartItems.push({
            product: prodductId,
            amount: amount,
            itemSize: itemSize,
            path: ref
        });
    }
    this.cart = updatedCartItems;
    return this.save();
}

userSchema.methods.removeFromCart = function (cartItemId: Types.ObjectId) {
    const updatedCartItems = this.cart.filter((item: any) => {
        return item._id.toString() !== cartItemId.toString();
    });
    this.cart = updatedCartItems;
    return this.save();
};

userSchema.methods.addToWishList = function (prodductId: Types.ObjectId, ref: string) {
    const here = this.wishList.findIndex((val: any) => {
        return prodductId.toString() === val.product._id.toString();
    })
    if (here > -1) {
        const err = new httpError(409, 21, 'allready added');
        throw err;
    }

    this.wishList.push({
        product:prodductId,
        path:ref
    });

    return this.save();

};

userSchema.methods.removeWishList = function (prodductId: Types.ObjectId) {
    const updatedWisList = this.wishList.filter((val: any) => {
        return prodductId.toString() !== val.product._id.toString();
    })
    

    this.wishList = updatedWisList ;

    return this.save();

};

export default mongoose.model<user & Document>('user', userSchema);