const BaseService = require('../base/BaseService');
const Penalty = require('./penalty.model');

class PenaltyService extends BaseService {
    constructor() {
        super(Penalty); // Pass the Penalty model to the BaseService
    }

    async handleOperation(operation, operationName, ...args) {
        try {
            return await operation(...args);
        } catch (error) {
            console.error(`[PenaltyService Error - ${operationName}]: ${error.message}`);
            throw new Error(
                `Failed to perform ${operationName}. ${error.message || 'Unknown error occurred.'}`
            );
        }
    }

    async create(data) {
        return this.handleOperation(Penalty.create.bind(Penalty), 'create', data);
    }

    async find(filter = {}, projection = {}, options = {}) {
        return this.handleOperation(Penalty.find.bind(Penalty), 'find', filter, projection, options);
    }

    async findOne(filter = {}, projection = {}, options = {}) {
        return this.handleOperation(Penalty.findOne.bind(Penalty), 'findOne', filter, projection, options);
    }

    async update(filter, updateData, options = {}) {
        return this.handleOperation(Penalty.updateMany.bind(Penalty), 'updateMany', filter, updateData, options);
    }

    async updateOne(filter, updateData, options = {}) {
        return this.handleOperation(Penalty.updateOne.bind(Penalty), 'updateOne', filter, updateData, options);
    }

    async delete(filter) {
        return this.handleOperation(Penalty.deleteMany.bind(Penalty), 'deleteMany', filter);
    }

    async deleteOne(filter) {
        return this.handleOperation(Penalty.deleteOne.bind(Penalty), 'deleteOne', filter);
    }
    // Example custom service method: Get penalties by organization
    async findPenaltiesByOrg(orgId) {
        return await Penalty.find({ org: orgId })
            .populate('person', 'name email')
            .populate('penaltyBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('site', 'name location');
    }
}

module.exports = new PenaltyService();
