const UserBody = require('../models/UserBody');

exports.UserBMR = async (req, res) => {
    console.log("BMR frontend ==>", req.body);

    try {
        const { name, age, height, weight, gender } = req.body;

        if (!name || !age || !height || !weight || !gender) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!['male', 'female'].includes(gender.toLowerCase())) {
            return res.status(400).json({
                message: "Gender must be male or female"
            });
        }

        let bmr;

        if (gender.toLowerCase() === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        bmr = Math.round(bmr);

        const userBody = await UserBody.create({
            name,
            age,
            height,
            weight,
            gender,
            bmr
        });

        res.status(200).json({
            message: `Your BMR is ${bmr} calories/day. This means your body needs approximately 1701 calories per day to maintain basic functions like breathing, heartbeat, and digestion while at complete rest. This is a normal physiological value and NOT a health risk indicator. Eating significantly below this number for long periods may be unsafe. Your actual daily calorie needs depend on your activity level and fitness goal.`,
            bmr,
            data: userBody
        });

    } catch (error) {
        console.error("BMR ERROR:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
