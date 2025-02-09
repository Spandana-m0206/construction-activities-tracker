const BaseService=require("../base/BaseService")
const lastSeen=require("./lastSeen.model")
const siteService = require("../site/site.service")
const messageModel=require('../message/message.model')
const InventoryService = require("../inventory/inventory.service")
const { Roles } = require("../../utils/enums")
const SiteModel = require("../site/site.model")

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
  const inventories = await InventoryService.find({ org: orgId });

  let chats = [];

  // Assign chat visibility based on role
  if (role === Roles.ADMIN) {
      chats = [...sites, ...inventories];
  } else if (role === Roles.INVENTORY_MANAGER) {
      chats = [...sites, ...inventories]; 
  } else {
      chats = [...sites]; 
  }

  // Fetch unseen message counts for each chat
  const messageBySite = await Promise.all(
      chats.map((chat) => this.getUnseenMessageCountBySite(userId, chat._id))
  );

  
  if (role === Roles.SITE_SUPERVISOR) {
      const sitesBySupervisor = await siteService.getSitesBySupervisor(userId);
      const siteIds = sitesBySupervisor.map((site) => site._id.toString());

      return messageBySite
          .filter((message) => Object.keys(message?.lastMessage || {}).length > 0)
          .filter((message) => siteIds.includes(message.site?._id?.toString()));
  }

  if (role === Roles.INVENTORY_MANAGER) {
      const inventoryByManager = await InventoryService.findInventoriesByManager({ manager: userId });
      const inventoryIds = inventoryByManager.map((inventory) => inventory._id.toString());

      return messageBySite
          .filter((message) => Object.keys(message?.lastMessage || {}).length > 0)
          .filter((message) => 
              message.inventory?._id?.toString() 
              ? inventoryIds.includes(message.inventory._id.toString()) 
              : true 
          );
  }

  
  return messageBySite.filter((message) => Object.keys(message?.lastMessage || {}).length > 0);
}
  
}
module.exports=new LastSeenService()
