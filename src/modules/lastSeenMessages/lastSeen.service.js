const BaseService=require("../base/BaseService")
const lastSeen=require("./lastSeen.model")
const siteService = require("../site/site.service")
const messageModel=require('../message/message.model')
const InventoryService = require("../inventory/inventory.service")
const { Roles } = require("../../utils/enums")

class LastSeenService extends BaseService{
    constructor(){
        super(lastSeen)
    }
 async getUnseenMessageCountBySite(userId,chat){
    const lastSeenMessage=await this.model.find({user:userId, $or:[{site:chat},{ inventory:chat}]}).sort({createdAt:-1}).limit(1).populate('user','name').populate('site','name').populate('inventory', 'name').populate('message').populate({
      path: 'message',
      populate: { path: 'createdBy', select:'name' } 
    });
    if(lastSeenMessage.length==0){
    const newMessages=await messageModel.find({ $or:[{site:chat},{ inventory:chat}]}).sort({createdAt:-1}).populate('createdBy','name').populate('site','name').populate('inventory', 'name')
    const newMessageCount=newMessages.length
        return {
            unseenMessageCount:newMessageCount,
            lastMessage:newMessages[0]?newMessages[0]:{}
        }
    }
    const unseenMessages=await messageModel.find({createdAt:{$gt:lastSeenMessage[0].createdAt}, $or:[{site:chat},{ inventory:chat}]}).sort({createdAt:-1}).populate('createdBy','name').populate('site', 'name').populate('inventory','name')
    const unseenMessagesCount=unseenMessages.length
    
    return {
        unseenMessageCount:unseenMessagesCount,
        lastMessage:unseenMessages[0]?unseenMessages[0]:lastSeenMessage[0]
    }
 }

 async getUnseenMessageCountByUser(orgId, userId, role) {
    const sites = await siteService.find({ org: orgId });
    const inventories = await InventoryService.find({ org: orgId})
    let chats = [];
    if(role==Roles.ADMIN){
      chats = [...sites, ...inventories];
    }else if(role == Roles.INVENTORY_MANAGER){
      chats = [...inventories];
    }else{
      chats = [...sites]
    }
    // Map and return the result of the asynchronous operation
    const messageBySite = await Promise.all(
      chats.map((chat) => {
        return this.getUnseenMessageCountBySite(userId, chat._id);
      })
    );
  
    return messageBySite.filter(message=>Object.keys(message?.lastMessage).length > 0);
  }
  
}
module.exports=new LastSeenService()
