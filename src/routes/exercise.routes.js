const express = require('express');
const router = express.Router();
const { sendExercisesOnce } = require('../controllers/sendExercises.controller');
const { getAllExercisesData } = require('../controllers/sendExercises.controller');
const { automaticsplit } = require('../controllers/sendExercises.controller');

router.post('/send', sendExercisesOnce);
router.post('/getAllWorkOutData', getAllExercisesData);
router.post('/automaticsplit', automaticsplit);

module.exports = router;
