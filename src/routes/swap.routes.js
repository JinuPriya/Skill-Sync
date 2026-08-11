const express = require("express")
const router = express.Router()

const { findMatches, sendSwapRequest, acceptSwapRequest, rejectSwapRequest, cancelSwapRequest, completeSwap, getMySwaps } = require("../controller/swap.controller")

const {protect} = require("../middleware/auth.middleware")

router.get("/my-swaps", protect, getMySwaps)
router.get("/find-matches", protect, findMatches)
router.post("/send-swap-request", protect, sendSwapRequest)
router.post("/accept-swap-request/:id", protect, acceptSwapRequest)
router.post("/reject-swap-request/:id", protect, rejectSwapRequest)
router.post("/cancel-swap-request/:id", protect, cancelSwapRequest)
router.post("/complete-swap/:id", protect, completeSwap)

module.exports = router;