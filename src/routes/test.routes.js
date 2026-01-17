const router = require('express').Router();
const User = require('../models/User');
const testController = require('../controllers/test.controller');

router.get('/create-user', testController.createTestUser);

module.exports = router;
