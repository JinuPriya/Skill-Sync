const cron = require("node-cron")
const Session = require("../model/session.model")
const { sendSessionReminderEmail } = require("../utils/sendSessionEmail.utils")

cron.schedule("*/5 * * * *", async () => {
    try {
        console.log("Checking for upcoming sessions...");
        const now = new Date()
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
        const sessions = await Session.find({
            status: "Scheduled",
            reminderSent: false,
            startTime: {
                $gte: now,
                $lte: oneHourLater
            }
        }).populate("user1", "name email")
            .populate("user2", "name email")

        for (const session of sessions) {
            await sendSessionReminderEmail(
                session.user1.email,
                session.user1.name,
                session.goal,
                session.startTime,
                session.meetingLink
            )
            await sendSessionReminderEmail(
            session.user2.email,
            session.user2.name,
            session.goal,
            session.startTime,
            session.meetingLink
            )
            session.reminderSent = true;
            await session.save();
        }

    } catch (error) {
        console.error("Session reminderjob failed: ", error)
    }
})