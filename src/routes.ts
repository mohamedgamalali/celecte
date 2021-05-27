import axios from 'axios' ;

export async function loginAdmin(){
    try{
        const res = await axios({
            method: 'post',
            url: `https://celeste-api.herokuapp.com/admin/login`,
            data:{
                email:"admin@admin.com",
                password:"admin"
            }
          })
          
          return res ;
          
    }catch(err) {
        console.log(err.response)
      }
}

export async function getProducts(){
    try{

        const login = await loginAdmin();
        console.log(login?.data.token);
        
        const res = await axios({
            method: 'get',
            url: `https://celeste-api.herokuapp.com/admin/shop/products`,
            headers: {
                'Authorization': `Basic ${login?.data.data.token}`
              }
          })
          
          return res ;
          
    }catch(err) {
        console.log(err.response)
      }
}
