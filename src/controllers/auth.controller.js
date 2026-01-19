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
        let existingMobile = await User.findOne({ mobile });

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }
        if (existingMobile) {
            return res.status(409).json({
                message: 'Mobile number already registered'
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

exports.loginWithPass = async (req, res) => {
    console.log("Login Data from frontend ======>>>", req.body);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "email is invalid"
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{3,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password Must include uppercase, lowercase, number & special character"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email"
            });
        }

        if (password !== user.password) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Server ki ma ka plz restart server 3-4 times after that chodavo."
        });
    }
};

exports.sendOtp = async (req, res) => {
    console.log("Data from Frontend ======>>>", req.body);

    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                message: 'Mobile is required.'
            });
        }

        const mobileRegex = /^[6-9]\d{9}$/;

        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                message: "Invalid mobile number."
            });
        }

        const existingOtp = await Otp.findOne({ mobile });

        if (existingOtp && existingOtp.expiresAt > new Date()) {
            return res.status(429).json({
                message: 'OTP already sent. Please wait before requesting a new OTP.'
            });
        }

        await Otp.deleteMany({ mobile });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        await Otp.create({
            mobile,
            otp,
            expiresAt
        });

        console.log(`OTP for ${mobile}:`, otp);

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
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ message: 'Mobile and OTP required' });
        }

        const otpRecord = await Otp.findOne({ mobile, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Find user or create new one

        const user = await User.findOne({ mobile });

        // let user = await User.findOne({
        //     $or: [{ email: identifier }, { mobile: identifier }]
        // });

        // Delete OTP after successful verification
        await Otp.deleteMany({ mobile });
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
