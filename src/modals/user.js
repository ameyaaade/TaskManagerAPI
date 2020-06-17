const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        age:{
            type:Number,
            default:0,
            validate(value){
                if (value<0) {
                    throw new Error('Age must me a positive number !')
                }
            }
        },
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true,
            lowercase:true,
            validate(value){
              if (!validator.isEmail(value)) {
                  throw new Error('Email is not valid !')
              } 
            }
        },
        password:{
            type:String,
            required:true,
            minlength:6,
            trim:true,
            validate(value){
                if (value.toLowerCase().includes("password")) {
                    throw new Error(" Password should not contain word password ")
                }
            }
        },
        tokens:[{
            token:{
                type:String,
                required:true
            }
        }],
        avatar:{
            type:Buffer
        }
    
    },{
        timestamps:true
    }
)
userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'
})
// For hiding public data such as password,tokens
userSchema.methods.toJSON = function(){
    const user = this.toObject()
    delete user.tokens
    delete user.password
    delete user.avatar
    return user
}

// Used following syntax to utilize this
userSchema.methods.generateAuthToken=async function (){
    const user = this 
    const token = jwt.sign({ _id: user._id.toString() },process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}
userSchema.statics.findByCredentials=async(email,password)=>{
    const user =await User.findOne({email})
    if (!user) {
        throw new Error("Unable to login !")
    }
    const isMatch= await bcrypt.compare(password,user.password)
    if (!isMatch) {
        throw new Error("Unable to login !")
    }
    return user
}

// some methods like update skip middelware soo need to do some refactoring 
userSchema.pre('save',async function(next){
    const user = this 
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8)
    }
    next() //to make process stop is async
})  //arrow function don't bind this so need to use this syntax

userSchema.pre('remove',async function(next){
    const user = this 
    await Task.deleteMany({owner:user._id})
    next()
})
const User = mongoose.model("User",userSchema)
module.exports=User