const express = require('express');
const router = express.Router();
const { sendExercisesOnce } = require('../controllers/sendExercises.controller');

// ⚠️ Call ONLY ONCE
router.post('/send', sendExercisesOnce);

module.exports = router;
