const BaseService=require("../base/BaseService")
const lastSeen=require("./lastSeen.model")
const siteService = require("../site/site.service")
const messageModel=require('../message/message.model')

class LastSeenService extends BaseService{
    constructor(){
        super(lastSeen)
    }
 async getUnseenMessageCountBySite(userId,siteId){
    const lastSeenMessage=await this.model.find({user:userId,site:siteId}).sort({createdAt:-1}).limit(1).populate('user','name')
    if(lastSeenMessage.length==0){
    const newMessages=await messageModel.find({user:userId,site:siteId}).sort({createdAt:-1})
    const newMessageCount=newMessages.length
        return {
            unseenMessageCount:newMessageCount,
            lastMessage:newMessages[0]?newMessages[0]:{}
        }
    }
    const unseenMessages=await messageModel.find({createdAt:{$gt:lastSeenMessage[0].createdAt},site:siteId}).sort({createdAt:-1}).populate('createdBy','name')
    const unseenMessagesCount=unseenMessages.length
    
    return {
        unseenMessageCount:unseenMessagesCount,
        lastMessage:unseenMessages[0]?unseenMessages[0]:lastSeenMessage[0]
    }
 }

 async getUnseenMessageCountByUser(orgId, userId) {
    const sites = await siteService.find({ org: orgId });
  
    // Map and return the result of the asynchronous operation
    const messageBySite = await Promise.all(
      sites.map((site) => {
        return this.getUnseenMessageCountBySite(userId, site._id);
      })
    );
  
    return messageBySite;
  }
  
}
module.exports=new LastSeenService()
