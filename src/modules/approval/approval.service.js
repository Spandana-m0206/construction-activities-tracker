const BaseService = require('../base/BaseService');
const Approval = require('./approval.model');
const fileService = require('../file/file.service');
class ApprovalService extends BaseService {
    constructor() {
        super(Approval); // Pass the Approval model to the BaseService
    }

    async find(filters) {
        return await this.model.find(filters)
            .populate({
                path: 'task',
                select: 'title isSystemGenerated priority startTime endTime', // Populate relevant Task fields
                populate: [
                    {
                        path: 'assignedTo',
                        select: 'name email role', // Populate User fields in Task
                    },
                    {
                        path: 'createdBy',
                        select: 'name email', // Populate User fields for createdBy
                    },
                    {
                        path: 'site',
                        select: '_id name', // Populate User fields for createdBy
                    },
                ],
            })
            .populate('site', 'name location') // Populate Site details (adjust fields as necessary)
            .populate('approvedBy', 'name email role'); // Populate User details for approvedBy (adjust fields as necessary)
    }
    // Example custom service method: Get approvals by site
    async findApprovalsBySite(filter = {}) {
        return await this.model.find(filter)
            .populate('task', 'title status')
            .populate('images', 'url')
            .populate('approvedBy', 'name email')
            .populate('org', 'name');
    }
    async addImagesToApproval(approvalId, files) {
        try {
            // Save the uploaded files to the database
            const savedFiles = await fileService.createBulk(files);

            // Extract file IDs
            const fileIds = savedFiles.map((file) => file._id);

            // Update the approval document with the uploaded file references
            const updatedApproval = await this.model.findByIdAndUpdate(
                approvalId,
                { $push: { images: { $each: fileIds } } }, // Add file IDs to the images field
                { new: true } // Return the updated document
            )
                .populate('images', 'filename url') // Optionally populate image details
                .populate('approvedBy', 'name email') // Optionally populate approval details
                .exec();

            return updatedApproval;
        } catch (error) {
            throw new Error(`Failed to add images to approval: ${error.message}`);
        }
    }
}

module.exports = new ApprovalService();
