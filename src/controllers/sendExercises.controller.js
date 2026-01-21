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

// let's generate automated workout plan over user's body choice

function trainingParams(ageGroup, gender) {
  if (ageGroup === 'late40s') {
    return {
      sets: gender === 'male' ? 3 : 2,
      reps: '10-12',
      rest: '90-120 sec'
    };
  }

  return {
    sets: gender === 'male' ? 4 : 3,
    reps: '8-12',
    rest: '60-90 sec'
  };
}

async function getExercises(muscles, limit = 8) {
  return await Exercise.aggregate([
    {
      $match: {
        primaryMuscles: { $in: muscles },
        category: 'strength'
      }
    },
    { $sample: { size: limit } }
  ]);
}

exports.automaticsplit = async (req, res) => {
  try {
    const { age, gender, weight, bmr, activity, workoutdays } = req.body;

    if (!age || !gender || !weight || !bmr || !activity || !workoutdays) {
      return res.status(400).json({ message: 'Badhi field mokal chodu' });
    }

    let ageGroup = 'young';
    if (age >= 31 && age <= 40) ageGroup = 'adult';
    if (age >= 41) ageGroup = 'late40s';

    let activityFactor;
    if (activity === 'sedentary') activityFactor = 1.2;
    else if (activity === 'light') activityFactor = 1.375;
    else if (activity === 'moderate') activityFactor = 1.55;
    else if (activity === 'active') activityFactor = 1.725;

    // const activityFactor = {
    //   sedentary: 1.2,
    //   light: 1.375,
    //   moderate: 1.55,
    //   active: 1.725
    // }[activity];

    // if (!activityFactor || !bmr) {
    //   return res.status(401).json({
    //     message: 'did not get activity',
    //   });
    // }

    const maintenanceCalories = Math.round(bmr * activityFactor);

    const targetCalories = (ageGroup === 'late40s') ? (maintenanceCalories - 250) : (maintenanceCalories - 150);

    const params = trainingParams(ageGroup, gender);

    const SPLIT_MAP = {
      push: ['chest', 'shoulders', 'triceps'],
      pull: ['back', 'biceps'],
      legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
      lower: ['quadriceps', 'hamstrings', 'glutes', 'calves']
    };

    const DAY_SPLITS = {
      6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
      5: ['upper', 'lower', 'push', 'pull', 'legs'],
      4: ['upper', 'lower', 'upper', 'lower']
    };

    const splitDays = DAY_SPLITS[workoutdays];

    const workoutPlan = [];

    for (let i = 0; i < splitDays.length; i++) {
      const splitType = splitDays[i];
      const muscles = SPLIT_MAP[splitType];

      const exercises = await Exercise.aggregate([
        {
          $match: {
            primaryMuscles: { $in: muscles },
            category: 'strength'
          }
        },
        { $sample: { size: 8 } }
      ]);

      workoutPlan.push({
        day: `Day ${i + 1} - ${splitType.toUpperCase()}`,
        focus: muscles,
        exercises: exercises.map(ex => ({
          exerciseId: ex._id,
          name: ex.name,
          equipment: ex.equipment,
          mechanic: ex.mechanic,
          sets: params.sets,
          reps: params.reps,
          rest: params.rest,
          instructions: ex.instructions,
          images: ex.images
        }))
      });
    }

    res.status(200).json({
      ageGroup,
      calories: {
        maintenance: maintenanceCalories,
        target: targetCalories
      },
      protein: `${Math.round(weight * 2)}g`,
      workoutPlan
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal error',
      error: err.message
    });
  }
};



