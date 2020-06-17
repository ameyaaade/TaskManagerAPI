const express = require("express");
require("./db/mongoose"); //mongooes db connect
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')

const User = require("./modals/user");
const Task = require("./modals/task");

const app = express();
const port = process.env.PORT;

// middelware for maintenance 
// app.use((req,res,next)=>{
//   res.status(503).send("Site is currently down, Check back soon.")
// })

// const upload = multer({
//   dest : 'images', //name of folder
//   limits:{
//     fileSize:1000000 // 1 MegaByte
//   },
//   fileFilter(req, file, cb){
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error('File must be (doc|docx) files only! '))
//     }
//     cb(undefined,true)
//   }
// })
// const myMiddelware = (req,res,next) =>{
//   throw new Error("error from my middleware") 
// }
// app.post('/upload',upload.single('upload'),(req,res)=>{  // need to add multer middleware
//   res.send()
// },(error,req,res,next)=>{   // Need to have this signiture to let know express that this is to handle uncaught errors like middleware
//   res.status(400).send({error:error.message})
// })

app.use(express.json());
app.use(userRouter) // need to register router 
app.use(taskRouter) 

app.listen(port, () => {
  console.log(`server is up on ${port} ...`);
});

// const main = async()=>{
//   // const task = await Task.findById('5ee44b9dec704566264288c8')
//   // await task.populate('owner').execPopulate()
//   // console.log(task.owner)

//   const user = await User.findById('5ee44b7bec704566264288c5')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }
// main()