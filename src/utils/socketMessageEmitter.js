const {io}=require("../socket")


exports.emitMessage=(messageData, org)=>{
    io.to(`org:${org}`).emit("newMessages",messageData)
    
}
 
exports.emitDeleteMessage=(message, org)=>{
    io.to(`org:${org}`).emit("deleteMessage",message)
}

exports.emitReactionOnMessage=(message, org)=>{
    io.to(`org:${org}`).emit("reactOnMessage",message)
}