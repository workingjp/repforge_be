const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/create-user', authController.createUser);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
