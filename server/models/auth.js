import mongoose from "mongoose";
 const userschema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    about:{type:String},
    tags:{type:[String]},
    joinedon:{type:Date,default:Date.now},
    videoUploadOTP: {
      type: String,
      default: null
  },
  videoUploadOTPExpiry: {
   type: Date,
   default: null
},
  isVideoVerified: {
      type: Boolean,
      default: false
  }
 })

 export default mongoose.model("User",userschema)