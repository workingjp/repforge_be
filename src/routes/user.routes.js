const router = require('express').Router();
const protect = require('../middlewares/auth.middleware');

router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    user: req.user
  });
});

module.exports = router;
