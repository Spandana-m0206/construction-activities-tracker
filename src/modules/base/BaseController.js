const { StatusCodes } = require("http-status-codes");

class BaseController {
    constructor(service) {
        if (!service) {
            throw new Error('Service is required to initialize BaseController');
        }
        this.service = service;
    }

    // Generic method for creating a resource
    async create(req, res) {
        try {
            const data = await this.service.create(req.body);
            res.status(StatusCodes.CREATED).json(data);
        } catch (error) {
            console.error(`[BaseController Error - create]: ${error.message}`);
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    // Generic method for retrieving multiple resources
    async find(req, res) {
        try {
            const data = await this.service.find(req.query);
            res.status(StatusCodes.OK).json(data);
        } catch (error) {
            console.error(`[BaseController Error - find]: ${error.message}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    // Generic method for retrieving a single resource
    async findOne(req, res) {
        try {
            const data = await this.service.findOne({ _id: req.params.id });
            if (!data) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Resource not found' });
            }
            res.status(StatusCodes.OK).json(data);
        } catch (error) {
            console.error(`[BaseController Error - findOne]: ${error.message}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    // Generic method for updating a resource
    async update(req, res) {
        try {
            const data = await this.service.updateOne({ _id: req.params.id }, req.body);
            res.status(StatusCodes.OK).json(data);
        } catch (error) {
            console.error(`[BaseController Error - update]: ${error.message}`);
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    // Generic method for deleting a resource
    async delete(req, res) {
        try {
            const data = await this.service.deleteOne({ _id: req.params.id });
            res.status(StatusCodes.OK).json({ message: 'Resource deleted', data });
        } catch (error) {
            console.error(`[BaseController Error - delete]: ${error.message}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}

module.exports = BaseController;