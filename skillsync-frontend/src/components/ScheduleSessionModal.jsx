import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import "./RequestSwapModal.css";

function ScheduleSessionModal({ swapId, otherUserName, onClose, onScheduled }) {
    const [goal, setGoal] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [sending, setSending] = useState(false);

    const handleSchedule = async () => {
        if (!goal || !startTime || !endTime) {
            toast.error("Please fill in the topic, start, and end time.");
            return;
        }

        setSending(true);

        try {
            await api.post(`/session/swap/${swapId}/session`, {
                goal,
                startTime,
                endTime,
            });

            toast.success("Session scheduled with a Google Meet link!");
            onScheduled?.();
            onClose();

        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to schedule session.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>

                <h3>Schedule Session with {otherUserName}</h3>

                <div className="form-group">
                    <label>Session topic</label>
                    <input
                        type="text"
                        placeholder="e.g. French basics"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Start</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>End</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="auth-button"
                        onClick={handleSchedule}
                        disabled={sending}
                    >
                        {sending ? "Scheduling..." : "Schedule"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ScheduleSessionModal;