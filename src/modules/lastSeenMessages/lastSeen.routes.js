const express=require('express')
const router=express.Router()
const LastSeenController=require('./lastSeen.controller')

router.get('/',LastSeenController.getUnseenMessageCountByUser.bind(LastSeenController)) // user gets all the unseen message info from all the site
router.post('/:messageId',LastSeenController.seenMessages.bind(LastSeenController))
router.get('/:siteId',LastSeenController.getUnseenMessageCountBySite.bind(LastSeenController)) // user getunseen message info from the site mentioned in the route

module.exports=router