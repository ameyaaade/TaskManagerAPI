const express = require('express')
const User = require('../modals/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancelEmail} = require('../emails/account')
router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {
      const token = await user.generateAuthToken()
      await user.save();
      sendWelcomeEmail(user.email,user.name)
      res.status(201).send({user,token});
    } catch (e) {
      res.status(400).send(e);
    }
    //    user.save().then(()=>{
    //        res.status(201).send(user)        // for more the one async actions this will become complex so use above code with async/await
    //    }).catch(e=>{
    //        res.status(400).send(e)
    //    })
  });

router.post('/users/login',async(req,res)=>{
  try {
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    res.send({user,token})
  } catch (e) {
    console.log(e)
    res.status(400).send()
  }
})

router.post('/users/logout',auth,async (req,res)=>{
  try {
    req.user.tokens = req.user.tokens.filter((token)=>token.token !== req.token)
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

//auth middleware added
  router.get("/users/me", auth, async (req, res) => {
   res.send(req.user)
  });
  
  router.get("/users/:id",auth, async (req, res) => {
    const _id = req.params.id;
    try {
      const user = await User.findById(_id);
      if (!user) {
        res.status(404).send();
      }
      res.send(user);
    } catch (e) {
      res.status(500).send();
    }
  });

  router.patch("/users/me",auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates !" });
    }
    try {
      updates.forEach((update)=> req.user[update] = req.body[update])
      await req.user.save()
      // this is because advance method like findByIdAndUpdate skips the middelware and performs actions on database 
      // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      //   new: true,
      //   runValidators: true,
      // });
      // if (!user) {
      //   return res.status(404).send();
      // }
      res.send(req.user);
    } catch (e) {
      res.status(400).send();
    }
  });

  router.delete('/users/me',auth,async(req,res)=>{
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
      console.log(e)
        res.status(500).send()
    }
})

const upload = multer({
  // dest:'avatars',  //commented to avoid save operation in avatars directory
  limits:{
    fileSize:1000000 // 1 MegaByte
  },
  fileFilter(req, file, cb){
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File must be (jpg,jpeg,png) files only! '))
    }
    cb(undefined,true)
    // cb(new Error('File must be a PDF'))
    // cb(undefined,true) // Accept the upload
    // cb(undefined,false) // Reject the upload
  }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
  // req.user.avatar = req.file.buffer
  const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
 
})

router.get('/users/:id/avatar',async(req,res)=>{
try {
  const user = await User.findById(req.params.id)
  if (!user || !user.avatar) {
    throw new Error()
  }
  res.set('Content-Type','image/png')//resp header
  res.send(user.avatar)
} catch (e) {
  res.status(404).send()
}
})
module.exports = router
