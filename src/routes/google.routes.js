const express = require("express");

const {googleAuth, googleCallback} = require("../controller/google.controller");

const router = express.Router();

router.get("/auth", googleAuth);
router.get("/callback", googleCallback);

module.exports = router;