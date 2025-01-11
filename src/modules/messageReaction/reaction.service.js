const BaseService = require('../base/BaseService');
const ReactionModel = require('./reaction.model');

class ReactionService extends BaseService {
    constructor() {
        super(ReactionModel); // Pass the Message model to the BaseService
    }

    // Example custom service method: Get messages by organization
 async create(messageId,userId,emoji){
    const reaction=await this.model.findOne({reactedBy:userId,message:messageId})
    if(!reaction){
        const newReaction=await this.model.create({reaction:emoji,reactedBy:userId,message:messageId}) 
        return newReaction 
    }
    if(reaction.reaction==emoji){
        const undoReaction=await this.model.findByIdAndDelete(reaction._id)
        return undoReaction
     }
     const updateReaction=await this.model.findByIdAndUpdate(reaction._id,{reaction:emoji})
     return updateReaction
}
}

module.exports = new ReactionService();