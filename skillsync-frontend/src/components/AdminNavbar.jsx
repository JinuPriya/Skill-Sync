import { Link, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="admin-nav">
            <div className="admin-nav-left">
                <span className="admin-nav-logo">SkillSync Admin</span>
                <Link to="/admin" className="admin-nav-tab">Dashboard</Link>
                <Link to="/admin/certificates" className="admin-nav-tab">Certificates</Link>
                <Link to="/admin/reports" className="admin-nav-tab">Reports</Link>
                <Link to="/admin/users" className="admin-nav-tab">Users</Link>
            </div>

            <div className="admin-nav-right">
                <Link to="/dashboard" className="admin-nav-exit">
                    Exit Admin
                </Link>
                <button className="admin-nav-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default AdminNavbar;