import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminNavbar from "../components/AdminNavbar";
import api from "../services/api";
import "./AdminUsers.css";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actingId, setActingId] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get("/admin/users");
            setUsers(response.data.users);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleBlock = async (user) => {
        setActingId(user._id);

        try {
            const endpoint = user.isBlocked ? "unblock" : "block";
            await api.patch(`/admin/users/${user._id}/${endpoint}`);

            toast.success(`${user.name} ${user.isBlocked ? "unblocked" : "blocked"}.`);

            setUsers((prev) =>
                prev.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u))
            );

        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update user.");
        } finally {
            setActingId(null);
        }
    };

    const visibleUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <main className="admin-users-page"><p>Loading...</p></main>
            </>
        );
    }

    return (
        <>
            <AdminNavbar />

            <main className="admin-users-page">
                <div className="admin-users-container">

                    <h1>Users</h1>
                    <p className="admin-page-subtitle">{users.length} total users</p>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="admin-users-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="admin-users-table">
                        <div className="admin-users-row admin-users-header">
                            <span>Name</span>
                            <span>Email</span>
                            <span>Swaps</span>
                            <span>Reports</span>
                            <span>Status</span>
                            <span></span>
                        </div>

                        {visibleUsers.map((user) => (
                            <div className="admin-users-row" key={user._id}>
                                <span>{user.name}</span>
                                <span className="admin-users-email">{user.email}</span>
                                <span>{user.totalSwaps}</span>
                                <span>
                                    {user.reportCount > 0 ? (
                                        <span className={`admin-report-count ${user.reportCount >= 3 ? "admin-report-count-high" : ""}`}>
                                            {user.reportCount}
                                        </span>
                                    ) : (
                                        "—"
                                    )}
                                </span>
                                <span>
                                    {user.isBlocked ? (
                                        <span className="admin-blocked-badge">Blocked</span>
                                    ) : (
                                        <span className="admin-active-badge">Active</span>
                                    )}
                                </span>
                                <span>
                                    {user.role !== "admin" && (
                                        <button
                                            type="button"
                                            className={user.isBlocked ? "admin-approve-button" : "admin-block-button"}
                                            disabled={actingId === user._id}
                                            onClick={() => toggleBlock(user)}
                                        >
                                            {user.isBlocked ? "Unblock" : "Block"}
                                        </button>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </>
    );
}

export default AdminUsers;