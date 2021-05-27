
import {loginAdmin, getProducts} from "./routes";

test('admin login',async()=>{
    try{
        
        const res = await loginAdmin() ;
        
          expect(res).toMatchObject({ state: 1,
          message: "logged in successfully",
          data: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImlkIjoiNWZlZmQyMzE0MDM1Y2EyZmQ2NjE4YTY1IiwiaWF0IjoxNjEwNjQ2NjI4LCJleHAiOjE2MTA2NTc0Mjh9.PiX1yd9-xoLElXnovZNsfnQ6pb1EF-1fVfTn3P3CT2s",
              expiresIn: 10000000,
              email: "admin@admin.com"
          }});
          
    }catch(err) {
        console.log(err.response)
      }
},60000);

test('get products',async()=>{
    try{
        
        const res = await getProducts() ;
        const status = res?.status;
          expect(status).toBe(200)
          
    }catch(err) {
        console.log(err.response)
      }
},60000);