import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import api from "../services/api";
import "./AdminCertificates.css";

function AdminCertificates() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState(null);

    const fetchPending = async () => {
        try {
            const response = await api.get("/admin/certificates/pending");
            setPending(response.data.pending);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load certificates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleDecision = async (item, status) => {
        setActingId(item.skillId);

        try {
            await api.patch(`/admin/users/${item.userId}/skills/${item.skillId}/verify`, { status });
            toast.success(`${item.skill} marked as ${status}.`);
            setPending((prev) => prev.filter((p) => p.skillId !== item.skillId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update skill.");
        } finally {
            setActingId(null);
        }
    };

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <main className="admin-certs-page"><p>Loading...</p></main>
            </>
        );
    }

    return (
        <>
            <AdminNavbar />

            <main className="admin-certs-page">
                <div className="admin-certs-container">

                    <h1>Pending Certificates</h1>
                    <p className="admin-page-subtitle">
                        {pending.length} skill{pending.length !== 1 ? "s" : ""} awaiting review.
                    </p>

                    {pending.length === 0 ? (
                        <p className="admin-empty-text">Nothing pending — you're all caught up.</p>
                    ) : (
                        <div className="admin-cert-grid">
                            {pending.map((item) => (
                                <div className="admin-cert-card" key={item.skillId}>

                                    <div className="admin-cert-header">
                                        <div>
                                            <h3>{item.skill}</h3>
                                            <p className="admin-cert-meta">
                                                {item.userName} · {item.userEmail}
                                            </p>
                                        </div>
                                        <span className="admin-cert-level">{item.experienceLevel}</span>
                                    </div>

                                    {item.certificate ? (
                                        
                                        <a    href={`http://localhost:3003${item.certificate}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="admin-cert-link"
                                        >
                                            📄 View certificate
                                        </a>
                                    ) : (
                                        <p className="admin-cert-none">No certificate attached.</p>
                                    )}

                                    <div className="admin-cert-actions">
                                        <button
                                            type="button"
                                            className="admin-reject-button"
                                            disabled={actingId === item.skillId}
                                            onClick={() => handleDecision(item, "Rejected")}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-approve-button"
                                            disabled={actingId === item.skillId}
                                            onClick={() => handleDecision(item, "Verified")}
                                        >
                                            Approve
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

export default AdminCertificates;