const BaseService = require('../base/BaseService');
const File = require('./file.model');
const { getGFSBucket } = require('../../config/database');
const { default: mongoose } = require('mongoose');
const mime = require('mime-types')

class FileService extends BaseService {
    constructor() {
        super(File); // Pass the File model to the BaseService
    }

    // Example custom service method: Get files by organization
    async findFilesByOrg(orgId) {
        return await this.model.find({ org: orgId }).populate('uploadedBy', 'name email');
    }

    async getFileDownloadStream (fileId) {
        return new Promise(async (resolve, reject) => {
            try {
                const gfs = getGFSBucket();
                const objectId = new mongoose.Types.ObjectId(fileId);
    
                // First, get the file metadata
                const files = await gfs.find({ _id: objectId }).toArray();
                
                if (files.length === 0) {
                    return reject(new Error('File not found'));
                }
    
                const metadata = files[0];
    
                // Create a readable stream from the bucket
                const readStream = gfs.openDownloadStream(objectId);
    
                // Listen for errors on the stream
                readStream.on('error', (err) => {
                    reject(new Error('Error reading file stream: ' + err.message));
                });
    
                // Resolve with both the stream and metadata
                resolve({
                    fileStream: readStream,
                    metadata: {
                        filename: metadata.filename,
                        contentType: metadata.contentType,
                        length: metadata.length,
                        uploadDate: metadata.uploadDate,
                        metadata: metadata.metadata
                    }
                });
            } catch (error) {
                reject(new Error('Error retrieving file: ' + error.message));
            }
        });
    };
    async getFileStream (res, fileId) {
    try {
        // const fileId = req.params.id;

        // Initialize GridFSBucket
        const bucket = getGFSBucket();

        // const bucket = new GridFSBucket(mongoose.connection.db, {
        //     bucketName: 'fs', // Default bucket name is 'fs'
        // });

        // Find the file in GridFS
        const file = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).send('File not found');
        }
        // Set headers for the file
        res.setHeader('Content-Type',mime.lookup(file[0].filename) || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${file[0].filename}"`);

        // Create a download stream and pipe it to the response
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
        downloadStream.pipe(res);

        // Handle stream errors
        downloadStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).send('Failed to stream the file');
        });

        // Handle end of the stream
        downloadStream.on('end', () => {
            res.end();
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving file');
    }
    };
    async getFileByName(filename){
        try {
            const gfs = getGFSBucket();
            const readstream = gfs.openDownloadStreamByName(filename);
    
            // Handle error if the file doesn't exist
            return new Promise((resolve, reject) => {
                // Handle error if the file doesn't exist
                readstream.on('error', (err) => {
                    reject(new Error('File not found'));
                });
    
                // Resolve the readstream
                resolve(readstream);
            });
        } catch (err) {
            return Promise.reject(err);
        }
    };
}

module.exports = new FileService();
