const express = require("express")

const router = express.Router()

const { getMyChats, getChatMessages, sendMessage } = require("../controller/chat.controller")

const upload = require("../middleware/chatUpload.middleware")

const { protect } = require("../middleware/auth.middleware")

router.get("/chats", protect, getMyChats)
router.get("/chat/:chatId/messages", protect, getChatMessages)
router.post("/chat/:chatId/messages", protect, upload.array("attachments", 5), sendMessage)

module.exports = router