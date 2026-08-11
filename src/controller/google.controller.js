const User = require("../model/user.model");
const jwt = require("jsonwebtoken");
const {oauth2Client, GOOGLE_SCOPES} = require("../config/googleOAuth");

const googleAuth = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Missing authentication token."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: GOOGLE_SCOPES,
            prompt: "consent",
            state: userId.toString(),
        });

        res.redirect(authUrl);

    } catch (error) {
        next(error);
    }
};

const googleCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({
                success: false,
                message: "Google authorization failed."
            });
        }

        const userId = state;

        const { tokens } = await oauth2Client.getToken(code);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.googleAccessToken = tokens.access_token;

        if (tokens.refresh_token) {
            user.googleRefreshToken = tokens.refresh_token;
        }

        if (tokens.expiry_date) {
            user.googleTokenExpiry = new Date(tokens.expiry_date);
        }

        user.googleCalendarConnected = true;

        await user.save();

        return res.redirect("http://localhost:5173/profile?google=connected");
    } catch (error) {
        return res.redirect("http://localhost:5173/profile?google=error");
    }
};


module.exports = {googleAuth, googleCallback};