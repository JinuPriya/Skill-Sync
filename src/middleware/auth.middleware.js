const jwt = require("jsonwebtoken")
const User = require("../model/user.model")

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];//gives payload only
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.id).select("-password")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user no longer exists"
            })
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Contact support for help."
            })
        }

        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} is not allowed to access this route`
            })
        }
        next()
    }
}

module.exports = { protect, authorize }