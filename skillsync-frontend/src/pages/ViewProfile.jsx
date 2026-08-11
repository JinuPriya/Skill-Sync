import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Profile.css";
import "./ViewProfile.css";

function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [skillOffered, setSkillOffered] = useState("");
  const [skillRequested, setSkillRequested] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [profileRes, myProfileRes] = await Promise.all([
        api.get(`/profile/${id}`),
        api.get("/profile"),
      ]);

      setProfile(profileRes.data.profile);
      setMyProfile(myProfileRes.data.profile);

      const reviewsRes = await api.get(`/review/user/${id}`);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load profile.");
      navigate("/find-match");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !profile || !myProfile) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <p>Loading profile...</p>
        </main>
      </>
    );
  }

  const theirTeachSkills = profile.skillsToTeach.map((item) => item.skill);
  const myTeachSkills = myProfile.skillsToTeach.map((item) => item.skill);

  // Skills they teach that I want to learn
  const canRequestFrom = theirTeachSkills.filter((skill) =>
    myProfile.skillsToLearn.includes(skill)
  );

  // Skills I teach that they want to learn
  const canOfferTo = myTeachSkills.filter((skill) =>
    profile.skillsToLearn.includes(skill)
  );

  const canSwap = canRequestFrom.length > 0 && canOfferTo.length > 0;
  const isOwnProfile = myProfile._id === profile._id;

  const openRequestForm = () => {
    setSkillOffered(canOfferTo[0] || "");
    setSkillRequested(canRequestFrom[0] || "");
    setShowRequestForm(true);
  };

  const handleSendRequest = async () => {
    if (!skillOffered || !skillRequested) {
      toast.error("Please select a skill to offer and a skill to request.");
      return;
    }

    setSending(true);

    try {
      await api.post("/swap/send-swap-request", {
        receiver: profile._id,
        skillOffered,
        skillRequested,
        message,
      });

      toast.success("Swap request sent!");
      setShowRequestForm(false);
      setMessage("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">
          <Link to="/find-match" className="back-link">
            ← Back to matches
          </Link>

          <h1>{profile.name}'s Profile</h1>

          <div className="profile-card">
            <h2>{profile.name}</h2>

            <div className="profile-stats">
              <div className="stat-box">
                <span className="stat-number">{profile.totalSwaps || 0}</span>
                <span className="stat-label">Total Swaps</span>
              </div>

              <div className="stat-box">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= Math.round(profile.averageRating || 0)
                          ? "star star-filled"
                          : "star"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="stat-label">
                  {profile.averageRating
                    ? profile.averageRating.toFixed(1)
                    : "No ratings yet"}
                </span>
              </div>
            </div>

            {profile.verifiedTeacher && (
              <div className="verified-teacher-badge">🏅 Verified Teacher</div>
            )}

            {!isOwnProfile && (
              <div className="view-profile-cta">
                {canSwap ? (
                  !showRequestForm && (
                    <button
                      type="button"
                      className="auth-button"
                      onClick={openRequestForm}
                    >
                      Request Swap
                    </button>
                  )
                ) : (
                  <p className="empty-text">
                    No overlapping skills to swap with {profile.name} right
                    now.
                  </p>
                )}
              </div>
            )}

            {showRequestForm && (
              <div className="request-form">
                <div className="request-form-row">
                  <label>You offer</label>
                  <select
                    value={skillOffered}
                    onChange={(e) => setSkillOffered(e.target.value)}
                  >
                    {canOfferTo.map((skill) => (
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
                    {canRequestFrom.map((skill) => (
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

                <div className="request-form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="auth-button"
                    disabled={sending}
                    onClick={handleSendRequest}
                  >
                    {sending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="profile-card">
            <h3>Reviews</h3>

            {reviews.length > 0 ? (
              <ul className="review-list">
                {reviews.map((review) => (
                  <li key={review._id} className="review-item">
                    <div className="review-header">
                      <strong>{review.reviewer?.name || "Anonymous"}</strong>

                      <div className="star-rating star-rating-small">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= review.rating
                                ? "star star-filled"
                                : "star"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}

                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No reviews yet.</p>
            )}
          </div>

          <div className="profile-card">
            <h3>Skills {profile.name} Teaches</h3>

            {profile.skillsToTeach.length > 0 ? (
              <ul className="skill-list">
                {profile.skillsToTeach.map((item, index) => {
                  const levelPercent =
                    {
                      Beginner: 25,
                      Intermediate: 50,
                      Advanced: 75,
                      Expert: 100,
                    }[item.experienceLevel] || 0;

                  return (
                    <li key={index} className="skill-item">
                      <div className="skill-item-header">
                        <strong>{item.skill}</strong>
                        <span
                          className={`status-badge status-${item.verificationStatus.toLowerCase()}`}
                        >
                          {item.verificationStatus}
                        </span>
                      </div>

                      <div className="experience-bar-track">
                        <div
                          className="experience-bar-fill"
                          style={{ width: `${levelPercent}%` }}
                        ></div>
                      </div>

                      <span className="experience-label">
                        {item.experienceLevel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty-text">No skills listed yet.</p>
            )}
          </div>

          <div className="profile-card">
            <h3>Skills {profile.name} Wants to Learn</h3>

            {profile.skillsToLearn.length > 0 ? (
              <ul className="skill-list">
                {profile.skillsToLearn.map((skill, index) => (
                  <li key={index} className="skill-item skill-item-simple">
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No skills listed yet.</p>
            )}
          </div>

          <div className="profile-card">
            <h3>Availability</h3>
            <p className="card-subtext">
              Shown in {profile.name}'s timezone ({profile.timezone || "not set"}
              ).
            </p>

            {profile.availabilitySlots?.length > 0 ? (
              <ul className="skill-list">
                {profile.availabilitySlots.map((slot, index) => (
                  <li key={index} className="skill-item skill-item-simple">
                    <span>
                      {slot.startDay} {slot.startTime} → {slot.endDay}{" "}
                      {slot.endTime}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No availability slots added yet.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default ViewProfile;