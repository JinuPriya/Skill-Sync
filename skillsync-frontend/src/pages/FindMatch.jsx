import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./FindMatch.css";

function FindMatch() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which card currently has its "request swap" form open
  const [requestingId, setRequestingId] = useState(null);
  const [skillOffered, setSkillOffered] = useState("");
  const [skillRequested, setSkillRequested] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMatches = async () => {
    try {
      const response = await api.get("/swap/find-matches");
      setMatches(response.data.matches || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const openRequestForm = (match) => {
    setRequestingId(match._id);
    setSkillOffered(match.youTeachTheyWant[0] || "");
    setSkillRequested(match.theyTeachYouWant[0] || "");
    setMessage("");
  };

  const closeRequestForm = () => {
    setRequestingId(null);
  };

  const handleSendRequest = async (receiverId) => {
    if (!skillOffered || !skillRequested) {
      toast.error("Please select a skill to offer and a skill to request.");
      return;
    }

    setSending(true);

    try {
      await api.post("/swap/send-swap-request", {
        receiver: receiverId,
        skillOffered,
        skillRequested,
        message,
      });

      toast.success("Swap request sent!");
      closeRequestForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send request.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="find-match-page">
          <p className="loading-text">Finding your matches...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="find-match-page">
        <div className="find-match-container">
          <h1>Find Your Match</h1>
          <p className="page-subtext">
            People whose skills complete yours — matched on what you teach
            and what you want to learn.
          </p>

          {matches.length === 0 ? (
            <div className="empty-state">
              <p>No matches yet.</p>
              <p className="empty-state-hint">
                Add more skills to teach and learn on your{" "}
                <Link to="/profile">profile</Link> to find people to swap
                with.
              </p>
            </div>
          ) : (
            <div className="match-grid">
              {matches.map((match) => (
                <div className="match-card" key={match._id}>
                  <div className="match-header">
                    <div className="match-avatar">👤</div>

                    <div className="match-identity">
                      <h3>{match.name}</h3>

                      <div className="match-meta">
                        <span className="match-rating">
                          ⭐{" "}
                          {match.averageRating
                            ? match.averageRating.toFixed(1)
                            : "New"}
                        </span>
                        <span className="match-dot">•</span>
                        <span>{match.totalSwaps} swaps</span>

                        {match.verifiedTeacher && (
                          <span className="verified-pill">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="match-skills">
                    <span className="match-skills-label">Teaches</span>
                    <div className="match-skill-tags">
                      {match.theyTeachYouWant.map((skill) => (
                        <span className="match-skill-tag" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`availability-indicator ${
                      match.availabilityMatch
                        ? "availability-yes"
                        : "availability-no"
                    }`}
                  >
                    <span className="availability-dot" aria-hidden="true" />
                    <div>
                      <p className="availability-title">
                        {match.availabilityMatch
                          ? "Availability matches yours"
                          : "Availability doesn't match"}
                      </p>
                      <p className="availability-detail">
                        {match.availabilityMatch
                          ? `${match.overlappingSlots} overlapping time slot${
                              match.overlappingSlots > 1 ? "s" : ""
                            }`
                          : "No overlapping slots"}
                      </p>
                    </div>
                  </div>

                  <div className="match-actions">
                    <Link
                      to={`/profile/${match._id}`}
                      className="secondary-button"
                    >
                      View Profile
                    </Link>

                    <button
                      type="button"
                      className="auth-button match-request-button"
                      onClick={() =>
                        requestingId === match._id
                          ? closeRequestForm()
                          : openRequestForm(match)
                      }
                    >
                      {requestingId === match._id ? "Cancel" : "Request Swap"}
                    </button>
                  </div>

                  {requestingId === match._id && (
                    <div className="request-form">
                      <div className="request-form-row">
                        <label>You offer</label>
                        <select
                          value={skillOffered}
                          onChange={(e) => setSkillOffered(e.target.value)}
                        >
                          <option value="">Select a skill</option>
                          {match.youTeachTheyWant.map((skill) => (
                            <option key={skill} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="request-form-row">
                        <label>You want</label>
                        <select
                          value={skillRequested}
                          onChange={(e) => setSkillRequested(e.target.value)}
                        >
                          <option value="">Select a skill</option>
                          {match.theyTeachYouWant.map((skill) => (
                            <option key={skill} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        placeholder="Add a short message (optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                      />

                      <button
                        type="button"
                        className="auth-button"
                        disabled={sending}
                        onClick={() => handleSendRequest(match._id)}
                      >
                        {sending ? "Sending..." : "Send Request"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default FindMatch;