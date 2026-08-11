import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./MySwaps.css";
import ReportModal from "../components/ReportModal";
import ScheduleSessionModal from "../components/ScheduleSessionModal";

const TABS = [
  { key: "all", label: "All" },
  { key: "incoming", label: "Incoming" },
  { key: "sent", label: "Sent" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MySwaps() {
  const navigate = useNavigate();

  const [swaps, setSwaps] = useState([]);
const [myId, setMyId] = useState(null);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState("all");

// Per-swap ephemeral UI state
const [actionLoadingId, setActionLoadingId] = useState(null);
const [confirmingCompleteId, setConfirmingCompleteId] = useState(null);

const [schedulingSwap, setSchedulingSwap] = useState(null);

const [reviewingId, setReviewingId] = useState(null);
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [reviewSending, setReviewSending] = useState(false);
const [reviewedIds, setReviewedIds] = useState(new Set());

const [reportedIds, setReportedIds] = useState(new Set());
const [reportingSwap, setReportingSwap] = useState(null);

  const fetchData = async () => {
    try {
      const [profileRes, swapsRes] = await Promise.all([
        api.get("/profile"),
        api.get("/swap/my-swaps"),
      ]);

      setMyId(profileRes.data.profile._id);
      setSwaps(swapsRes.data.swaps || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load your swaps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isRequester = (swap) => swap.requester._id === myId;

  const getOtherUser = (swap) =>
    isRequester(swap) ? swap.receiver : swap.requester;

  const getYouTeach = (swap) =>
    isRequester(swap) ? swap.skillOffered : swap.skillRequested;

  const getYouLearn = (swap) =>
    isRequester(swap) ? swap.skillRequested : swap.skillOffered;

  const getCompletedByMe = (swap) =>
    isRequester(swap) ? swap.completedByRequester : swap.completedByReceiver;

  const getCompletedByOther = (swap) =>
    isRequester(swap) ? swap.completedByReceiver : swap.completedByRequester;

  const categorized = useMemo(() => {
    const incoming = swaps.filter(
      (s) => !isRequester(s) && s.status === "Pending"
    );
    const sent = swaps.filter(
      (s) => isRequester(s) && s.status === "Pending"
    );
    const ongoing = swaps.filter((s) => s.status === "Accepted");
    const completed = swaps.filter((s) => s.status === "Completed");

    return { incoming, sent, ongoing, completed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swaps, myId]);

  const tabCounts = {
    all: swaps.filter((s) => s.status !== "Rejected" && s.status !== "Cancelled").length,
    incoming: categorized.incoming.length,
    sent: categorized.sent.length,
    ongoing: categorized.ongoing.length,
    completed: categorized.completed.length,
  };

  const visibleSwaps =
    activeTab === "all"
      ? swaps.filter((s) => s.status !== "Rejected" && s.status !== "Cancelled")
      : categorized[activeTab] || [];

  // ---------- Actions ----------

  const handleAccept = async (swapId) => {
    setActionLoadingId(swapId);
    try {
      await api.post(`/swap/accept-swap-request/${swapId}`);
      toast.success("Swap accepted!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to accept request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (swapId) => {
    setActionLoadingId(swapId);
    try {
      await api.post(`/swap/reject-swap-request/${swapId}`);
      toast.success("Swap request rejected.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reject request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (swapId) => {
    setActionLoadingId(swapId);
    try {
      await api.post(`/swap/cancel-swap-request/${swapId}`);
      toast.success("Swap request cancelled.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteConfirmed = async (swapId) => {
    setActionLoadingId(swapId);
    try {
      const response = await api.post(`/swap/complete-swap/${swapId}`);
      toast.success(response.data.message || "Swap updated.");
      setConfirmingCompleteId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to complete swap.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenChat = (swap) => {
    if (!swap.chatId) {
      toast.error("Chat isn't ready for this swap yet.");
      return;
    }
    navigate(`/chat/${swap.chatId}`);
  };

  const openReviewForm = (swapId) => {
    setReviewingId(swapId);
    setReviewRating(5);
    setReviewComment("");
  };

  const closeReviewForm = () => {
    setReviewingId(null);
  };

  const handleSubmitReview = async (swapId) => {
    setReviewSending(true);
    try {
      await api.post(`/review/${swapId}`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success("Review submitted. Thank you!");
      setReviewedIds((prev) => new Set(prev).add(swapId));
      closeReviewForm();
    } catch (error) {
      const message = error.response?.data?.message || "";
      if (message.toLowerCase().includes("already reviewed")) {
        toast("You've already reviewed this swap.", { icon: "⭐" });
        setReviewedIds((prev) => new Set(prev).add(swapId));
        closeReviewForm();
      } else {
        toast.error(message || "Unable to submit review.");
      }
    } finally {
      setReviewSending(false);
    }
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="swaps-page">
          <p className="loading-text">Loading your swaps...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="swaps-page">
        <div className="swaps-container">
          <h1>My Swaps</h1>
          <p className="page-subtext">Manage your skill exchanges</p>

          <div className="swap-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`swap-tab ${activeTab === tab.key ? "swap-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} <span className="swap-tab-count">{tabCounts[tab.key]}</span>
              </button>
            ))}
          </div>

          {visibleSwaps.length === 0 ? (
            <div className="empty-state">
              <p>No swaps here yet.</p>
              <p className="empty-state-hint">
                Head over to <Link to="/find-match">Find Your Match</Link> to
                start a new skill swap.
              </p>
            </div>
          ) : (
            <div className="swap-grid">
              {visibleSwaps.map((swap) => {
                const otherUser = getOtherUser(swap);
                const amRequester = isRequester(swap);
                const completedByMe = getCompletedByMe(swap);
                const completedByOther = getCompletedByOther(swap);

                return (
                  <div className="swap-card" key={swap._id}>
                    {/* ---------- PENDING · INCOMING ---------- */}
                    {swap.status === "Pending" && !amRequester && (
                      <>
                        <div className="swap-status-badge status-incoming">
                          🟠 Swap Request
                        </div>

                        <h3 className="swap-other-name">{otherUser.name}</h3>

                        <div className="swap-skill-lines">
                          <p>
                            <span className="swap-skill-label">Wants to learn:</span>{" "}
                            {swap.skillRequested}
                          </p>
                          <p>
                            <span className="swap-skill-label">Can teach:</span>{" "}
                            {swap.skillOffered}
                          </p>
                        </div>

                        <div className="swap-actions">
                          <Link
                            to={`/profile/${otherUser._id}`}
                            className="secondary-button"
                          >
                            View Profile
                          </Link>
                        </div>

                        <div className="swap-actions swap-actions-split">
                          <button
                            type="button"
                            className="reject-button"
                            disabled={actionLoadingId === swap._id}
                            onClick={() => handleReject(swap._id)}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="auth-button"
                            disabled={actionLoadingId === swap._id}
                            onClick={() => handleAccept(swap._id)}
                          >
                            Accept Swap
                          </button>
                        </div>
                      </>
                    )}

                    {/* ---------- PENDING · SENT ---------- */}
                    {swap.status === "Pending" && amRequester && (
                      <>
                        <div className="swap-status-badge status-sent">
                          🟡 Request Sent
                        </div>

                        <h3 className="swap-other-name">{otherUser.name}</h3>

                        <div className="swap-skill-lines">
                          <p>
                            <span className="swap-skill-label">You teach:</span>{" "}
                            {swap.skillOffered}
                          </p>
                          <p>
                            <span className="swap-skill-label">You want to learn:</span>{" "}
                            {swap.skillRequested}
                          </p>
                        </div>

                        <p className="swap-waiting-text">
                          Waiting for {otherUser.name}'s response...
                        </p>

                        <div className="swap-actions">
                          <Link
                            to={`/profile/${otherUser._id}`}
                            className="secondary-button"
                          >
                            View Profile
                          </Link>
                          <button
                            type="button"
                            className="reject-button"
                            disabled={actionLoadingId === swap._id}
                            onClick={() => handleCancel(swap._id)}
                          >
                            Cancel Request
                          </button>
                        </div>
                      </>
                    )}

                    {/* ---------- ACCEPTED · ONGOING ---------- */}
                    {swap.status === "Accepted" && (
                      <>
                        <div className="swap-status-badge status-ongoing">
                          🟢 Ongoing Swap
                        </div>

                        <h3 className="swap-other-name">{otherUser.name}</h3>

                        <p className="swap-skill-pair">
                          {getYouTeach(swap)} ↔ {getYouLearn(swap)}
                        </p>

                        {swap.session && (
                          <div className="session-info-box">
                            <p className="session-goal">📅 {swap.session.goal}</p>
                            <p className="session-time">
                              {formatDate(swap.session.startTime)} ·{" "}
                              {new Date(swap.session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {" – "}
                              {new Date(swap.session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {swap.session.meetingLink && (

                              <a href={swap.session.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="join-session-link">
                                🔗 Join Session
                              </a>
                            )}
                          </div>
                        )}

                        <div className="swap-actions">
                          <Link
                            to={`/profile/${otherUser._id}`}
                            className="secondary-button"
                          >
                            View Profile
                          </Link>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleOpenChat(swap)}
                          >
                            Open Chat
                          </button>
                        </div>

                        {reportedIds.has(swap._id) ? (
                          <p className="report-link report-link-done">🚩 Reported</p>
                        ) : (
                          <button
                            type="button"
                            className="report-link"
                            onClick={() => setReportingSwap({ swap, otherUser })}
                          >
                            🚩 Report {otherUser.name}
                          </button>
                        )}

                        <div className="swap-actions">
                          {!swap.session && (
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => setSchedulingSwap(swap)}
                            >
                              Schedule Session
                            </button>
                          )}

                          {completedByMe ? (
                            <button type="button" className="auth-button" disabled>
                              Waiting for {otherUser.name}...
                            </button>
                          ) : confirmingCompleteId === swap._id ? null : (
                            <button
                              type="button"
                              className="auth-button"
                              onClick={() => setConfirmingCompleteId(swap._id)}
                            >
                              Complete Swap
                            </button>
                          )}
                        </div>

                        {completedByOther && !completedByMe && (
                          <p className="swap-hint-text">
                            {otherUser.name} has marked this swap complete —
                            confirm on your side to finish it.
                          </p>
                        )}

                        {confirmingCompleteId === swap._id && (
                          <div className="inline-panel">
                            <p className="inline-panel-title">
                              Complete this swap?
                            </p>
                            <p className="inline-panel-text">
                              Make sure you've completed your skill exchange
                              with {otherUser.name}.
                            </p>
                            <div className="inline-panel-actions">
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setConfirmingCompleteId(null)}
                              >
                                Not Yet
                              </button>
                              <button
                                type="button"
                                className="auth-button"
                                disabled={actionLoadingId === swap._id}
                                onClick={() => handleCompleteConfirmed(swap._id)}
                              >
                                Complete
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )
                    }

                    {/* ---------- COMPLETED ---------- */}
                    {
                      swap.status === "Completed" && (
                        <>
                          <div className="swap-status-badge status-completed">
                            ✓ Completed
                          </div>

                          <h3 className="swap-other-name">{otherUser.name}</h3>

                          <p className="swap-skill-pair">
                            {getYouTeach(swap)} ↔ {getYouLearn(swap)}
                          </p>

                          <p className="swap-date-text">
                            Completed {formatDate(swap.updatedAt)}
                          </p>

                          <div className="swap-actions">
                            <Link
                              to={`/profile/${otherUser._id}`}
                              className="secondary-button"
                            >
                              View Profile
                            </Link>

                            {reviewedIds.has(swap._id) ? (
                              <button type="button" className="secondary-button" disabled>
                                ✓ Review submitted
                              </button>
                            ) : reviewingId === swap._id ? (
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={closeReviewForm}
                              >
                                Cancel Review
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="auth-button"
                                onClick={() => openReviewForm(swap._id)}
                              >
                                ⭐ Leave a Review
                              </button>
                            )}
                          </div>

                          {reportedIds.has(swap._id) ? (
                            <p className="report-link report-link-done">🚩 Reported</p>
                          ) : (
                            <button
                              type="button"
                              className="report-link"
                              onClick={() => setReportingSwap({ swap, otherUser })}
                            >
                              🚩 Report {otherUser.name}
                            </button>
                          )}

                          {reviewingId === swap._id && (
                            <div className="inline-panel">
                              <div className="request-form-row">
                                <label>Rating</label>
                                <div className="review-star-picker">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      className={`star-pick-button ${star <= reviewRating ? "star-pick-filled" : ""
                                        }`}
                                      onClick={() => setReviewRating(star)}
                                      aria-label={`${star} star`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <textarea
                                placeholder={`Share a bit about your swap with ${otherUser.name} (optional)`}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={2}
                              />

                              <button
                                type="button"
                                className="auth-button"
                                disabled={reviewSending}
                                onClick={() => handleSubmitReview(swap._id)}
                              >
                                {reviewSending ? "Submitting..." : "Submit Review"}
                              </button>
                            </div>
                          )}
                        </>
                      )
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {reportingSwap && (
        <ReportModal
          swapId={reportingSwap.swap._id}
          otherUserName={reportingSwap.otherUser.name}
          onClose={() => setReportingSwap(null)}
          onSuccess={() =>
            setReportedIds((prev) => new Set(prev).add(reportingSwap.swap._id))
          }
          onAlreadyReported={() =>
            setReportedIds((prev) => new Set(prev).add(reportingSwap.swap._id))
          }
        />
      )}

      {schedulingSwap && (
        <ScheduleSessionModal
          swapId={schedulingSwap._id}
          otherUserName={getOtherUser(schedulingSwap).name}
          onClose={() => setSchedulingSwap(null)}
          onScheduled={fetchData}
        />
      )}
    </>
  );
}

export default MySwaps;