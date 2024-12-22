const express = require('express');
const AuthController = require('./auth.controller');

const router = express.Router();

router.post('/login', AuthController.login); // Login User
module.exports = router;
