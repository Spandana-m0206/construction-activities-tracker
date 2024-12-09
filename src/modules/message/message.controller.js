const BaseController = require('../base/BaseController');
const MessageService = require('./message.service');

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
}

module.exports = new MessageController();
