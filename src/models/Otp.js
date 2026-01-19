const mongoose = require('mongoose');

// const otpSchema = new mongoose.Schema(
//   {
//     identifier: {
//       type: String,
//       required: true
//       // email OR mobile
//     },
//     otp: {
//       type: String,
//       required: true
//     },
//     expiresAt: {
//       type: Date,
//       required: true
//     }
//   },
//   { timestamps: true }
// );

const otpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});


// Auto delete OTP after expiry (MongoDB TTL Time to live given by mongodb feature index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
