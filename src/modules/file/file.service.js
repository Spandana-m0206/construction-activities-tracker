const BaseService = require('../base/BaseService');
const File = require('./file.model');

class FileService extends BaseService {
    constructor() {
        super(File); // Pass the File model to the BaseService
    }

    // Example custom service method: Get files by organization
    async findFilesByOrg(orgId) {
        return await this.model.find({ org: orgId }).populate('uploadedBy', 'name email');
    }
}

module.exports = new FileService();
