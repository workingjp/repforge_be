const User = require('../models/User');

exports.createTestUser = async (req, res) => {
  try {
    const user = await User.create({
      email: 'test2@repforge.com',
      isVerified: true
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
