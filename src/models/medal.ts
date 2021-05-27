import mongoose, { Schema, Document } from 'mongoose'


const medalSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price:{ //price per item
        type: Number,
        required: true
    },
    hide:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

export type medal = {
    name: string,
    image: string,
    price:number
}

export default mongoose.model<medal & Document>('medal', medalSchema);