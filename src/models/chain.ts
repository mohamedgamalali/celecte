import mongoose, { Schema, Document } from 'mongoose'


const chainSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    item: [{
        size: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
    }],
    hide:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

export type chain = {
    name: string,
    image: string,
    item: [{
        size: string,
        price: number,
    }]
}

export default mongoose.model<chain & Document>('chain', chainSchema);