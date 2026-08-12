const express = require("express")
const morgan = require("morgan")
const cors = require("cors");
const authRoutes = require("./routes/auth.routes.js");
const profileRoutes = require("./routes/profile.routes.js")
const swapRoutes = require("./routes/swap.routes.js")
const reviewRoutes = require("./routes/review.routes.js")
const chatRoutes = require("./routes/chat.routes.js")
const sessionRoutes = require("./routes/session.routes.js")
const reportRoutes = require("./routes/report.routes.js")
const adminRoutes = require("./routes/admin.routes.js")
const googleRoutes = require("./routes/google.routes");
const {notFound, errorHandler} = require("./middleware/error.handler.js")

const app = express()

app.use(express.json())
app.use(morgan("dev"))
app.use(cors({
    origin: ["http://localhost:5173", "https://skill-sync-2cpceu1wu-jinupriyabagga2007-8430s-projects.vercel.app"],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("SkillSync API is running")
})

app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/swap", swapRoutes)
app.use("/api/review", reviewRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/session", sessionRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/google", googleRoutes);
app.use("/uploads", express.static("public/uploads"));

app.use(notFound)
app.use(errorHandler)

module.exports = app;