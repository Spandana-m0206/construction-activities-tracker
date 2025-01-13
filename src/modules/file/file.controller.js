const BaseController = require('../base/BaseController');
const FileService = require('./file.service');

class FileController extends BaseController {
    constructor() {
        super(FileService); // Pass the FileService to the BaseController
    }

    // Method to handle file upload
    async uploadFile(req, res, next) {
        try {
            const fileData = {
                filename: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size,
                org: req.user.org,
                uploadedBy: req.user.userId, // Assuming userId is in the request user object
                url: `${process.env.BASE_URL}/file/link/${req.file.id}`, // Example URL format
            };

            const newFile = await this.service.create(fileData);
            res.status(201).json({ success: true, data: newFile });
        } catch (error) {
            next(error);
        }
    }
    
    // Existing methods...
    async getFilesByOrg(req, res, next) {
        try {
            const files = await this.service.findFilesByOrg(req.params.orgId);
            res.status(200).json({ success: true, data: files });
        } catch (error) {
            next(error);
        }
    }

    async getDownloadFile  (req, res, next)  {
        try {
            const { origin } = req.headers;
    
            await FileService.getFileStream(res, req.params.fileId);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new FileController();
