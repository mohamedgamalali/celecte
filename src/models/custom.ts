import mongoose, { Schema, Document } from 'mongoose'


const chainSchema: Schema = new Schema({
    chain: {
        type: Schema.Types.ObjectId,
        refPath: 'chain'
    },
    medal: {
        type: Schema.Types.ObjectId,
        refPath: 'medal'
    },
    price:{ //price per item
        type: Number,
        required:true
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