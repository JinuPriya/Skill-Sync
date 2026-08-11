const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    participants: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        }
    ],
    swap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Swap"
    },
    lastMessage: String,
    lastMessageAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("Chat", chatSchema);