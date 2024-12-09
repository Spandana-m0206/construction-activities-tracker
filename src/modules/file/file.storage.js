const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

// GridFs storage configuration
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) return reject(err);

                const filename = buf.toString('hex') + path.extname(file.originalname);

                // Attach userId and original filename in metadata
                const fileInfo = {
                    filename,
                    bucketName: 'uploads', // Default bucket name
                    metadata: {
                        userId: req.user.userId, // Store userId in metadata
                        originalname: file.originalname, // Store original filename in metadata
                    },
                };
                resolve(fileInfo);
            });
        });
    },
});

// Allowed MIME types for different file categories
const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    // Video
    'video/mp4',
    'video/x-msvideo',
    'video/mpeg',
];

// Multer upload configuration
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Only images, documents, audio, and video files are allowed',
                ),
                false,
            );
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

module.exports = upload;
