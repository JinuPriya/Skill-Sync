const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reviewedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        swap: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Swap",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

// One review per user per swap
reviewSchema.index(
    { reviewer: 1, swap: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);