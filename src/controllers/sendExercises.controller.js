const Exercise = require('../models/exercise');
const allExercises = require('../data/exercises.json');
const featuredIds = require('../scripts/featuredExerciseIds');
exports.sendExercisesOnce = async (req, res) => {
  try {
    
    // 1️⃣ Check if already seeded
    const existingCount = await Exercise.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        message: 'Exercises already sended'
      });
    }


    // 2️⃣ Filter best 100
    const featuredExercises = allExercises
      .filter(ex => featuredIds.includes(ex.id))
      .map(ex => ({
        ...ex,
        isFeatured: true
      }));

    // 3️⃣ Insert into DB
    await Exercise.insertMany(featuredExercises);

    res.status(201).json({
      message: 'Exercises sended successfully',
      count: featuredExercises.length
    });

  } catch (error) {
    console.error('❌ Send error:', error);
    res.status(500).json({
      message: 'Sending failed',
      error: error.message
    });
  }
};
