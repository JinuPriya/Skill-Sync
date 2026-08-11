const mongoose = require("mongoose");

const swapSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        skillOffered: {
            type: String,
            required: true,
        },

        skillRequested: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Rejected",
                "Completed",
                "Cancelled",
            ],
            default: "Pending",
        },
        completedByRequester: {
            type: Boolean,
            default: false,
        },
        completedByReceiver: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Swap", swapSchema);