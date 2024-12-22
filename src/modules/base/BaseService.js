class BaseService {
    constructor(model) {
        if (!model) {
            throw new Error('Model is required to initialize BaseService');
        }
        this.model = model;
    }

    // Utility to handle errors with descriptive details
    async handleOperation(operation, operationName, ...args) {
        try {
            return await operation(...args);
        } catch (error) {
            console.error(`[BaseService Error - ${operationName}]: ${error.message}`);
            throw new Error(
                `Failed to perform ${operationName}. ${error.message || 'Unknown error occurred.'}`
            );
        }
    }

    async create(data) {
        return this.handleOperation(this.model.create.bind(this.model), 'create', data);
    }

    async find(filter = {}, projection = {}, options = {}) {
        return this.handleOperation(this.model.find.bind(this.model), 'find', filter, projection, options);
    }

    async findById(id) {
        return this.handleOperation(this.model.findById.bind(this.model), 'findById', id);
    }

    async findOne(filter = {}, projection = {}, options = {}) {
        return this.handleOperation(this.model.findOne.bind(this.model), 'findOne', filter, projection, options);
    }

    async update(filter, updateData, options = {}) {
        return this.handleOperation(this.model.updateMany.bind(this.model), 'updateMany', filter, updateData, options);
    }

    async updateOne(filter, updateData, options = {}) {
        return this.handleOperation(this.model.updateOne.bind(this.model), 'updateOne', filter, updateData, options);
    }

    async delete(filter) {
        return this.handleOperation(this.model.deleteMany.bind(this.model), 'deleteMany', filter);
    }

    async deleteOne(filter) {
        return this.handleOperation(this.model.deleteOne.bind(this.model), 'deleteOne', filter);
    }
}

module.exports = BaseService;
