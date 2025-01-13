const {io}=require('../socket')


exports.emitMessage=(messageData)=>{
    io.to(`site:${messageData.site}`).emit("newMessages",messageData)
    
}
 