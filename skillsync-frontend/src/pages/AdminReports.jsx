import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import api from "../services/api";
import "./AdminReports.css";

const TABS = ["Pending", "Reviewed", "Dismissed", "All"];

function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Pending");
    const [actingId, setActingId] = useState(null);

    const fetchReports = async () => {
        try {
            const response = await api.get("/admin/reports");
            setReports(response.data.reports);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusChange = async (reportId, status) => {
        setActingId(reportId);

        try {
            await api.patch(`/admin/reports/${reportId}/status`, { status });
            toast.success(`Report marked as ${status}.`);
            setReports((prev) =>
                prev.map((r) => (r._id === reportId ? { ...r, status } : r))
            );
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update report.");
        } finally {
            setActingId(null);
        }
    };

    const handleBlockUser = async (userId, name) => {
        try {
            await api.patch(`/admin/users/${userId}/block`);
            toast.success(`${name} has been blocked.`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to block user.");
        }
    };

    const visibleReports =
        activeTab === "All" ? reports : reports.filter((r) => r.status === activeTab);

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <main className="admin-reports-page"><p>Loading...</p></main>
            </>
        );
    }

    return (
        <>
            <AdminNavbar />

            <main className="admin-reports-page">
                <div className="admin-reports-container">

                    <h1>Reports</h1>

                    <div className="admin-tab-row">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`admin-tab ${activeTab === tab ? "admin-tab-active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab} {tab !== "All" && `(${reports.filter((r) => r.status === tab).length})`}
                            </button>
                        ))}
                    </div>

                    {visibleReports.length === 0 ? (
                        <p className="admin-empty-text">Nothing here.</p>
                    ) : (
                        <div className="admin-report-list">
                            {visibleReports.map((report) => (
                                <div className="admin-report-card" key={report._id}>

                                    <div className="admin-report-top">
                                        <span className={`admin-report-status status-${report.status.toLowerCase()}`}>
                                            {report.status}
                                        </span>
                                        <span className="admin-report-date">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="admin-report-line">
                                        <strong>{report.reporter?.name}</strong> reported{" "}
                                        <strong>{report.reportedUser?.name}</strong>
                                    </p>

                                    <p className="admin-report-reason">{report.reason}</p>
                                    <p className="admin-report-description">{report.description}</p>

                                    {report.swap?.status && (
                                        <p className="admin-report-swap">
                                            Related swap status: {report.swap.status}
                                        </p>
                                    )}

                                    <div className="admin-report-actions">
                                        {report.status === "Pending" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="admin-reject-button"
                                                    disabled={actingId === report._id}
                                                    onClick={() => handleStatusChange(report._id, "Dismissed")}
                                                >
                                                    Dismiss
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-approve-button"
                                                    disabled={actingId === report._id}
                                                    onClick={() => handleStatusChange(report._id, "Reviewed")}
                                                >
                                                    Mark Reviewed
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            className="admin-block-button"
                                            onClick={() => handleBlockUser(report.reportedUser._id, report.reportedUser.name)}
                                        >
                                            Block {report.reportedUser?.name}
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>
        </>
    );
}

export default AdminReports;