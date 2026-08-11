import { Link } from "react-router-dom";
import "./HomeNavbar.css";

function HomeNavbar() {
    return (
        <nav className="home-nav">
            <Link to="/" className="home-nav-logo">
                SkillSync
            </Link>

            <div className="home-nav-right">
                <div className="home-nav-links">
                    <a href="#how-it-works">How it Works</a>
                    <a href="#roles">Roles</a>
                    <a href="#skills">Popular Skills</a>
                </div>

                <div className="home-nav-auth-buttons">
                    <Link to="/login" className="home-nav-login-link">
                        Login
                    </Link>

                    <Link to="/register" className="home-nav-get-started-btn">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default HomeNavbar;