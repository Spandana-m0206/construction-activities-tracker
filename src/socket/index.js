const express=require('express')
const app=express()
const http= require('http')
const {Server}=require('socket.io')
const AuthService=require('../modules/auth/auth.service')
const jwt=require('jsonwebtoken')
const SiteServive=require('../modules/site/site.service')
 

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

    const userOrgSites=await SiteServive.find({org:payLoad.orgId})
    userOrgSites.forEach((site)=>{
        socket.join(`site:${site._id}`)
        console.log(`${payLoad.name} joined ${site._id}`)
})
               
})
    } catch (error) {
        console.error(error.message);
    }
})
module.exports={
    io:io,
    server:server,
    app:app
}

