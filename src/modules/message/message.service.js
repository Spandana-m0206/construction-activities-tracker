const BaseService = require('../base/BaseService');
const Message = require('./message.model');

class MessageService extends BaseService {
    constructor() {
        super(Message); // Pass the Message model to the BaseService
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
}

module.exports = new MessageService();
