const User = require("../model/user.model");
const { countOverlappingSlots } = require("../utils/timezone.utils");
const Swap = require("../model/swap.model");
const Chat = require("../model/chat.model")
const Session = require("../model/session.model")

const findMatches = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id).select("-password");

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const myTeachSkills = currentUser.skillsToTeach.map(
            item => item.skill
        );

        const potentialMatches = await User.find({
            _id: { $ne: currentUser._id },
            "skillsToTeach.skill": {
                $in: currentUser.skillsToLearn
            },
            skillsToLearn: {
                $in: myTeachSkills
            }
        }).select("-password -otp -otpExpiry");

        const matches = potentialMatches.map(user => {

            const overlappingSlots = countOverlappingSlots(
                currentUser.availabilitySlots,
                user.availabilitySlots
            );

            const theirTeachSkills = user.skillsToTeach.map(item => item.skill);

            const theyTeachYouWant = theirTeachSkills.filter(skill =>
                currentUser.skillsToLearn.includes(skill)
            );

            const youTeachTheyWant = myTeachSkills.filter(skill =>
                user.skillsToLearn.includes(skill)
            );

            return {
                _id: user._id,
                name: user.name,
                totalSwaps: user.totalSwaps,
                averageRating: user.averageRating,
                verifiedTeacher: user.verifiedTeacher,
                skillsToTeach: user.skillsToTeach,
                skillsToLearn: user.skillsToLearn,
                theyTeachYouWant,
                youTeachTheyWant,
                availabilityMatch: overlappingSlots > 0,
                overlappingSlots
            };
        });

        matches.sort((a, b) => {
            if (a.availabilityMatch !== b.availabilityMatch) {
                return b.availabilityMatch - a.availabilityMatch;
            }
            return (b.averageRating || 0) - (a.averageRating || 0);
        });

        return res.status(200).json({
            success: true,
            totalMatches: matches.length,
            matches
        });

    } catch (error) {
        next(error);
    }
};

const sendSwapRequest = async (req, res, next) => {
    try {
        const { receiver, skillOffered, skillRequested } = req.body

        const requester = await User.findById(req.user._id).select("-password")

        if (!requester) {
            return res.status(404).json({
                success: false,
                message: "Requester not found.",
            });
        }

        const receiverUser = await User.findById(receiver);

        if (!receiverUser) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found.",
            });
        }

        if (requester._id.toString() === receiverUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a swap request to yourself.",
            });
        }

        const canTeach = requester.skillsToTeach.some(
            (skill) => skill.skill === skillOffered
        )

        if (!canTeach) {
            return res.status(400).json({
                success: false,
                message: "You cannot offer a skill that is not in your profile.",
            });
        }

        const canReceiverTeach = receiverUser.skillsToTeach.some(
            (skill) => skill.skill === skillRequested
        )

        if (!canReceiverTeach) {
            return res.status(400).json({
                success: false,
                message: "Receiver does not teach the requested skill.",
            });
        }

        const existingRequest = await Swap.findOne({
            requester: requester._id,
            receiver: receiverUser._id,
            skillOffered,
            skillRequested,
            status: "Pending"
        })

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "A pending swap request already exists.",
            });
        }

        const swap = await Swap.create({
            requester: requester._id,
            receiver: receiverUser._id,
            skillOffered,
            skillRequested
        });

        return res.status(201).json({
            success: true,
            message: "Swap request sent successfully!",
            swap,
        })
    } catch (error) {
        next(error)
    }
}

const acceptSwapRequest = async (req, res, next) => {
    try {
        const swap = await Swap.findById(req.params.id)

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found.",
            })
        }

        if (swap.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this request.",
            })
        }

        if (swap.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be accepted.",
            });
        }

        swap.status = "Accepted";
        await swap.save();

        const chat = await Chat.create({
            participants: [swap.requester, swap.receiver],
            swap: swap._id
        });

        return res.status(200).json({
            success: true,
            message: "Swap request accepted successfully.",
            swap,
        });

    } catch (error) {
        next(error)
    }
}

const rejectSwapRequest = async (req, res, next) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found.",
            });
        }

        if (swap.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reject this request.",
            });
        }

        if (swap.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be rejected.",
            });
        }

        swap.status = "Rejected";
        await swap.save();

        return res.status(200).json({
            success: true,
            message: "Swap request rejected.",
            swap,
        });

    } catch (error) {
        next(error);
    }
};

const cancelSwapRequest = async (req, res, next) => {
    try {
        const swap = await Swap.findById(req.params.id)

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found.",
            })
        }

        if (swap.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this request.",
            });
        }

        if (swap.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be cancelled.",
            });
        }

        swap.status = "Cancelled";
        await swap.save();

        return res.status(200).json({
            success: true,
            message: "Swap request cancelled.",
            swap,
        })
    } catch (error) {
        next(error)
    }
}

const completeSwap = async (req, res, next) => {
    try {
        const swap = await Swap.findById(req.params.id)

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found."
            })
        }

        const userId = req.user._id.toString();
        const isRequester = swap.requester.toString() === userId;
        const isReceiver = swap.receiver.toString() === userId;

        if (!isRequester && !isReceiver) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to complete this swap."
            })
        }

        if (swap.status !== "Accepted") {
            return res.status(400).json({
                success: false,
                message: "Only accepted swaps can be completed."
            })
        }

        if (isRequester) {
            swap.completedByRequester = true
        }
        if (isReceiver) {
            swap.completedByReceiver = true
        }

        if (swap.completedByRequester && swap.completedByReceiver) {
            swap.status = "Completed"

            const requester = await User.findById(swap.requester)
            const receiver = await User.findById(swap.receiver)

            requester.totalSwaps += 1
            receiver.totalSwaps += 1

            if (requester.totalSwaps >= 10) {
                requester.verifiedTeacher = true
            }
            if (receiver.totalSwaps >= 10) {
                receiver.verifiedTeacher = true
            }

            await requester.save();
            await receiver.save();
        }

        await swap.save();

        return res.status(200).json({
            success: true,
            message: swap.status === "Completed"
                ? "Swap marked as completed."
                : "Waiting for the other participant to confirm completion.",
            swap,
        })
    } catch (error) {
        next(error)
    }
}

const getMySwaps = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const swaps = await Swap.find({
            $or: [{ requester: userId }, { receiver: userId }]
        })
            .populate("requester", "name totalSwaps averageRating verifiedTeacher")
            .populate("receiver", "name totalSwaps averageRating verifiedTeacher")
            .sort({ updatedAt: -1 });

        const swapIds = swaps.map((swap) => swap._id);

        const chats = await Chat.find({ swap: { $in: swapIds } }).select("swap");

        const chatBySwapId = {};
        chats.forEach((chat) => {
            chatBySwapId[chat.swap.toString()] = chat._id;
        });

        const sessions = await Session.find({
            swap: { $in: swapIds },
            status: "Scheduled"
        }).sort({ createdAt: -1 });

        const sessionBySwapId = {};
        sessions.forEach((session) => {
            const key = session.swap.toString();
            if (!sessionBySwapId[key]) {
                sessionBySwapId[key] = session;
            }
        });

        const swapsWithChat = swaps.map((swap) => {
            const swapObj = swap.toObject();
            swapObj.chatId = chatBySwapId[swap._id.toString()] || null;
            swapObj.session = sessionBySwapId[swap._id.toString()] || null;
            return swapObj;
        });

        return res.status(200).json({
            success: true,
            count: swapsWithChat.length,
            swaps: swapsWithChat
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { findMatches, sendSwapRequest, acceptSwapRequest, rejectSwapRequest, cancelSwapRequest, completeSwap, getMySwaps };