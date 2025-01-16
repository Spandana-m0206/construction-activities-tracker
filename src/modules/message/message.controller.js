const BaseController = require('../base/BaseController');
const MessageService = require('./message.service');
const SiteService=require('../site/site.service');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const { Roles } = require('../../utils/enums');
const {emitMessage, emitDeleteMessage}=require('../../utils/socketMessageEmitter');
const PaginatedApiResponse = require('../../utils/paginatedApiResponse');
const fileService = require('../file/file.service');
const lastSeenController = require('../lastSeenMessages/lastSeen.controller');
const lastSeenService = require('../lastSeenMessages/lastSeen.service');
 

class MessageController extends BaseController {
    constructor() {
        super(MessageService); // Pass the MessageService to the BaseController
    }

    // Example custom controller method: Get messages by organization
    async getMessagesByOrg(req, res, next) {
        try {
            const messages = await this.service.findMessagesByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: messages });
        } catch (error) {
            next(error);
        }
    }
    async create(req,res){
        try {
            let message=req.body
        const site= await SiteService.findById(req.params.siteId)
        if(!site){
            return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"Site Not Found","Site Not Found"))
        }
        if(site.org.toString()!=req.user.org.toString()){
            return res.status(StatusCodes.UNAUTHORIZED).json(new ApiError(StatusCodes.UNAUTHORIZED,"You Are Not Authorised To Message In This Site","You Are Not Authorised To Message In This Site"))
        }
        if(!message.content && !req.file && !message.task && !message.approvalRequest && !message.paymentRequest && !message.taggedMessage && !message.order){
            return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,"Nothing In The Message To Save","Nothing In The Message To Save"))
            
        } 
        message.createdBy=req.user.userId
        message.org=req.user.org
        message.site=site._id

        if(req.file){
            const attachment = await fileService.create({
                filename: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size,
                org: req.user.org,
                uploadedBy: req.user.userId, // Assuming userId is in the request user object
                url: `${process.env.BASE_URL}/api/v1/files/link/${req.file.id}`, // Example URL format
            })
            message.attachment = attachment._id
        }
        const newMessage=await this.service.create(message)
        const {messages} = await this.service.getFormattedMessage(newMessage._id)
        emitMessage(messages[0], req.user.org.toString())
        res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED,messages[0],"Message Sent Successfully"))

            
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
            
        }
    }
    async delete(req,res){
        try {
            let {messageId}=req.params
            
            const message=await this.service.findById(messageId)
            if(!message){
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"Message Not Found","Message Not Found"))
            }
            if (
                message.createdBy.toString() !== req.user.userId.toString() && 
                (req.user.role !== Roles.ADMIN || message.org.toString() !== req.user.org.toString()) 
              ) {
                return res.status(StatusCodes.UNAUTHORIZED).json(
                  new ApiError(
                    StatusCodes.UNAUTHORIZED,
                    "Access Denied",
                    "You are not authorized to delete this message."
                  )
                );
              }
              
            
            message.isDeleted=true;
            await message.save()
            const {messages} = await MessageService.getFormattedMessage(message._id)
            emitDeleteMessage(messages[0], req.user.org)
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED,{},"Successfully Deleted"))
            
        } catch (error) {
             res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
        }

    }
    async getMessageBySiteId(req,res){
        try {
            const site=await SiteService.findById(req.params.siteId)
            if(!site){
                return res.status(StatusCodes.NOT_FOUND).json(new ApiError(StatusCodes.NOT_FOUND,"The Site Not Found","The Site Not Found"))
            }
            let {page,limit}=req.query
            if(!page){
                page="1"
            }
            if(!limit){
                limit="50"
            }
            const {messages,pagination}=await this.service.findMessagesBySite(site._id,parseInt(page),parseInt(limit))
            if(page==="1" && messages.length!=0){
                const lastMessageData={
                    message:messages[0]._id,
                    user:req.user.userId,
                    site:site._id
                }
            await lastSeenService.create(lastMessageData)
            }
            
            res.status(StatusCodes.OK).json(new PaginatedApiResponse(StatusCodes.OK,messages,"Messages", parseInt(page),parseInt(limit),pagination.totalMessages))
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,error.message ||"Something Went Wrong",error))
        }
    }
}


module.exports = new MessageController();
