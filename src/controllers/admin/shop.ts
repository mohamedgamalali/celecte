import { Request, Response, NextFunction } from 'express';
import response from '../../helpers/Response'
import { validationResult } from 'express-validator'
import Product from '../../models/product';
import Category from '../../models/category';
import Chain from '../../models/chain';
import Medal from '../../models/medal';
import File from '../../helpers/file';
import { Types } from 'mongoose'
import getData from '../../services/getData';
import { json } from 'body-parser';

export async function putProduct(req: Request, res: Response, next: NextFunction) {

    try {

        const name: string = req.body.name;
        const desc: string = req.body.desc;
        const price: number = req.body.price;
        let size: any = req.body.size;
        const images: any = req.files;
        const stock: number = req.body.stock;
        const category: Types.ObjectId = req.body.category;
        let imagePaths: string[] = [];

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const categoryIsHere = await Category.findById(category);
        if (!categoryIsHere) {
            return response.NotFound(res, 'category not found', categoryIsHere)
        }

        if (images.length == 0) {
            return response.ValidationFaild(res, 'validation faild.. you must insert image', errors.array())
        }

        if (size) {
            size = JSON.parse(size);
        }

        images.forEach((i: any) => {
            imagePaths.push(i.path);
        });

        const newProduct = new Product({
            name: name,
            desc: desc,
            price: price,
            size: size,
            images: imagePaths,
            stock: stock,
            category: category
        });

        const product = await newProduct.save();

        return response.created(res, 'created', product);

    } catch (err) {
        next(err);
    }
}

export async function editProduct(req: Request, res: Response, next: NextFunction) {


    try {

        const name: string = req.body.name;
        const desc: string = req.body.desc;
        const price: number = req.body.price;
        let size: any = req.body.size;
        const images: any = req.files || [];
        const stock: number = req.body.stock;
        const productId: Types.ObjectId = req.body.productId;
        let deletedImages: any = req.body.deletedImages || [];


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const product = await Product.findById(productId);

        if (!product) {
            return response.NotFound(res, 'product not found', product)
        }


        if (images.length > 0) {
            //push images
            images.forEach((i: any) => {
                product.images.push(i.path);
            });
        }

        if (size) {
            size = JSON.parse(size);
        }
        if (deletedImages) {
            deletedImages = JSON.parse(deletedImages);
        }

        //assine the variables
        product.name = name;
        product.desc = desc;
        product.price = price;
        product.size = size;
        product.stock = stock;

        if (deletedImages.length > 0) {
            product.images = await product.deleteImages(deletedImages);
            const file = new File(deletedImages);
            await file.deleteFile();
        }

        //save product
        const updated = await product.save();
        //return ok
        return response.ok(res, 'updated', updated);

    } catch (err) {

        next(err);
    }
}



export async function postHide(req: Request, res: Response, next: NextFunction) {


    try {

        const productId: Types.ObjectId = req.body.productId;


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const product = await Product.findById(productId).select('hide');
        if (!product) {
            return response.NotFound(res, 'product not found', product)
        }

        product.hide = !product.hide;

        const newProduct = await product.save();


        return response.ok(res, 'hidden', newProduct);


    } catch (err) {

        next(err);
    }
}

//category
export async function putCategory(req: Request, res: Response, next: NextFunction) {


    try {

        const images: any = req.files;
        const name: string = req.body.name;


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        if (images.length == 0) {
            return response.ValidationFaild(res, 'validation faild.. you must insert image', errors.array())
        }

        const newCat = new Category({
            name: name,
            image: images[0].path
        });

        const category = await newCat.save();

        return response.ok(res, 'added', category);


    } catch (err) {

        next(err);
    }
}

export async function editCategory(req: Request, res: Response, next: NextFunction) {


    try {

        const name: string = req.body.name;
        const image: any = req.files || [];
        const categoryId: Types.ObjectId = req.body.categoryId;


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return response.NotFound(res, 'category not found', category)
        }

        if (image.length > 0) {
            category.image = image[0].path;
        }
        category.name = name;

        const newCat = await category.save();

        return response.ok(res, 'updated', newCat);


    } catch (err) {

        next(err);
    }
}


export async function hideCategory(req: Request, res: Response, next: NextFunction) {


    try {

        const categoryId: Types.ObjectId = req.body.categoryId;


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return response.NotFound(res, 'category not found', category)
        }

        category.hide = !category.hide;

        const newCat = await category.save();

        return response.ok(res, 'updated', newCat);


    } catch (err) {

        next(err);
    }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {


    try {

        const category = await Category.find({});

        return response.ok(res, 'all categories without pagination', category);


    } catch (err) {

        next(err);
    }
}

export async function getProducts(req: Request, res: Response, next: NextFunction) {


    try {

        const catigory: any = req.query.catigory || false;
        const page: any = req.query.page || 1;
        const sort: any = req.query.sort || 1;
        const order: any = req.query.order || -1  // or 1;

        const getDataResult = await getData.getProducts(page, sort, catigory, order);


        return response.ok(res, `products in page ${page}, with sort ${sort}, and order ${order}`, getDataResult);




    } catch (err) {

        next(err);
    }
}

export async function postNewArrial(req: Request, res: Response, next: NextFunction) {


    try {

        const productId: Types.ObjectId = req.body.productId;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const products = await Product.findById(productId).select('newArrival');

        if (!products) {
            return response.NotFound(res, 'products not found', products)
        }

        // await Product.updateMany({ newArrival: true }, { newArrival: false });

        products.newArrival = true;

        const updatedProduct = await products.save();


        return response.ok(res, `made as new arrival`, updatedProduct);


    } catch (err) {

        next(err);
    }
}

export async function postOffer(req: Request, res: Response, next: NextFunction) {


    try {

        const productId: Types.ObjectId = req.body.productId;
        const price: number = req.body.price;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const products = await Product.findById(productId).select('price OfferAvilable offerPrice');

        if (!products) {
            return response.NotFound(res, 'products not found', products)
        }

        if (products.OfferAvilable == true) {
            return response.Conflict(res, 'offer allready created');
        }

        if (products.price < price) {
            return response.Conflict(res, 'offer price can not be more than the original price');
        }

        products.OfferAvilable = true;
        products.offerPrice = price;

        const newProduct = await products.save();

        return response.ok(res, 'offer created', newProduct);


    } catch (err) {

        next(err);
    }
}


export async function postCancelOffer(req: Request, res: Response, next: NextFunction) {


    try {

        const productId: Types.ObjectId = req.body.productId;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        const product = await Product.findById(productId).select('price OfferAvilable offerPrice');

        if (!product) {
            return response.NotFound(res, 'products not found', product)
        }

        if (product.OfferAvilable == false) {
            return response.Conflict(res, 'offer allready canceld');
        }

        product.OfferAvilable = false;

        const newProduct = await product.save();

        return response.ok(res, 'offer canceld', newProduct);


    } catch (err) {

        next(err);
    }
}

export async function singleProduct(req: Request, res: Response, next: NextFunction) {


    try {

        const id: Types.ObjectId | string = req.params.id;

        const product = await getData.singleProduct(id, true);

        if (!product) {
            return response.NotFound(res, 'product not found with this id', product)
        }


        return response.ok(res, 'product', product);



    } catch (err) {

        next(err);
    }
}

export async function search(req: Request, res: Response, next: NextFunction) {


    try {

        const query: any = req.query.searchQ;
        const page: any = req.query.page || 1;
        const category: any = req.query.category || false;

        const searchResult = await getData.search(query, category, page);

        return response.ok(res, 'search', searchResult);



    } catch (err) {
        console.log(err);

        next(err);
    }
}


//customize

export async function addChain(req: Request, res: Response, next: NextFunction) {


    try {

        const name: string = req.body.name;
        const images: any = req.files;
        let item: object[] | any = req.body.item;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        if (images.length === 0) {
            return response.ValidationFaild(res, 'validation faild.. you should send image', errors.array())
        }
        if (item) {
            item = JSON.parse(item);
            if (item.length === 0) {
                return response.ValidationFaild(res, 'validation faild.. you should send at least one item', errors.array())
            }
        } else {
            return response.ValidationFaild(res, 'validation faild.. you should send at least one item', errors.array())
        }


        const newChain = new Chain({
            name: name,
            image: images[0].path,
            item: item
        });

        const chain = await newChain.save();

        return response.created(res, 'created', chain);


    } catch (err) {

        next(err);
    }
}

export async function addMedal(req: Request, res: Response, next: NextFunction) {


    try {

        const name: string = req.body.name;
        const images: any = req.files;
        const price: number = req.body.price;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.ValidationFaild(res, 'validation faild', errors.array())
        }

        if (images.length === 0) {
            return response.ValidationFaild(res, 'validation faild.. you should send image', errors.array())
        }

        const newMedal = new Medal({
            name: name,
            image: images[0].path,
            price: price
        });

        const medal = await newMedal.save();

        return response.created(res, 'created', medal);

    } catch (err) {

        next(err);
    }
}

//get medal

export async function getMedal(req: Request, res: Response, next: NextFunction) {


    try {

        const page:any = req.query.page || 1;
        const sort:any = req.query.sort || 1;
       
        const data = await getData.getMedal(page, sort/*,hidden = true cuz of admin privlage */) ;

        return response.ok(res, 'medals', data) ;


    } catch (err) {

        next(err);
    }
}

export async function getChain(req: Request, res: Response, next: NextFunction) {


    try {

        const page:any = req.query.page || 1;

       
        const data = await getData.getChain(page) ;

        return response.ok(res, 'chains', data) ;


    } catch (err) {

        next(err);
    }
}

export async function getOrders(req: Request, res: Response, next: NextFunction) {

    try {

        const page = req.query.page || 1 ;
        const arrived = Boolean(Number(req.query.arrived))  ;
        

        const {orders, total} = await getData.getOrders(<number> page,<boolean> arrived);

        return response.ok(res, `orders`, {
            orders:orders,
            total:total
        })


    } catch (err) {

        next(err);
    }
}

export async function singleOrder(req: Request, res: Response, next: NextFunction) {

    try {

        const id:any = req.params.id ;
        const order = await getData.singleOrder(id);

        if(!order){
            return response.NotFound(res, 'order not found', order)
        }   

        return response.ok(res, 'order found', order) ;


    } catch (err) {

        next(err);
    }
}