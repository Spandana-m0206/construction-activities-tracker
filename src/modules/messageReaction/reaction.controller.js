const BaseController = require('../base/BaseController');
const ReactionService=require('./reaction.service')
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
 

class ReactionController extends BaseController {
    constructor() {
        super(ReactionService); // Pass the MessageService to the BaseController
    }

    // Example custom controller method: Get messages by organization
  
    async create(req,res){
        try {
            let {reaction}=req.body
            if(!reaction){
               return res.status(StatusCodes.BAD_REQUEST).json(new ApiError(StatusCodes.BAD_REQUEST,"Emoji Not Found","Emoji Not Found")) 
            }
            const createReaction=await this.service.create(req.params.messageId,req.user.userId,reaction)
            res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED,{},"Emoji Added"))
        } 
        catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong",error))
            
        }
    }
     
            
       

    
}


module.exports = new ReactionController();