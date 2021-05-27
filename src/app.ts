import express, { Application, Request, Response, NextFunction} from 'express';
import {config} from 'dotenv';
import {connect} from 'mongoose'
import meddlewere from './meddlewere';

config();

let app:Application = express();
const port:number|string = process.env.PORT || 8080;


app = meddlewere(app) ;



connect(<string> process.env.MONGODB_URI ,{
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
})
.then(result=>{

    const server = app.listen(port);
    console.log(`server running in port ${port}..`);
    
});
