const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: String,
    attachments: [
        {
        url: String,
        fileType: String,
        fileName: String
        }
    ],
    readBy: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model("Message", messageSchema)