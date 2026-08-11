import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [health, setHealth] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [healthRes, analyticsRes, sessionsRes] = await Promise.all([
                    api.get("/admin/system-health"),
                    api.get("/admin/analytics"),
                    api.get("/admin/sessions/active"),
                ]);

                setHealth(healthRes.data);
                setAnalytics(analyticsRes.data);
                setActiveSessions(sessionsRes.data.activeSessions);

            } catch (error) {
                toast.error(error.response?.data?.message || "Unable to load dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <main className="admin-dashboard-page">
                    <p>Loading dashboard...</p>
                </main>
            </>
        );
    }

    const maxLearn = Math.max(1, ...analytics.topSkillsToLearn.map((s) => s.users));
    const maxTeach = Math.max(1, ...analytics.topSkillsToTeach.map((s) => s.users));

    return (
        <>
            <AdminNavbar />

            <main className="admin-dashboard-page">
                <div className="admin-dashboard-container">

                    <h1>Dashboard</h1>

                    <div className="admin-stat-grid">
                        <div className="admin-stat-card">
                            <span className="admin-stat-number">{health.totalUsers}</span>
                            <span className="admin-stat-label">Total Users</span>
                        </div>

                        <div className="admin-stat-card">
                            <span className="admin-stat-number">{health.totalSwaps}</span>
                            <span className="admin-stat-label">Total Swaps</span>
                        </div>

                        <div className="admin-stat-card">
                            <span className="admin-stat-number">{health.activeSessions}</span>
                            <span className="admin-stat-label">Live Sessions Now</span>
                        </div>

                        <div className="admin-stat-card admin-stat-card-alert">
                            <span className="admin-stat-number">{health.pendingReports}</span>
                            <span className="admin-stat-label">Pending Reports</span>
                        </div>
                    </div>

                    <div className="admin-status-row">
                        <span className="admin-status-badge admin-status-ok">
                            🟢 Server: {health.server}
                        </span>
                        <span className={`admin-status-badge ${health.database === "Connected" ? "admin-status-ok" : "admin-status-bad"}`}>
                            {health.database === "Connected" ? "🟢" : "🔴"} Database: {health.database}
                        </span>
                    </div>

                    <div className="admin-panel-grid">

                        <div className="admin-panel-card">
                            <h3>User Growth</h3>

                            <div className="admin-growth-row">
                                <div>
                                    <span className="admin-growth-number">{analytics.currentMonthUsers}</span>
                                    <span className="admin-growth-label">This month</span>
                                </div>
                                <div>
                                    <span className="admin-growth-number">{analytics.previousMonthUsers}</span>
                                    <span className="admin-growth-label">Last month</span>
                                </div>
                                <div>
                                    <span
                                        className={`admin-growth-number ${analytics.userGrowth >= 0 ? "admin-growth-positive" : "admin-growth-negative"}`}
                                    >
                                        {analytics.userGrowth >= 0 ? "+" : ""}{analytics.userGrowth}
                                        {analytics.growthPercentage !== null && ` (${analytics.growthPercentage}%)`}
                                    </span>
                                    <span className="admin-growth-label">Change</span>
                                </div>
                            </div>

                            <p className="admin-panel-subtext">
                                {analytics.matchesMade} total accepted swaps so far.
                            </p>
                        </div>

                        <div className="admin-panel-card">
                            <h3>Top Skills to Learn</h3>

                            {analytics.topSkillsToLearn.length === 0 ? (
                                <p className="admin-empty-text">No data yet.</p>
                            ) : (
                                <div className="admin-bar-list">
                                    {analytics.topSkillsToLearn.map((item) => (
                                        <div key={item.skill} className="admin-bar-row">
                                            <span className="admin-bar-label">{item.skill}</span>
                                            <div className="admin-bar-track">
                                                <div
                                                    className="admin-bar-fill"
                                                    style={{ width: `${(item.users / maxLearn) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="admin-bar-count">{item.users}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="admin-panel-card">
                            <h3>Top Skills to Teach</h3>

                            {analytics.topSkillsToTeach.length === 0 ? (
                                <p className="admin-empty-text">No data yet.</p>
                            ) : (
                                <div className="admin-bar-list">
                                    {analytics.topSkillsToTeach.map((item) => (
                                        <div key={item.skill} className="admin-bar-row">
                                            <span className="admin-bar-label">{item.skill}</span>
                                            <div className="admin-bar-track">
                                                <div
                                                    className="admin-bar-fill admin-bar-fill-secondary"
                                                    style={{ width: `${(item.users / maxTeach) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="admin-bar-count">{item.users}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="admin-panel-card admin-panel-card-wide">
                            <h3>Live Sessions Right Now</h3>

                            {activeSessions.length === 0 ? (
                                <p className="admin-empty-text">No sessions in progress right now.</p>
                            ) : (
                                <ul className="admin-session-list">
                                    {activeSessions.map((session) => (
                                        <li key={session._id} className="admin-session-item">
                                            <span>
                                                <strong>{session.user1?.name}</strong> ↔ <strong>{session.user2?.name}</strong>
                                            </span>
                                            <span className="admin-session-time">
                                                {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                {" – "}
                                                {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>

                </div>
            </main>
        </>
    );
}

export default AdminDashboard;