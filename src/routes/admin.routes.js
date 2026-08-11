const express = require("express");
const router = express.Router();

const {
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
} = require("../controller/admin.controller");

const {
    protect,
    authorize,
} = require("../middleware/auth.middleware");

router.use(protect);
router.use(authorize("admin"));

// Reports
router.get("/reports", getAllReports);
router.get("/reports/:userId", getUserReports);
router.patch("/reports/:reportId/status", updateReportStatus);

// Certificates
router.get("/certificates/pending", getPendingCertificates);
router.patch("/users/:userId/skills/:skillId/verify", verifySkill);

// User Management
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);

// Active Sessions
router.get("/sessions/active", getActiveSessions);

// System Health
router.get("/system-health", getSystemHealth);

// Analytics Dashboard
router.get("/analytics", getAnalyticsDashboard);

module.exports = router;