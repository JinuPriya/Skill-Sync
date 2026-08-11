import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import "./RequestSwapModal.css";

const REPORT_REASONS = [
    "Abusive Behaviour",
    "Didn't Teach Claimed Skill",
    "Fake Profile",
    "Spam",
    "Harassment",
    "Other",
];

function ReportModal({ swapId, otherUserName, onClose, onSuccess, onAlreadyReported }) {
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [description, setDescription] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error("Please describe what happened.");
            return;
        }

        setSending(true);

        try {
            await api.post("/report", {
                swapId,
                reason,
                description: description.trim(),
            });

            toast.success("Report submitted. Our team will review it.");
            onSuccess?.();
            onClose();

        } catch (error) {
            const message = error.response?.data?.message || "Unable to submit report.";
            toast.error(message);

            if (message.includes("already reported")) {
                onAlreadyReported?.();
                onClose();
            }

        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>

                <h3>Report {otherUserName}</h3>
                <p className="modal-subtext">
                    This report is only visible to SkillSync admins — {otherUserName} won't be notified.
                </p>

                <div className="form-group">
                    <label>Reason</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                        {REPORT_REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>What happened? ({description.length}/1000)</label>
                    <textarea
                        rows={4}
                        maxLength={1000}
                        placeholder="Describe the issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="report-submit-button"
                        onClick={handleSubmit}
                        disabled={sending}
                    >
                        {sending ? "Submitting..." : "Submit Report"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ReportModal;