const express = require('express');
const PasswordresetController = require('../controllers/passwordreset.controller');
const router = express.Router();


router.post('/forgetpassword', PasswordresetController.forgetpassword);
router.post('/resetpassword', PasswordresetController.resetpassword);

module.exports = router;
