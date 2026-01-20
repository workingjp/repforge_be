const Exercise = require('../models/exercise');
const allExercises = require('../data/exercises.json');
const featuredIds = require('../scripts/featuredExerciseIds');

exports.sendExercisesOnce = async (req, res) => {
  try {

    const existingCount = await Exercise.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        message: 'Exercises already sended'
      });
    }

    const featuredExercises = allExercises
      .filter(ex => featuredIds.includes(ex.id))
      .map(ex => ({
        ...ex,
        isFeatured: true
      }));

    await Exercise.insertMany(featuredExercises);

    res.status(201).json({
      message: 'Exercises sended successfully',
      count: featuredExercises.length
    });

  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({
      message: 'Sending failed',
      error: error.message
    });
  }
};

exports.getAllExercisesData = async (req, res) => {
  try {
    const { source, action } = req.body || {};
    const exercises = await Exercise.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Exercises fetched successfully',
      data: exercises
    });
  } catch (err) {
    console.log("Get All Exercise Error ==> ", err);
    res.status(500).json({
      message: 'Getting Data failed',
      error: err.message
    });
  }
};
