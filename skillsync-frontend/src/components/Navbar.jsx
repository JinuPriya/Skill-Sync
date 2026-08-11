import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = storedUser?.role === "admin";

  const closeMenu = () => setIsOpen(false);

  // Always collapse the mobile menu whenever a new page opens.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenu();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <img src="/favicon.svg" alt="" className="navbar-logo-icon" />
        SkillSync
      </Link>

      <button
        className={`navbar-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${isOpen ? "open" : ""}`}>

        {!token ? (
          <>
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        ) : (
          <>
            <Link to="/find-match" onClick={closeMenu}>Find Your Match</Link>
            <Link to="/swaps" onClick={closeMenu}>My Swaps</Link>
            <Link to="/chat" onClick={closeMenu}>Chat</Link>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
            {isAdmin && (
              <Link to="/admin" onClick={closeMenu} className="admin-nav-link">
                Admin
              </Link>
            )}

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;