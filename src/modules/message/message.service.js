const BaseService = require('../base/BaseService');
const MessageModel = require('./message.model');

class MessageService extends BaseService {
    constructor() {
        super(MessageModel); // Pass the Message model to the BaseService
    }

    // Example custom service method: Get messages by organization
    async findMessagesByOrg(orgId) {
        return await this.model.model.find({ org: orgId })
            .populate('createdBy', 'name email')
            .populate('task', 'title status')
            .populate('site', 'name location')
            .populate('approvalRequest', 'status')
            .populate('order', 'status priority')
            .populate('paymentRequest', 'status priority')
            .populate('attachment', 'url name');
    }
    
    async findMessagesBySite(siteId,page=1,limit=20){
       
      
        const pipeline = [
            // Match messages for the specific site
            { $match: { site:siteId} },
        
            // Lookup for attachment details
            {
              $lookup: {
                from: "files",
                localField: "attachment",
                foreignField: "_id",
                as: "attachmentDetails",
              },
            },
            { $unwind: { path: "$attachmentDetails", preserveNullAndEmptyArrays: true } },
        
            // Lookup for createdBy details
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdByDetails",
              },
            },
            { $unwind: { path: "$createdByDetails", preserveNullAndEmptyArrays: true } },
        
            // Lookup for taggedMessage details
            {
              $lookup: {
                from: "messages",
                localField: "taggedMessage",
                foreignField: "_id",
                as: "taggedMessageDetails",
              },
            },
            { $unwind: { path: "$taggedMessageDetails", preserveNullAndEmptyArrays: true } },
        
            // Lookup for createdBy of taggedMessage
            {
              $lookup: {
                from: "users",
                localField: "taggedMessageDetails.createdBy",
                foreignField: "_id",
                as: "taggedMessageDetails.createdByDetails",
              },
            },
            { $unwind: { path: "$taggedMessageDetails.createdByDetails", preserveNullAndEmptyArrays: true } },
        
            // Add fields for taggedMessage createdBy
            {
              $addFields: {
                "taggedMessageDetails.createdBy": {
                  _id: "$taggedMessageDetails.createdByDetails._id",
                  name: "$taggedMessageDetails.createdByDetails.name",
                },
              },
            },
        
            // Lookup for reactions
            {
              $lookup: {
                from: "reactions",
                localField: "_id",
                foreignField: "message",
                as: "reactions",
              },
            },
        
            // Lookup for reactedBy user details in reactions with projection
            {
              $lookup: {
                from: "users",
                let: { reactedById: "$reactions.reactedBy" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$reactedById"] } } },
                  { $project: { _id: 1, name: 1, avatar: 1 } },
                ],
                as: "reactionUserDetails",
              },
            },
        
            // Add fields to map reaction details with user names
            {
              $addFields: {
                reactions: {
                  $map: {
                    input: "$reactions",
                    as: "reaction",
                    in: {
                      _id: "$$reaction._id",
                      reaction: "$$reaction.reaction",
                      reactedBy: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$reactionUserDetails",
                              as: "user",
                              cond: { $eq: ["$$user._id", "$$reaction.reactedBy"] },
                            },
                          },
                          0,
                        ],
                      },
                      createdAt: "$$reaction.createdAt",
                    },
                  },
                },
              },
            },
        
            // Pagination and projection
            {
              $facet: {
                metadata: [
                  { $count: "totalMessages" },
                  { $addFields: { page, limit } },
                ],
                messages: [
                  { $skip: (page - 1) * limit },
                  { $limit: limit },
                  {
                    $project: {
                      _id: 1,
                      content: 1,
                      attachment: {
                        filename: "$attachmentDetails.filename",
                        type: "$attachmentDetails.type",
                        size: "$attachmentDetails.size",
                        url: "$attachmentDetails.url",
                      },
                      createdBy: {
                        _id: "$createdByDetails._id",
                        name: "$createdByDetails.name",
                        avatar: "$createdByDetails.profilePhoto",
                      },
                      taggedMessage: {
                        _id: "$taggedMessageDetails._id",
                        content: "$taggedMessageDetails.content",
                        createdBy: "$taggedMessageDetails.createdBy",
                      },
                      reactions: "$reactions",
                      isDeleted: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                messages: 1,
                pagination: {
                  currentPage: page,
                //   totalPages: { $ceil: { $divide: ["$metadata.totalMessages", limit] } },
                  totalMessages: { $arrayElemAt: ["$metadata.totalMessages", 0] },
                },
              },
            },
          ];
          
            const result = await MessageModel.aggregate(pipeline);
            return result[0];
          };
}


module.exports = new MessageService();
