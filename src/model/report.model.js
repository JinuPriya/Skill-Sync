const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    swap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Swap",
        required: true,
    },
    reason: {
        type: String,
        enum: [
            "Abusive Behaviour",
            "Didn't Teach Claimed Skill",
            "Fake Profile",
            "Spam",
            "Harassment",
            "Other"
        ],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ["Pending", "Reviewed", "Dismissed"],
        default: "Pending",
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
},
{
    timestamps: true
}
);

reportSchema.index(
    {
        reporter: 1,
        swap: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Report", reportSchema)