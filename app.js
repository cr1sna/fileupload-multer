const express = require("express")
const multer = require("multer")
const bodyParser = require("body-parser")
const path = require("path")
const crypto = require("crypto")
const mongoose = require("mongoose")
const GridFsStorage = require("multer-gridfs-storage")
const Grid = require("gridfs-stream")
const methodOverride = require("method-override")

const port = 8888

const app = express()

//middleware 
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.set('view engine','ejs')

//Mongo Uri 
const mongo_uri =`mongodb+srv://m001-student:m001-mongodb-basics@sandbox.ty5w1.mongodb.net/file_upload?retryWrites=true&w=majority`

//create mongo connections
const conn = mongoose.createConnection(mongo_uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
let gfs;

conn.once('open', ()=> {
    //Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
    
  })

// Create Storage engine

const storage = new GridFsStorage({
    url: mongo_uri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
        };
        resolve(fileInfo);
    });
    });
}
});
const upload = multer({ storage });

//@route GET /
app.get('/',(req,res)=>{
    res.render('index')
    
})
// @route POST /upload
app.post('/upload',upload.single('file'),(req,res)=>{
    res.json({file:req.file})
    // res.redirect('/')
})

// @route GET Files 
// @desc  Display all files in json
// app.get('/files',(req,res)=>{
//     gfs.file.find().toArray((err,files)=>{
//         //check if there is error
//         if(!files || files.listen === 0){
//             return res.status(404).json({
//                 err:"files not found"
//             })
//         }
//         return res.json(files)
//     })
// })

app.listen(port,()=>{
    console.log(`Server running at ${port}`)
})