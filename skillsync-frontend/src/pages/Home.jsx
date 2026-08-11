import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomeNavbar from "../components/HomeNavbar";
import heroImage from "../assets/hero-image.png";
import "./Home.css";

function SwapGlyph({ size = 100, className = "" }) {
  return (
    <svg
      className={`swap-glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <line x1="15" y1="36" x2="78" y2="36" className="swap-line swap-line-a" />
      <polygon points="78,26 95,36 78,46" className="swap-line-a" />

      <line x1="85" y1="64" x2="22" y2="64" className="swap-line swap-line-b" />
      <polygon points="22,54 5,64 22,74" className="swap-line-b" />
    </svg>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Build your profile",
    text: "Add the skills you can teach and the ones you want to learn.",
  },
  {
    n: "02",
    title: "Get matched",
    text: "SkillSync surfaces people whose skills complete yours.",
  },
  {
    n: "03",
    title: "Propose a swap",
    text: "Offer to trade — you teach something, they teach back.",
  },
  {
    n: "04",
    title: "Chat & schedule",
    text: "Work out the details and pick a time that fits you both.",
  },
  {
    n: "05",
    title: "Learn together",
    text: "Meet, teach, learn — then rate how it went.",
  },
];

const SKILLS = [
  { emoji: "💻", label: "Web Development" },
  { emoji: "🎨", label: "UI/UX Design" },
  { emoji: "⚙️", label: "C++" },
  { emoji: "🍰", label: "Baking" },
  { emoji: "📸", label: "Photography" },
  { emoji: "🎵", label: "Music" },
];

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="home-page">
      {token ? <Navbar /> : <HomeNavbar />}

      {/* HERO */}
      <section className="hero-outer">
        <div className="hero">
          <div className="hero-content">
            <p className="eyebrow">No tuition. No subscriptions. Just people.</p>

            <h1 className="hero-title">
              Exchange Skills.
              <br />
              Build Futures.
            </h1>

            <p className="hero-subtitle">
              Teach what you know. Learn what you don't. SkillSync connects
              people who trade skills directly, one swap at a time.
            </p>

            <Link to="/register" className="cta-button cta-primary">
              Get Started for Free
            </Link>
          </div>

          <div className="hero-visual">
            <img
              src={heroImage}
              alt="People exchanging skills on SkillSync"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">How SkillSync Works</h2>

        <div className="steps-track">
          {STEPS.map((step, index) => (
            <div className="step" key={step.n}>
              <span className="step-number">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>

              {index < STEPS.length - 1 && (
                <span className="step-connector" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ONE PLATFORM. TWO ROLES */}
      <section className="roles-section" id="roles">
        <h2 className="section-title">One Platform. Two Roles.</h2>

        <div className="roles-grid">
          <div className="role-card">
            <h3>Learner</h3>
            <p className="role-tagline">
              Learn something new without spending a rupee.
            </p>
            <ul>
              <li>Browse people teaching what you want to learn</li>
              <li>Message and schedule sessions directly</li>
              <li>Track every swap from request to complete</li>
            </ul>
          </div>

          <div className="role-divider">
            <SwapGlyph size={72} />
          </div>

          <div className="role-card">
            <h3>Teacher</h3>
            <p className="role-tagline">
              Turn what you already know into someone else's next skill.
            </p>
            <ul>
              <li>List the skills you can teach</li>
              <li>Get verified with an uploaded certificate</li>
              <li>Build your rating with every swap</li>
            </ul>
          </div>
        </div>
      </section>

      {/* POPULAR SKILLS */}
      <section className="skills-section" id="skills">
        <h2 className="section-title">Popular Skills</h2>

        <div className="skills-grid">
          {SKILLS.map((skill) => (
            <div className="skill-tile" key={skill.label}>
              <span className="skill-emoji">{skill.emoji}</span>
              <span>{skill.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>
          Your next skill could be
          <br />
          one conversation away.
        </h2>

        <Link to="/register" className="cta-button cta-primary">
          Get Started for Free →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <span className="footer-logo">SkillSync</span>
        <p>Built by learners, for learners.</p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} SkillSync
        </p>
      </footer>
    </div>
  );
}

export default Home;