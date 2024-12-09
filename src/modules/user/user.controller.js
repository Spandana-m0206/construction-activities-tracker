const BaseController = require('../base/BaseController');
const UserService = require('./user.service');

class UserController extends BaseController {
    constructor() {
        super(UserService); // Pass the UserService to the BaseController
    }

    // Example of a custom controller method: Get users by role
    async getUsersByRole(req, res, next) {
        try {
            const users = await this.service.findUsersByRole(req.params.role);
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
