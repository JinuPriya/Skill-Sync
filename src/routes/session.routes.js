const express = require("express")
const router = express.Router()

const { createSession, getMySessions, cancelSession, completeSession } = require("../controller/session.controller")
const { protect } = require("../middleware/auth.middleware")

router.post("/swap/:swapId/session", protect, createSession)
router.get("/my", protect, getMySessions)
router.patch("/:sessionId/cancel", protect, cancelSession)
router.patch("/:sessionId/complete", protect, completeSession)

module.exports = router;