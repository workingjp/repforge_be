const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');


const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.createUser = async (req, res) => {
    console.log("CreateUser API Data ==>>", req.body);

    try {
        const createUserData = req.body;
        const { firstname, lastname, email, mobile, password } = createUserData;

        if (!firstname) return res.status(400).json({ message: 'firstname is required.' });
        if (!lastname) return res.status(400).json({ message: 'lastname is required.' });
        if (!email) return res.status(400).json({ message: 'email is required.' });
        if (!mobile) return res.status(400).json({ message: 'mobile is required.' });
        if (!password) return res.status(400).json({ message: 'password is required.' });

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }

        existingUser = await User.create({
            firstname,
            lastname,
            fullname: `${firstname} ${lastname}`,
            email,
            mobile,
            password,
            isVerified: true
        });

        const token = generateToken(existingUser._id);

        return res.status(201).json({
            message: 'User Registered Success',
            token,
            user: existingUser
        });

    } catch (err) {
        console.error('CREATE USER ERROR:', err);
        return res.status(500).json({ message: err.message });
    }
};


exports.sendOtp = async (req, res) => {
    console.log("Data from Frontend ======>>>", req.body);

    try {
        const { email, mobile } = req.body;

        // Validate input
        if (!email && !mobile) {
            return res.status(400).json({
                message: 'Email or Mobile is required.'
            });
        }

        // Use one identifier
        const identifier = email || mobile;

        // Check existing OTP
        const existingOtp = await Otp.findOne({ identifier });

        if (existingOtp && existingOtp.expiresAt > new Date()) {
            return res.status(429).json({
                message: 'OTP already sent. Please wait before requesting a new OTP.'
            });
        }

        // Remove old OTPs
        await Otp.deleteMany({ identifier });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        await Otp.create({
            identifier,
            otp,
            expiresAt
        });

        console.log(`OTP for ${identifier}:`, otp);

        res.status(200).json({
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


exports.verifyOtp = async (req, res) => {
    console.log("Data from Frontend verifyotp ====>>>", req.body)
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ message: 'Identifier and OTP required' });
        }

        const otpRecord = await Otp.findOne({ identifier, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Find user or create new one
        let user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) {
            user = await User.create({
                // firstname: identifier,
                // lastname: identifier,
                email: identifier.includes('@') ? identifier : null,
                mobile: identifier.includes('@') ? null : identifier,
                isVerified: true
            });
        } else {
            user.isVerified = true;
            await user.save();
        }

        // Delete OTP after successful verification
        await Otp.deleteMany({ identifier });
        const token = generateToken(user._id);
        res.json({
            message: 'OTP verified successfully',
            token,
            user
        });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
