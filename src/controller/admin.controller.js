const mongoose = require("mongoose")
const Report = require("../model/report.model")
const Session = require("../model/session.model")
const Swap = require("../model/swap.model")
const User = require("../model/user.model")

const getAllReports = async (req, res, next) => {
    try {
        const reports = await Report.find()
            .populate("reporter", "name email")
            .populate("reportedUser", "name email")
            .populate("swap", "status")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            reports,
        })
    } catch (error) {
        next(error)
    }
}

const getUserReports = async (req, res, next) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const reports = await Report.find({
            reportedUser: userId
        }).populate("reporter", "name email")
            .populate("swap", "status")

        res.status(200).json({
            success: true,
            totalReports: reports.length,
            reports
        })
    } catch (error) {
        next(error)
    }
}


const blockUser = async (req, res, next) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Admin accounts cannot be blocked."
            });
        }

        if (user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "User is already blocked."
            });
        }

        user.isBlocked = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User blocked successfully"
        })
    } catch (error) {
        next(error)
    }
}

const unblockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "User is already unblocked."
            });
        }

        user.isBlocked = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User unblocked successfully"
        })
    } catch (error) {
        next(error)
    }
}

const getActiveSessions = async (req, res, next) => {
    try {
        const now = new Date();

        const activeSessions = await Session.find({
            status: "Scheduled",
            startTime: { $lte: now },
            endTime: { $gte: now },
        })
            .populate("user1", "name email")
            .populate("user2", "name email")
            .sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            activeSessions
        })
    } catch (error) {
        next(error)
    }
}

const getSystemHealth = async (req, res, next) => {
    try {
        const now = new Date();

        const totalUsers = await User.countDocuments();

        const totalSwaps = await Swap.countDocuments();

        const activeSessions = await Session.countDocuments({
            status: "Scheduled",
            startTime: { $lte: now },
            endTime: { $gte: now },
        });

        const pendingReports = await Report.countDocuments({
            status: "Pending",
        });

        res.status(200).json({
            success: true,
            server: "Running",
            database:
                mongoose.connection.readyState === 1
                    ? "Connected"
                    : "Disconnected",
            totalUsers,
            totalSwaps,
            activeSessions,
            pendingReports,
        });
    } catch (error) {
        next(error);
    }
}

const getAnalyticsDashboard = async (req, res, next) => {
    try {
        const matchesMade = await Swap.countDocuments({
            status: "Accepted"
        })

        const topSkillsToLearn = await User.aggregate([
            {
                $unwind: "$skillsToLearn",
            },
            {
                $group: {
                    _id: "$skillsToLearn",
                    users: {
                        $sum: 1
                    },
                }
            },
            {
                $sort: {
                    users: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    skill: "$_id",
                    users: 1,
                }
            }
        ])

        const topSkillsToTeach = await User.aggregate([
            {
                $unwind: "$skillsToTeach",
            },
            {
                $group: {
                    _id: "$skillsToTeach.skill",
                    users: {
                        $sum: 1
                    },
                }
            },
            {
                $sort: {
                    users: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0, //removes id field
                    skill: "$_id", //renames id to skill
                    users: 1, //keeps user field
                }
            }
        ])


        const now = new Date();

        const currentMonthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const previousMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );

        const previousMonthEnd = currentMonthStart;

        const [currentMonthUsers, previousMonthUsers] = await Promise.all([
            User.countDocuments({
                createdAt: {
                    $gte: currentMonthStart,
                },
            }),
            User.countDocuments({
                createdAt: {
                    $gte: previousMonthStart,
                    $lt: previousMonthEnd,
                },
            }),
        ]);

        const userGrowth = currentMonthUsers - previousMonthUsers;

        const growthPercentage =
            previousMonthUsers === 0
                ? null
                : Number(
                    (
                        (userGrowth / previousMonthUsers) * 100
                    ).toFixed(2)
                );

        res.status(200).json({
            success: true,
            matchesMade,
            topSkillsToLearn,
            topSkillsToTeach,
            previousMonthUsers,
            currentMonthUsers,
            userGrowth,
            growthPercentage,
        });
    } catch (error) {
        next(error)
    }
}

const getPendingCertificates = async (req, res, next) => {
    try {
        const users = await User.aggregate([
            {
                $unwind: "$skillsToTeach"
            },
            {
                $match: {
                    "skillsToTeach.verificationStatus": "Pending",
                    "skillsToTeach.certificate": {
                        $exists: true,
                        $nin: [null, ""]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    email: { $first: "$email" },
                    skillsToTeach: { $push: "$skillsToTeach" }
                }
            }
        ]);

        const pending = [];

        users.forEach((user) => {
            user.skillsToTeach.forEach((skill) => {
                if (skill.verificationStatus === "Pending") {
                    pending.push({
                        userId: user._id,
                        userName: user.name,
                        userEmail: user.email,
                        skillId: skill._id,
                        skill: skill.skill,
                        experienceLevel: skill.experienceLevel,
                        certificate: skill.certificate,
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            totalPending: pending.length,
            pending
        });
    } catch (error) {
        next(error);
    }
};

const verifySkill = async (req, res, next) => {
    try {
        const { userId, skillId } = req.params;
        const { status } = req.body;

        if (!["Verified", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'Verified' or 'Rejected'."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const skill = user.skillsToTeach.id(skillId);

        if (!skill) {
            return res.status(404).json({ success: false, message: "Skill not found" });
        }

        skill.verificationStatus = status;
        skill.isVerified = status === "Verified";

        await user.save();

        res.status(200).json({
            success: true,
            message: `Skill marked as ${status}.`,
            skill
        });
    } catch (error) {
        next(error);
    }
};

const updateReportStatus = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        if (!["Reviewed", "Dismissed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'Reviewed' or 'Dismissed'."
            });
        }

        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        report.status = status;
        report.reviewedAt = new Date();
        await report.save();

        res.status(200).json({
            success: true,
            message: `Report marked as ${status}.`,
            report
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("name email role isBlocked totalSwaps verifiedTeacher createdAt")
            .sort({ createdAt: -1 });

        const reportCounts = await Report.aggregate([
            {
                $group: {
                    _id: "$reportedUser",
                    count: { $sum: 1 }
                }
            }
        ]);

        const countsByUserId = {};
        reportCounts.forEach((item) => {
            countsByUserId[item._id.toString()] = item.count;
        });

        const usersWithReports = users.map((user) => {
            const userObj = user.toObject();
            userObj.reportCount = countsByUserId[user._id.toString()] || 0;
            return userObj;
        });

        res.status(200).json({
            success: true,
            totalUsers: users.length,
            users: usersWithReports
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllReports,
    getUserReports,
    blockUser,
    unblockUser,
    getActiveSessions,
    getSystemHealth,
    getAnalyticsDashboard,
    getPendingCertificates,
    verifySkill,
    updateReportStatus,
    getAllUsers,
}