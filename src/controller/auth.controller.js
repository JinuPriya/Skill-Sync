const jwt = require("jsonwebtoken")
const User = require("../model/user.model")
const transporter = require("../config/email")

const generateToken = (user) => {
    return jwt.sign({id: user._id, email: user.email, role: user.role},
                     process.env.JWT_SECRET,
                     {expiresIn: process.env.TOKEN_EXPIRE}
    )
}

const generateResetToken = (user) => {
    return jwt.sign({id: user._id, email: user.email, purpose: "reset-password"},
                     process.env.JWT_SECRET,
                     {expiresIn: process.env.RESET_TOKEN_EXPIRE}
    )
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const register = async (req, res, next) => {
    try {
        const {name, email, password} = req.body

        const exists = await User.findOne({email})

        if(exists){
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            })
        }

        const user = await User.create({name, email, password})

        res.status(201).json({
            success: true,
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email & password are required"
            })
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const isMatch = await user.matchPassword(password)

        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        if(user.isBlocked){
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Contact support for help."
            })
        }

        res.status(200).json({
            success: true,
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}

const getMe = (req, res, next) => {
    try {
        res.json({
            success: true,
            user: req.user
        })
    } catch (error) {
        next(error)
    }
}

const forgetPassword = async (req, res, next) => {
    try {
        const {email} = req.body

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const otp = generateOTP()
        user.otp = otp
        user.otpExpiry = Date.now() + 5*60*1000

        await user.save()

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP to reset password",
            html: `
              <h2>Password Reset OTP</h2>
              <p>Your OTP</p>
              <h1>${otp}</h1>
              <p>This OTP is valid for 5 minutes only!</p>
            `
        })

        res.status(200).json({
            success: true,
            message: "OTP sent successfully!"
        })
    } catch (error) {
        next(error)
    }
}

const verifyOTP = async (req, res, next) => {
    try {
        const {email, otp} = req.body

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if(Date.now() > user.otpExpiry){
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            })
        }

        if(user.otp != otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        res.status(200).json({
            success: true,
            message: "OTP verified successfully!",
            resetToken: generateResetToken(user)
        })
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const {newPassword} = req.body

        let resetToken

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            resetToken = req.headers.authorization.split(" ")[1]
        }

        if(!resetToken) {
            return res.status(401).json({
                success: false,
                message: "Reset token is missing."
            });
        }

        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET)

        if(decoded.purpose != "reset-password"){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const user = await User.findById(decoded.id)
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if(!newPassword){
            return res.status(400).json({
                success: false,
                message: "New password is required"
            })
        }

        user.password = newPassword

        user.otp = undefined
        user.otpExpiry = undefined

        await user.save()

        res.status(200).json({
            success: true,
            message: "Password updated successfully!"
        })
    } catch (error) {
       next(error) 
    }
}

module.exports = {register, login, getMe, forgetPassword, verifyOTP, resetPassword};