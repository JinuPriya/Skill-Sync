const Session = require("../model/session.model")
const Swap = require("../model/swap.model")
const { sendSessionConfirmationEmail } = require("../utils/sendSessionEmail.utils")
const { createGoogleMeetEvent } = require("../utils/googleCalender.utils")

const createSession = async (req, res, next) => {
    try {
        const { swapId } = req.params;
        const { startTime, endTime, goal } = req.body;

        if (!startTime || !endTime || !goal) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        const swap = await Swap.findById(swapId)
            .populate("requester", "name email")
            .populate("receiver", "name email");

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap not found."
            });
        }

        if (swap.status !== "Accepted") {
            return res.status(400).json({
                success: false,
                message: "Sessions can only be created after the swap is accepted."
            });
        }

        const userId = req.user.id

        if (userId !== swap.requester._id.toString() && userId !== swap.receiver._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only participants of a swap can schedule a session"
            })
        }

        const meetResult = await createGoogleMeetEvent({
            organizerId: userId,
            summary: `SkillSync: ${goal}`,
            description: `Skill swap session between ${swap.requester.name} and ${swap.receiver.name}.`,
            startTime,
            endTime,
            attendeeEmails: [swap.requester.email, swap.receiver.email],
        });

        if (!meetResult) {
            return res.status(400).json({
                success: false,
                message: "Please connect your Google Calendar from your Profile page first, then try scheduling again."
            });
        }

        const { meetingLink, googleEventId } = meetResult;

        const session = await Session.create({
            swap: swapId,
            user1: swap.requester,
            user2: swap.receiver,
            scheduledBy: userId,
            goal,
            startTime,
            endTime,
            meetingLink,
            googleEventId,
        })

        await sendSessionConfirmationEmail(
            swap.requester.email,
            swap.requester.name,
            goal,
            startTime,
            endTime,
            meetingLink
        );

        await sendSessionConfirmationEmail(
            swap.receiver.email,
            swap.receiver.name,
            goal,
            startTime,
            endTime,
            meetingLink
        );

        return res.status(201).json({
            success: true,
            message: "Session created successfully",
            session,
        })
    } catch (error) {
        next(error)
    }
}

const getMySessions = async (req, res, next) => {
    try {
        const userId = req.user.id

        const sessions = await Session.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        }).populate("user1", "name email")
            .populate("user2", "name email")
            .populate("scheduledBy", "name email")
            .populate("swap")
            .sort({ startTime: 1 })

        return res.status(200).json({
            success: true,
            count: sessions.length,
            sessions
        });
    } catch (error) {
        next(error)
    }
}

const cancelSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params
        const userId = req.user.id

        const session = await Session.findById(sessionId)

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found."
            })
        }

        if (session.user1.toString() !== userId && session.user2.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this session."
            })
        }

        if (session.status !== "Scheduled") {
            return res.status(400).json({
                success: false,
                message: "Only scheduled sessions can be cancelled."
            });
        }

        if (session.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Session is already cancelled."
            })
        }

        session.status = "Cancelled"
        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session cancelled successfully."
        })
    } catch (error) {
        next(error)
    }
}

const completeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params
        const userId = req.user.id

        const session = await Session.findById(sessionId)

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found."
            })
        }

        if (session.user1.toString() !== userId && session.user2.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to complete this session."
            })
        }

        if (session.status !== "Scheduled") {
            return res.status(400).json({
                success: false,
                message: "Only scheduled sessions can be completed."
            });
        }
        session.status = "Completed"
        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session completed successfully.",
            session
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { createSession, getMySessions, cancelSession, completeSession }