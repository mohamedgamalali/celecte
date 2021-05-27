import mongoose, {Schema,Document} from 'mongoose'


const productSchema:Schema = new Schema({
    name:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    size:[{
        type:String,
        required:true
    }],
    images:[{
        type:String,
        required:true
    }],
    stock:{
        type:Number,
        default:-1
    },
    hide:{
        type:Boolean,
        default:false
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'category',
        required:true
    },
    sold:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    newArrival:{
        type:Boolean,
        default:false
    },
    OfferAvilable:{
        type:Boolean,
        default:false
    },
    offerPrice:{
        type:Number,
        default:0
    }
},{timestamps:true});

type product = {
    name:string,
    desc:string,
    price:number,
    size:[string],
    images:[string],
    stock:number,
    hide:boolean,
    category:Schema.Types.ObjectId|any,
    newArrival:boolean,
    OfferAvilable:boolean,
    offerPrice:number | object
    views:number,
    sold:number,
    deleteImages(images:string[]):[string]
}

productSchema.methods.deleteImages = function(images:string[]){
    let imagesArr :string[] = this.images ;
    images.forEach((i:string)=>{
        const index = imagesArr.indexOf(i);
        if(index>-1){
            imagesArr.splice(index, 1) ;
            console.log('deleted');
            
        }
    });
    this.images = imagesArr ;
    return this.images ;
}

export default mongoose.model<product & Document>('product',productSchema);