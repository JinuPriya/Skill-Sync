import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Profile.css";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    // Skills to learn
    const [learnInput, setLearnInput] = useState("");

    // Skills to teach
    const [teachSkill, setTeachSkill] = useState("");
    const [teachLevel, setTeachLevel] = useState("Beginner");
    const [certificateFile, setCertificateFile] = useState(null)

    // Timezone
    const [timezone, setTimezone] = useState("");

    //Availability Slots
    const [startDay, setStartDay] = useState("Monday")
    const [startTime, setStartTime] = useState("09:00")
    const [endDay, setEndDay] = useState("Monday")
    const [endTime, setEndTime] = useState("10:00")

    const DAYS = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ]


    const fetchProfile = async () => {
        try {
            const response = await api.get("/profile");
            const fetchedProfile = response.data.profile;

            setProfile(fetchedProfile);
            setTimezone(fetchedProfile.timezone || "");

            fetchReviews(fetchedProfile._id);

        } catch (error) {
            const message =
                error.response?.data?.message || "Unable to load profile.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (userId) => {
        try {
            const response = await api.get(`/review/user/${userId}`);
            setReviews(response.data.reviews);
        } catch (error) {
            // Not showing a toast here — a failed review fetch
            // shouldn't block the rest of the profile from displaying.
            console.error("Unable to load reviews:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("google") === "connected") {
            toast.success("Google Calendar connected!");
            window.history.replaceState({}, "", "/profile");
        } else if (params.get("google") === "error") {
            toast.error("Unable to connect Google Calendar. Please try again.");
            window.history.replaceState({}, "", "/profile");
        }
    }, []);

    //Skills to Learn

    const handleAddLearnSkill = async () => {
        if (!learnInput.trim()) {
            toast.error("Please type a skill first.");
            return;
        }

        const updatedList = [...(profile.skillsToLearn || []), learnInput.trim()];

        try {
            await api.put("/profile", { skillsToLearn: updatedList });
            toast.success("Skill added!");
            setLearnInput("");
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add skill.");
        }
    };

    const handleRemoveLearnSkill = async (skillToRemove) => {
        const updatedList = profile.skillsToLearn.filter(
            (s) => s !== skillToRemove
        );

        try {
            await api.put("/profile", { skillsToLearn: updatedList });
            toast.success("Skill removed.");
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove skill.");
        }
    };

    //Skills to Teach 

    const handleAddTeachSkill = async () => {
        if (!teachSkill.trim()) {
            toast.error("Please type a skill first.");
            return;
        }

        const formData = new FormData();
        formData.append("skill", teachSkill.trim());
        formData.append("experienceLevel", teachLevel);

        if (certificateFile) {
            formData.append("certificate", certificateFile);
        }

        try {
            await api.post("/profile/skills-to-teach", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Skill added! Pending verification.");
            setTeachSkill("");
            setTeachLevel("Beginner");
            setCertificateFile(null);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add skill.");
        }
    };
    const handleRemoveTeachSkill = async (indexToRemove) => {
        const updatedList = profile.skillsToTeach.filter(
            (_, index) => index !== indexToRemove
        );

        try {
            await api.put("/profile", { skillsToTeach: updatedList });
            toast.success("Skill removed.");
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove skill.");
        }
    };

    //Timezone

    const handleSaveTimezone = async () => {
        try {
            await api.put("/profile", { timezone });
            toast.success("Timezone updated!");
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update timezone.");
        }
    };

    //Availability Slots
    const handleAddSlot = async () => {
        if (!profile?.timezone) {
            toast.error("Please set your timezone fisrt.")
            return;
        }

        const newSlot = { startDay, startTime, endDay, endTime }

        const updatedSlots = [...(profile.availabilitySlots || []), newSlot]

        try {
            await api.put("/profile", { availabilitySlots: updatedSlots });
            toast.success("Availability slot added!");
            fetchProfile();
        } catch (error) {
            toast.error(error.reponse?.data?.message || "Unable to add slot.")
        }
    }

    const handleRemoveSlot = async (indexToRemove) => {
        const updatedSlots = profile.availabilitySlots.filter(
            (_, index) => index !== indexToRemove
        )

        try {
            await api.put("/profile", { availabilitySlots: updatedSlots });
            toast.success("Slot removed.");
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to remove slot.")
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="profile-page">
                    <p>Loading profile...</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="profile-page">
                <div className="profile-container">

                    <h1>My Profile</h1>

                    {/* Basic info + stats */}
                    <div className="profile-card">
                        <h2>{profile?.name}</h2>
                        <p className="profile-email">{profile?.email}</p>

                        <div className="profile-stats">
                            <div className="stat-box">
                                <span className="stat-number">{profile?.totalSwaps || 0}</span>
                                <span className="stat-label">Total Swaps</span>
                            </div>

                            <div className="stat-box">
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={
                                                star <= Math.round(profile?.averageRating || 0)
                                                    ? "star star-filled"
                                                    : "star"
                                            }
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="stat-label">
                                    {profile?.averageRating
                                        ? profile.averageRating.toFixed(1)
                                        : "No ratings yet"}
                                </span>
                            </div>
                        </div>

                        {profile?.verifiedTeacher && (
                            <div className="verified-teacher-badge">
                                🏅 Verified Teacher
                            </div>
                        )}

                        <div className="google-calendar-row">
                            {profile?.googleCalendarConnected ? (
                                <span className="google-connected-badge">
                                    ✅ Google Calendar connected
                                </span>
                            ) : (

                                <a href={`http://localhost:3003/api/google/auth?token=${localStorage.getItem("token")}`}
                                    className="secondary-button">
                                    Connect Google Calendar
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="profile-card">
                        <h3>Reviews</h3>

                        {reviews.length > 0 ? (
                            <ul className="review-list">
                                {reviews.map((review) => (
                                    <li key={review._id} className="review-item">

                                        {review.swap && (() => {
                                            const taughtSkill =
                                                review.swap.requester.toString() === profile._id.toString()
                                                    ? review.swap.skillOffered
                                                    : review.swap.skillRequested;

                                            return (
                                                <p className="review-context">
                                                    Swap: taught <strong>{taughtSkill}</strong>
                                                </p>
                                            );
                                        })()}

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

                    {/* Skills to Teach */}
                    <div className="profile-card">
                        <h3>Skills I Can Teach</h3>

                        {profile?.skillsToTeach?.length > 0 ? (
                            <ul className="skill-list">
                                {profile.skillsToTeach.map((item, index) => {

                                    const levelPercent = {
                                        Beginner: 25,
                                        Intermediate: 50,
                                        Advanced: 75,
                                        Expert: 100,
                                    }[item.experienceLevel] || 0;

                                    return (
                                        <li key={index} className="skill-item">
                                            <div className="skill-item-header">
                                                <strong>{item.skill}</strong>

                                                <div className="skill-item-actions">
                                                    <span
                                                        className={`status-badge status-${item.verificationStatus.toLowerCase()}`}
                                                    >
                                                        {item.verificationStatus}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="remove-button"
                                                        onClick={() => handleRemoveTeachSkill(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
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

                                            {item.certificate && (

                                                <a href={`http://localhost:3003${item.certificate}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="certificate-link">
                                                    View certificate
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="empty-text">You haven't added any skills yet.</p>
                        )}

                        <div className="add-skill-form add-skill-form-column">
                            <div className="add-skill-row">
                                <input
                                    type="text"
                                    placeholder="e.g. Guitar, Python, Cooking"
                                    value={teachSkill}
                                    onChange={(e) => setTeachSkill(e.target.value)}
                                />

                                <select
                                    value={teachLevel}
                                    onChange={(e) => setTeachLevel(e.target.value)}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>

                            <div className="add-skill-row">
                                <label className="file-input-label">
                                    {certificateFile ? certificateFile.name : "Upload certificate (optional)"}
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => setCertificateFile(e.target.files[0])}
                                        hidden
                                    />
                                </label>

                                <button
                                    type="button"
                                    className="auth-button"
                                    onClick={handleAddTeachSkill}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Skills to Learn */}
                    <div className="profile-card">
                        <h3>Skills I Want to Learn</h3>

                        {profile?.skillsToLearn?.length > 0 ? (
                            <ul className="skill-list">
                                {profile.skillsToLearn.map((skill, index) => (
                                    <li key={index} className="skill-item skill-item-simple">
                                        <span>{skill}</span>

                                        <button
                                            type="button"
                                            className="remove-button"
                                            onClick={() => handleRemoveLearnSkill(skill)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-text">You haven't added any skills yet.</p>
                        )}

                        <div className="add-skill-form">
                            <input
                                type="text"
                                placeholder="e.g. Spanish, Chess, Photography"
                                value={learnInput}
                                onChange={(e) => setLearnInput(e.target.value)}
                            />

                            <button
                                type="button"
                                className="auth-button"
                                onClick={handleAddLearnSkill}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="profile-card">
                        <h3>Timezone</h3>

                        <div className="add-skill-form">
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                <option value="">Select timezone</option>
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>

                            <button
                                type="button"
                                className="auth-button"
                                onClick={handleSaveTimezone}
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Availability Slots */}
                    <div className="profile-card">
                        <h3>Availability Slots</h3>
                        <p className="card-subtext">
                            All times are shown in your timezone ({profile?.timezone || "not set"}).
                        </p>

                        {profile?.availabilitySlots?.length > 0 ? (
                            <ul className="skill-list">
                                {profile.availabilitySlots.map((slot, index) => (
                                    <li key={index} className="skill-item skill-item-simple">
                                        <span>
                                            {slot.startDay} {slot.startTime} → {slot.endDay} {slot.endTime}
                                        </span>

                                        <button
                                            type="button"
                                            className="remove-button"
                                            onClick={() => handleRemoveSlot(index)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-text">No availability slots added yet.</p>
                        )}

                        <div className="add-skill-form add-skill-form-column">
                            <div className="add-skill-row">
                                <select value={startDay} onChange={(e) => setStartDay(e.target.value)}>
                                    {DAYS.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>

                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div className="add-skill-row">
                                <select value={endDay} onChange={(e) => setEndDay(e.target.value)}>
                                    {DAYS.map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>

                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                className="auth-button"
                                onClick={handleAddSlot}
                            >
                                Add Slot
                            </button>
                        </div>
                    </div>

                </div>
            </main >
        </>
    );
}

export default Profile;