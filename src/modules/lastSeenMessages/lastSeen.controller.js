const { StatusCodes } = require('http-status-codes')
const BaseController=require('../base/BaseController')
const siteService = require('../site/site.service')
const LastSeenService=require('./lastSeen.service')
const ApiError = require('../../utils/apiError')
const ApiResponse = require('../../utils/apiResponse')
const messageService = require('../message/message.service')

class LastSeenController extends BaseController{
    constructor(){
        super(LastSeenService)
    }

    async seenMessages(req,res){
        try {
            const {messageId}=req.params
            const message =await messageService.findById(messageId)
            if(!message){
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"The Message Not Found","The Message Not Found"))
            }
            const seenMessageData={
                message:message._id,
                user:req.user.userId,
                site:message.site
            }
        const lastSeenMessage=await this.service.create(seenMessageData)
        return res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED,lastSeenMessage,"succesfully created"))
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))

        }
    }

    async getUnseenMessageCountBySite(req,res){
      try {
          const {siteId}=req.params
          const site =await siteService.findById(siteId)
          if(!site){
              return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"The Site Not Found","The Site Not Found"))
          }
          const unseenMessageCountAndLastMessage=await this.service.getUnseenMessageCountBySite(req.user.userId,siteId)
          return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,unseenMessageCountAndLastMessage,"The Message count with last message"))
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))

      }
    }
    async getUnseenMessageCountByUser(req,res){
    try {
            const unseenMessageCountAndLastMessage=await this.service.getUnseenMessageCountByUser(req.user.org,req.user.userId)
            return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,unseenMessageCountAndLastMessage,"The Message count with last message"))
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))

        
    }
        
    }
}
module.exports=new LastSeenController();