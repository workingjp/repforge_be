const router = require('express').Router();
const userBodyController = require('../controllers/UserBody.controller');

router.post('/bmrscore', userBodyController.UserBMR);

module.exports = router;