const express = require('express');
const router = express.Router();
const { sendExercisesOnce } = require('../controllers/sendExercises.controller');
const { getAllExercisesData } = require('../controllers/sendExercises.controller');

router.post('/send', sendExercisesOnce);
router.post('/getAllWorkOutData', getAllExercisesData);

module.exports = router;
