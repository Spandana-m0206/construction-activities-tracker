// const {io}=require('../socket')
let io;

exports.setSocket = (socket) => {
  io = socket;
};

exports.emitMessage=(messageData, org)=>{
    io.to(`org:${org}`).emit("newMessages",messageData)
    
}
 
exports.emitDeleteMessage=(message, org)=>{
    io.to(`org:${org}`).emit("deleteMessage",message)
}

exports.emitReactionOnMessage=(message, org)=>{
    io.to(`org:${org}`).emit("reactOnMessage",message)
}

exports.emitActions = (message, org) => {
    io.to(`org:${org}`).emit("actions", message);a
}