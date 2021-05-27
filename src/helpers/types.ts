export type userPaymentData = {
    delevary:number,
    mobile:string,
    Location: {
        type: string,
        coordinates: [any,any]
    },
    adress: string,
    cartPrice:number,
    city:string,
    token:string,
    cart:[]
}