const express=require('express')
const app=express()
const http= require('http')
const {Server}=require('socket.io')
const AuthService=require('../modules/auth/auth.service')
 
const jwt=require('jsonwebtoken')
const SiteServive=require('../modules/site/site.service')
const { setSocket } = require('../utils/socketMessageEmitter');




 


const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:"*",
        method:['GET','PUT','POST','PATCH','DELETE'],
        credentials:true
    }
})
 
io.on('connection',(socket)=>{
    try {
        console.log(`${socket.id} connected`)
        socket.on('authentication',async (accessToken)=>{
         const payLoad=await AuthService.getPayLoadFromToken(accessToken,process.env.JWT_SECRET)

        if(!payLoad || !payLoad.orgId){
            return
        }

        socket.join(`org:${payLoad.orgId}`)
               
})
    } catch (error) {
        console.error(error.message);
    }
})
setSocket(io);
module.exports={
    io:io,
    server:server,
    app:app
}

