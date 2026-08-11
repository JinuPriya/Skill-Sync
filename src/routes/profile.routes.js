const express = require("express")

const router = express.Router();

const {getProfile, updateProfile, addSkillToTeach, getPublicProfile}= require("../controller/profile.controller")

const {protect} = require("../middleware/auth.middleware")

const upload = require("../middleware/certificateUpload.middleware")

router.get("/", protect, getProfile)
router.put("/", protect, updateProfile)
router.get("/:id", protect, getPublicProfile)
router.post("/skills-to-teach", protect, upload.single("certificate"), addSkillToTeach)

module.exports = router