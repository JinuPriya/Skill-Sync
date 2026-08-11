const Report = require("../model/report.model")
const Swap = require("../model/swap.model")

const createReport = async (req, res, next) => {
    try {
        const { swapId, reason, description } = req.body

        if (!swapId || !reason || !description) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            })
        }

        const swap = await Swap.findById(swapId)

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: "Swap not found."
            })
        }

        if (swap.status !== "Accepted" && swap.status !== "Completed") {
            return res.status(400).json({
                success: false,
                message: "You can only report an accepted or completed swap."
            })
        }

        const isParticipant = swap.requester.toString() === req.user._id.toString() || swap.receiver.toString() === req.user._id.toString()
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant of this swap."
            })
        }

        const reportedUser = swap.requester.toString() === req.user._id.toString()
            ? swap.receiver : swap.requester

        const existingReport = await Report.findOne({
            reporter: req.user._id,
            swap: swapId
        })

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this swap."
            })
        }

        const report = await Report.create({
            reporter: req.user._id,
            reportedUser,
            swap: swapId,
            reason,
            description
        })

        res.status(201).json({
            success: true,
            message: "Report submitted successfully."
        })
    } catch (error) {
        next(error)
    }
}

const getMyReports = async (req, res, next) => {
    try {
        const reports = await Report.find({
            reporter: req.user._id
        }).populate("reportedUser", "name email")
            .populate("swap")

        res.status(200).json({
            success: true,
            count: reports.length,
            reports
        })

    } catch (error) {
        next(error)
    }
}

const getReportById = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("reportedUser", "name email")
            .populate("swap")

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            })
        }

        if (report.reporter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            })
        }

        res.status(200).json({
            success: true,
            report,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { createReport, getMyReports, getReportById }