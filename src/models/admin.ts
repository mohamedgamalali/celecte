import mongoose,{Schema,Document} from 'mongoose'


const adminSchema:Schema = new Schema({
    email:{
        required:true,
        type:String,
    },
    password:{
        required:true,
        type:String,
    },
});

type admin = {
    email:string,
    password:string
}

export default mongoose.model<admin & Document>('admin',adminSchema);