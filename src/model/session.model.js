const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
    swap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Swap",
        required: true,
    },
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    scheduledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    goal: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    meetingLink: {
        type: String,
        default: "",
    },
    googleEventId: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["Scheduled", "Completed", "Cancelled"],
        default: "Scheduled",
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Session", sessionSchema);