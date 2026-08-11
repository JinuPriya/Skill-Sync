const Review = require("../model/review.model")
const Swap = require("../model/swap.model")
const User = require("../model/user.model")

const updateAverageRating = async (userId) => {
    const reviews = await Review.find({ reviewedUser: userId });

    if (reviews.length === 0) {
        await User.findByIdAndUpdate(userId, {
            averageRating: 0,
        });
        return;
    }

    const total = reviews.reduce((sum, review) => {
        return sum + review.rating;
    }, 0);

    const average = total / reviews.length;

    await User.findByIdAndUpdate(userId, {
        averageRating: Number(average.toFixed(1)),
    });
};

const createReview = async (req, res, next) => {
    try {
        const { swapId } = req.params;
        const { rating, comment } = req.body;

        // Find swap
        const swap = await Swap.findById(swapId);

        // Check if swap exists
        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap not found."
            });
        }

        // Check if swap is completed
        if (swap.status !== "Completed") {
            return res.status(400).json({
                success: false,
                message: "Reviews can only be added after the swap is completed."
            });
        }

        // Check if logged-in user participated in the swap
        if (
            swap.requester.toString() !== req.user._id.toString() &&
            swap.receiver.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to review this swap."
            });
        }

        // Determine the user being reviewed
        const reviewedUser =
            swap.requester.toString() === req.user._id.toString()
                ? swap.receiver
                : swap.requester;

        // Check if review already exists
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            swap: swapId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this swap."
            });
        }

        // Create review
        const review = await Review.create({
            reviewer: req.user._id,
            reviewedUser,
            swap: swapId,
            rating,
            comment
        });

        await updateAverageRating(reviewedUser);

        res.status(201).json({
            success: true,
            message: "Review added successfully.",
            review
        });

    } catch (error) {
        next(error);
    }
};

const getUserReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const reviews = await Review.find({ reviewedUser: userId })
            .populate("reviewer", "name")
            .populate("swap", "skillOffered skillRequested requester receiver")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        // Only the reviewer can update the review
        if (review.reviewer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this review."
            });
        }

        review.rating = rating ?? review.rating;
        review.comment = comment ?? review.comment;

        await review.save();

        await updateAverageRating(review.reviewedUser);

        res.status(200).json({
            success: true,
            message: "Review updated successfully.",
            review
        });

    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        // Only the reviewer can delete the review
        if (review.reviewer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review."
            });
        }

        const reviewedUser = review.reviewedUser;

        await review.deleteOne();

        await updateAverageRating(reviewedUser);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, getUserReviews, updateReview, deleteReview };