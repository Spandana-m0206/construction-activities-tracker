const mongoose=require('mongoose')
const extendSchema = require('../base/BaseModel');

const reqFields={
    message:{type:mongoose.Schema.Types.ObjectId, ref:"Message",required:true},
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    site:{type:mongoose.Schema.Types.ObjectId, ref:"Site",required:true},
    
}
const lastSeenSchema=extendSchema(reqFields)
module.exports=mongoose.model("lastSeen",lastSeenSchema)