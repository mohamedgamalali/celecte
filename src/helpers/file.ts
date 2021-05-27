import fs from 'fs';

// const deleteFile = filePath =>{
//   fs.unlink(filePath,err=>{console.log(err);
//   });
// }

// exports.deleteFile = deleteFile;

export default class File {

    readonly files:string[]
    
    constructor(a:string[]){
        this.files = a ;
    }

    async deleteFile() {
        this.files.forEach((i:string)=>{
                fs.unlink(__dirname +'/../../'+ i,err=>{console.log(err);
            });
        });
    }
}