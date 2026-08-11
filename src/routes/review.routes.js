const express = require("express")

const router = express.Router();

const { createReview, getUserReviews, updateReview, deleteReview }= require("../controller/review.controller")

const {protect} = require("../middleware/auth.middleware")

router.post("/:swapId", protect, createReview);
router.get("/user/:userId", getUserReviews);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router