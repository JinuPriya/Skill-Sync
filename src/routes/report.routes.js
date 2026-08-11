const express = require("express")
const router = express.Router()

const { createReport, getMyReports, getReportById } = require("../controller/report.controller")

const { protect } = require("../middleware/auth.middleware")

router.use(protect)

router.post("/", createReport)
router.get("/my", getMyReports)
router.get("/:id", getReportById)

module.exports = router