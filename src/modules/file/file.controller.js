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
    
            // const { fileStream, metadata } = await FileService.getFileStream(res, req.params.fileId);
            await FileService.getFileStream(res, req.params.fileId);
            // if (!fileStream) {
            //     return res.status(StatusCodes.NOT_FOUND).json({
            //         success: false,
            //         message: 'File not found',
            //     });
            // }
            // // Set Content-Security-Policy based on the request origin
            // const allowedOrigins = [process.env.STUDENT_APP_URL, process.env.ADMIN_APP_URL];
            // if (allowedOrigins.includes(origin)) {
            //     res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${origin}`);
            // } else {
            //     res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
            // }
    
                    // Set appropriate headers
            // res.setHeader('Content-Disposition', `attachment; filename="${metadata.filename}"`);
            // res.setHeader('Content-Type', metadata.type || 'application/octet-stream');
    
            // Pipe the file stream to the response
            // fileStream.pipe(res);
        } catch (error) {
            next(error);
        }
    };
    // async getDownloadFile  (req, res, next)  {
    //     try {
    //         const { origin } = req.headers;
    
    //         const { fileStream, metadata } = await FileService.getFileDownloadStream(res, req.params.fileId);
    //         if (!fileStream) {
    //             return res.status(StatusCodes.NOT_FOUND).json({
    //                 success: false,
    //                 message: 'File not found',
    //             });
    //         }
    //         // Set Content-Security-Policy based on the request origin
    //         const allowedOrigins = [process.env.STUDENT_APP_URL, process.env.ADMIN_APP_URL];
    //         if (allowedOrigins.includes(origin)) {
    //             res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${origin}`);
    //         } else {
    //             res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    //         }
    
    //                 // Set appropriate headers
    //         res.setHeader('Content-Disposition', `attachment; filename="${metadata.filename}"`);
    //         res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
    
    //         // Pipe the file stream to the response
    //         fileStream.pipe(res);
    //     } catch (error) {
    //         next(error);
    //     }
    // };

    
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
