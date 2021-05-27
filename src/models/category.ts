import mongoose,{Schema,Document} from 'mongoose'
import { kStringMaxLength } from 'buffer';


const catSchema:Schema = new Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    hide:{
        type:Boolean,
        default:false
    }
});

type category = {
   name:string,
   hide:boolean,
   image:string
}

export default mongoose.model<category & Document>('category',catSchema);