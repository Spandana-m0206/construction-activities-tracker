const { StatusCodes } = require('http-status-codes');
const BaseController = require('../base/BaseController');
const PenaltyService = require('./penalty.service');

class PenaltyController extends BaseController {
    constructor() {
        super(PenaltyService); // Pass the PenaltyService to the BaseController
    }

    // Generic method for creating a resource
    async create(req, res) {
        try {
            const { person, penaltyBy,approvedBy } = req.body;
            if(person && penaltyBy && person === penaltyBy) { 
                return res.status(StatusCodes.BAD_REQUEST).json({ success:"false", error: 'Person and penaltyBy cannot be the same' });
            }
            if(person && approvedBy && person === approvedBy) { 
                return res.status(StatusCodes.BAD_REQUEST).json({ success:"false", error: 'Person cannot approve itself penalty' });
            }
            const data = await this.service.create(req.body);
            res.status(StatusCodes.CREATED).json(data);
        } catch (error) {
            console.error(`[PenaltyController Error - create]: ${error.message}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    // Generic method for updating a resource
    async update(req, res) {
        try {
            const { person, penaltyBy,approvedBy } = req.body;
            if(person && penaltyBy && person === penaltyBy) { 
                return res.status(StatusCodes.BAD_REQUEST).json({ success:"false", error: 'Person and penaltyBy cannot be the same' });
            }
            if(person && approvedBy && person === approvedBy) { 
                return res.status(StatusCodes.BAD_REQUEST).json({ success:"false", error: 'Person cannot approve itself penalty' });
            }
            const data = await this.service.updateOne({ _id: req.params.id }, req.body);
            res.status(StatusCodes.OK).json(data);
        } catch (error) {
            console.error(`[PenaltyController Error - update]: ${error.message}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    // Example custom controller method: Get penalties by organization
    async getPenaltiesByOrg(req, res, next) {
        try {
            const penalties = await this.service.findPenaltiesByOrg(req.params.orgId);
            res.status(StatusCodes.OK).json({ success: true, data: penalties });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PenaltyController();
