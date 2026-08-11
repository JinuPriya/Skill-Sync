const express = require("express")

const router = express.Router();

const {register, login, getMe, forgetPassword, verifyOTP, resetPassword}= require("../controller/auth.controller.js")

const {protect} = require("../middleware/auth.middleware.js")

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe)
router.post("/forgot-password", forgetPassword)
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)

module.exports = router