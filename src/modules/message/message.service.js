const BaseService = require('../base/BaseService');
const MessageModel = require('./message.model');
const {MessageTypes, TaskStatuses}=require('../../utils/enums')

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
   

    
    async findMessagesBySite(siteId,page=1,limit=50){

        const pipeline = [
          // Match messages for the specific site
          { $match: { site: siteId } },
        
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
                avatar: "$taggedMessageDetails.createdByDetails.avatar",
              },
            },
          },
        
          // Lookup for task details
          {
            $lookup: {
              from: "tasks",
              localField: "task",
              foreignField: "_id",
              as: "taskDetails",
            },
          },
          { $unwind: { path: "$taskDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for approvalRequest details
          {
            $lookup: {
              from: "approvals",
              localField: "approvalRequest",
              foreignField: "_id",
              as: "approvalRequestDetails",
            },
          },
          { $unwind: { path: "$approvalRequestDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for image details in approvalRequest
          {
            $lookup: {
              from: "files",
              localField: "approvalRequestDetails.images",
              foreignField: "_id",
              as: "approvalRequestImages",
            },
          },
        
          // Lookup for raisedBy details in approvalRequest
          {
            $lookup: {
              from: "users",
              localField: "approvalRequestDetails.raisedBy",
              foreignField: "_id",
              as: "approvalRequestRaisedByDetails",
            },
          },
          { $unwind: { path: "$approvalRequestRaisedByDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for paymentRequest details
          {
            $lookup: {
              from: "payments",
              localField: "paymentRequest",
              foreignField: "_id",
              as: "paymentRequestDetails",
            },
          },
          { $unwind: { path: "$paymentRequestDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for raisedBy details in paymentRequest
          {
            $lookup: {
              from: "users",
              localField: "paymentRequestDetails.raisedBy",
              foreignField: "_id",
              as: "paymentRequestRaisedByDetails",
            },
          },
          { $unwind: { path: "$paymentRequestRaisedByDetails", preserveNullAndEmptyArrays: true } },
        // Lookup for orders
          {
            $lookup: {
              from: "orders",
              localField: "order",
              foreignField: "_id",
              as: "ordersDetails",
            },
          },
          { $unwind: { path: "$ordersDetails", preserveNullAndEmptyArrays: true } },
        
          // // Lookup for order details in order
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "paymentRequestDetails.raisedBy",
          //     foreignField: "_id",
          //     as: "paymentRequestRaisedByDetails",
          //   },
          // },
          // { $unwind: { path: "$paymentRequestRaisedByDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for reactions
          {
            $lookup: {
              from: "reactions",
              localField: "_id",
              foreignField: "message",
              as: "reactions",
            },
          },
        
          // Lookup for reactedBy details in reactions
          {
            $lookup: {
              from: "users",
              localField: "reactions.reactedBy",
              foreignField: "_id",
              as: "reactionUserDetails",
            },
          },
        
          // Add fields to map data
          {
            $project: {
              _id: 1,
              content: 1,
              site: 1,
              type: 1,
              isDeleted: 1,
              createdAt: 1,
              attachment: {
                filename: "$attachmentDetails.filename",
                type: "$attachmentDetails.type",
                size: "$attachmentDetails.size",
                org: "$attachmentDetails.org",
                uploadedBy: "$attachmentDetails.uploadedBy",
                url: "$attachmentDetails.url",
              },
              createdBy: {
                _id: "$createdByDetails._id",
                name: "$createdByDetails.name",
                avatar: "$createdByDetails.profilePhoto",
              },
              task: {
                _id: "$taskDetails._id",
                title: "$taskDetails.title",
                status: "$taskDetails.status",
                progressPercentage: "$taskDetails.progressPercentage",
                attachment: "$taskDetails.attachments",
              },
              approvalRequest: {
                _id: "$approvalRequestDetails._id",
                status: "$approvalRequestDetails.status",
                images: { $map: { input: "$approvalRequestImages", as: "img", in: "$$img.url" } },
                raisedBy: {
                  _id: "$approvalRequestRaisedByDetails._id",
                  name: "$approvalRequestRaisedByDetails.name",
                },
              },
              paymentRequest: {
                _id: "$paymentRequestDetails._id",
                amount: "$paymentRequestDetails.amount",
                raisedBy: {
                  _id: "$paymentRequestRaisedByDetails._id",
                  name: "$paymentRequestRaisedByDetails.name",
                },
                attachments: "$paymentRequestDetails.attachments",
              },
              taggedMessage: {
                _id: "$taggedMessageDetails._id",
                content: "$taggedMessageDetails.content",
                createdBy: "$taggedMessageDetails.createdBy",
                isDeleted: "$taggedMessageDetails.isDeleted",
                attachment: "$taggedMessageDetails.attachment",
              },
              order: {
                _id: "$ordersDetails._id",
                // orderItems: "$ordersDetails.orderItems",
                status: "$ordersDetails.status",
                // paymentStatus: "$ordersDetails.paymentStatus",
                // totalAmount: "$ordersDetails.totalAmount",
                // paymentDate: "$ordersDetails.paymentDate",
                // shippingAddress: "$ordersDetails.shippingAddress",
                // billingAddress: "$ordersDetails.billingAddress",
                // orderDate: "$ordersDetails.orderDate",
                // orderItems: "$ordersDetails.orderItems",
                // customer: {
                //   _id: "$ordersDetails.customer._id",
                //   name: "$ordersDetails.customer.name",
                //   email: "$ordersDetails.customer.email",
                //   phone: "$ordersDetails.customer.phone",
                //   shippingAddress: "$ordersDetails.customer.shippingAddress",
                //   billingAddress: "$ordersDetails.customer.billingAddress",
                //   isDeleted: "$ordersDetails.customer.isDeleted",
                // },
              },
              reactions: {
                $map: {
                  input: "$reactions",
                  as: "reaction",
                  in: {
                    _id: "$$reaction._id",
                    reaction: "$$reaction.reaction",
                    reactedBy: {
                      _id: { $arrayElemAt: ["$reactionUserDetails._id", 0] },
                      name: { $arrayElemAt: ["$reactionUserDetails.name", 0] },
                    },
                  },
                },
              },
            },
          },
        
          // Pagination and metadata
          {
            $facet: {
              metadata: [{ $count: "totalMessages" }, { $addFields: { page, limit } }],
              messages: [
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
          {
            $project: {
              messages: 1,
              pagination: {
                currentPage: page,
                totalMessages: { $arrayElemAt: ["$metadata.totalMessages", 0] },
              },
            },
          },
        ];
        
            const result = await MessageModel.aggregate(pipeline);
            return result[0];
          };
          async taskStatusMessage(taskData){

            const messageStatus=await this.model.create({
              content:taskData.content,
              createdBy:taskData.createdBy,
              site:taskData.site,
              org:taskData.org,
              type:MessageTypes.STATUS,
              task:taskData._id
            })
            return messageStatus;
           }
           async materialOrderStatusMessage(orderData){
            const messageStatus=await this.model.create({
              content:orderData.content,
              createdBy:orderData.createdBy,
              site:orderData.site,
              org:orderData.org,
              type:MessageTypes.STATUS,
              order:orderData._id
            })
            return messageStatus
           }
        
        // async paymentRequestSuccessMessage(paymentRequestData){
        //   const successMessage=await this.model.create({
        //     content:paymentRequestData.content,
        //     createdBy:paymentRequestData.userId,
        //     site:paymentRequestData.siteId,
        //     org:paymentRequestData.orgId,
        //     type:MessageTypes.paymentRequest,
        //     paymentRequest:paymentRequestData._id
        //   })
        //   return successMessage
        // }
        
        // async materialRequest\SuccessMessage(materialRequestData){ 
        //   const successMessage=await this.model.create({
        //     content:materialRequestData.content,
        //     createdBy:materialRequestData.createdBy,
        //     site:materialRequestData.site,
        //     org:materialRequestData.org,
        //     type:MessageTypes.materialRequest,
        //     order:materialRequestData._id
        //   })
        //   return successMessage
        // }
        async approvalRequestSuccessMessage(approvalData){
          const successMessage=await this.model.create({
            content:approvalData.content,
            createdBy:approvalData.raisedBy,
            site:approvalData.site,
            org:approvalData.org,
            type:MessageTypes.APPROVAL,
            approvalRequest:approvalData._id
        
          })
          return successMessage
        }
    async getFormattedMessage(messageId){
       
      

        const pipeline = [
          // Match messages for the specific site
          { $match: { _id: messageId } },
        
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
                avatar: "$taggedMessageDetails.createdByDetails.avatar",
              },
            },
          },
        
          // Lookup for task details
          {
            $lookup: {
              from: "tasks",
              localField: "task",
              foreignField: "_id",
              as: "taskDetails",
            },
          },
          { $unwind: { path: "$taskDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for approvalRequest details
          {
            $lookup: {
              from: "approvals",
              localField: "approvalRequest",
              foreignField: "_id",
              as: "approvalRequestDetails",
            },
          },
          { $unwind: { path: "$approvalRequestDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for image details in approvalRequest
          {
            $lookup: {
              from: "files",
              localField: "approvalRequestDetails.images",
              foreignField: "_id",
              as: "approvalRequestImages",
            },
          },
        
          // Lookup for raisedBy details in approvalRequest
          {
            $lookup: {
              from: "users",
              localField: "approvalRequestDetails.raisedBy",
              foreignField: "_id",
              as: "approvalRequestRaisedByDetails",
            },
          },
          { $unwind: { path: "$approvalRequestRaisedByDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for paymentRequest details
          {
            $lookup: {
              from: "payments",
              localField: "paymentRequest",
              foreignField: "_id",
              as: "paymentRequestDetails",
            },
          },
          { $unwind: { path: "$paymentRequestDetails", preserveNullAndEmptyArrays: true } },
        
          // Lookup for raisedBy details in paymentRequest
          {
            $lookup: {
              from: "users",
              localField: "paymentRequestDetails.raisedBy",
              foreignField: "_id",
              as: "paymentRequestRaisedByDetails",
            },
          },
          { $unwind: { path: "$paymentRequestRaisedByDetails", preserveNullAndEmptyArrays: true } },
        
                  // Lookup for orders
                  {
                    $lookup: {
                      from: "orders",
                      localField: "order",
                      foreignField: "_id",
                      as: "ordersDetails",
                    },
                  },
                  { $unwind: { path: "$ordersDetails", preserveNullAndEmptyArrays: true } },
                
                  // // Lookup for order details in order
                  // {
                  //   $lookup: {
                  //     from: "users",
                  //     localField: "paymentRequestDetails.raisedBy",
                  //     foreignField: "_id",
                  //     as: "paymentRequestRaisedByDetails",
                  //   },
                  // },
                  // { $unwind: { path: "$paymentRequestRaisedByDetails", preserveNullAndEmptyArrays: true } },

          // Lookup for reactions
          {
            $lookup: {
              from: "reactions",
              localField: "_id",
              foreignField: "message",
              as: "reactions",
            },
          },
        
          // Lookup for reactedBy details in reactions
          {
            $lookup: {
              from: "users",
              localField: "reactions.reactedBy",
              foreignField: "_id",
              as: "reactionUserDetails",
            },
          },
        
          // Add fields to map data
          {
            $project: {
              _id: 1,
              content: 1,
              site: 1,
              type: 1,
              isDeleted: 1,
              createdAt: 1,
              attachment: {
                filename: "$attachmentDetails.filename",
                type: "$attachmentDetails.type",
                size: "$attachmentDetails.size",
                org: "$attachmentDetails.org",
                uploadedBy: "$attachmentDetails.uploadedBy",
                url: "$attachmentDetails.url",
              },
              createdBy: {
                _id: "$createdByDetails._id",
                name: "$createdByDetails.name",
                avatar: "$createdByDetails.profilePhoto",
              },
              task: {
                _id: "$taskDetails._id",
                title: "$taskDetails.title",
                status: "$taskDetails.status",
                progressPercentage: "$taskDetails.progressPercentage",
                attachment: "$taskDetails.attachments",
              },
              approvalRequest: {
                _id: "$approvalRequestDetails._id",
                status: "$approvalRequestDetails.status",
                images: { $map: { input: "$approvalRequestImages", as: "img", in: "$$img.url" } },
                raisedBy: {
                  _id: "$approvalRequestRaisedByDetails._id",
                  name: "$approvalRequestRaisedByDetails.name",
                },
              },
              paymentRequest: {
                _id: "$paymentRequestDetails._id",
                amount: "$paymentRequestDetails.amount",
                raisedBy: {
                  _id: "$paymentRequestRaisedByDetails._id",
                  name: "$paymentRequestRaisedByDetails.name",
                },
                attachments: "$paymentRequestDetails.attachments",
              },
              taggedMessage: {
                _id: "$taggedMessageDetails._id",
                content: "$taggedMessageDetails.content",
                createdBy: "$taggedMessageDetails.createdBy",
                isDeleted: "$taggedMessageDetails.isDeleted",
                attachment: "$taggedMessageDetails.attachment",
              },
              order: {
                _id: "$ordersDetails._id",
                // orderItems: "$ordersDetails.orderItems",
                status: "$ordersDetails.status",
                // paymentStatus: "$ordersDetails.paymentStatus",
                // totalAmount: "$ordersDetails.totalAmount",
                // paymentDate: "$ordersDetails.paymentDate",
                // shippingAddress: "$ordersDetails.shippingAddress",
                // billingAddress: "$ordersDetails.billingAddress",
                // orderDate: "$ordersDetails.orderDate",
                // orderItems: "$ordersDetails.orderItems",
                // customer: {
                //   _id: "$ordersDetails.customer._id",
                //   name: "$ordersDetails.customer.name",
                //   email: "$ordersDetails.customer.email",
                //   phone: "$ordersDetails.customer.phone",
                //   shippingAddress: "$ordersDetails.customer.shippingAddress",
                //   billingAddress: "$ordersDetails.customer.billingAddress",
                //   isDeleted: "$ordersDetails.customer.isDeleted",
                // },
              },
              reactions: {
                $map: {
                  input: "$reactions",
                  as: "reaction",
                  in: {
                    _id: "$$reaction._id",
                    reaction: "$$reaction.reaction",
                    reactedBy: {
                      _id: { $arrayElemAt: ["$reactionUserDetails._id", 0] },
                      name: { $arrayElemAt: ["$reactionUserDetails.name", 0] },
                    },
                  },
                },
              },
            },
          },
        
          // Pagination and metadata
          {
            $facet: {
              messages: [
                { $sort: { createdAt: -1 } },
              ],
            },
          },
          {
            $project: {
              messages: 1,
            },
          },
        ];
        
            const result = await MessageModel.aggregate(pipeline);
            return result[0];
          };
}


module.exports = new MessageService();
