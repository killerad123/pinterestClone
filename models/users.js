const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
mongoose.connect("mongodbLinkOrYourServerLink")

const userSchema = mongoose.Schema({
    username:String,
    desc:{
        default:"Add Description",
        type:String
    },
    profilename:String,
    password:String,
    contact:Number,
    email:String,
    profileImage:String,
    boards:{
        type:Array,
        default:[]
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }]
}) 
userSchema.plugin(plm)
module.exports=mongoose.model("user",userSchema)