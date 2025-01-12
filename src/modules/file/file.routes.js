const express = require('express');
const FileController = require('./file.controller');
const upload = require('./file.storage'); // GridFS Multer configuration

const router = express.Router();

// Use the upload middleware, then pass control to the controller
router.post('/', upload.single('file'), FileController.uploadFile.bind(FileController));

router.get('/', FileController.find.bind(FileController));
router.get('/:id', FileController.findOne.bind(FileController));
router.delete('/:id', FileController.delete.bind(FileController));

// Custom route: Get files by organization
router.get('/org/:orgId', FileController.getFilesByOrg.bind(FileController));
router.get('/link/:fileId', FileController.getDownloadFile.bind(FileController));
// router.get('/download/:filename', FileController.downloadFile.bind(FileController));

module.exports = router;
