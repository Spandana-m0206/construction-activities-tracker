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
                filename: req.file.filename,
                type: req.file.mimetype,
                size: req.file.size,
                org: req.body.org,
                uploadedBy: req.user.userId, // Assuming userId is in the request user object
                url: `${process.env.BASE_URL}/uploads/${req.file.filename}`, // Example URL format
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

    // // Method to handle file download
    // async downloadFile(req, res, next) {
    //     try {
    //         const { filename } = req.params;
    //         const conn = mongoose.connection;
    //         const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //             bucketName: 'uploads',
    //         });

    //         bucket.find({ filename }).toArray((err, files) => {
    //             if (!files || files.length === 0) {
    //                 return res.status(404).json({ message: 'File not found' });
    //             }

    //             res.set('Content-Type', files[0].contentType);
    //             res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);

    //             const downloadStream = bucket.openDownloadStreamByName(filename);
    //             downloadStream.pipe(res);
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}

module.exports = new FileController();
