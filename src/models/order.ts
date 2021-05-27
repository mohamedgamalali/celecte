import mongoose, { Schema, Document, Types } from 'mongoose'


const orderSchema: Schema = new Schema({
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
        },
        price:{
            type:Number,
            required:true
        }
    }],
    cartPrice:{
        type:Number,
        required:true
    },
    delevary:{
        type:Number,
        required:true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    Location: {
        type: { type: String },
        coordinates: [Number]
    },
    adress: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    arrived:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

orderSchema.index({ Location: "2dsphere" });

export type order = {
    cart: [{
        product: Types.ObjectId | any,
        amount: number,
        itemSize: string,
        path: string,
        price:number
    }],
    cartPrice:number,
    delevary:number,
    user: Types.ObjectId | any,
    mobile: string,
    city:string,
    Location: {
        type: string,
        coordinates: [number]
    },
    adress: string,
    transactionId: string
}

export default mongoose.model<order & Document>('order', orderSchema);