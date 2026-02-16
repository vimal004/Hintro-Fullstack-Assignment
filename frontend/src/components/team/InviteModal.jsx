import React, { useState, useEffect } from "react";
import useTeamStore from "../../store/teamStore";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Mail, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import "./InviteModal.css";

const InviteModal = ({ isOpen, onClose, teamId, teamName }) => {
  const [email, setEmail] = useState("");
  const { inviteMember } = useTeamStore();

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError(null);
      setSuccessMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const result = await inviteMember(teamId, trimmed);
      setLoading(false);

      if (result.success) {
        setSuccessMessage(result.message || "Invitation sent!");
        setEmail("");
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        const errorMsg =
          result.error?.data?.message ||
          result.error?.message ||
          "Failed to send invitation.";
        setError(errorMsg);
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
      console.error("handleSubmit invite error:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite to ${teamName || "Team"}`}
      size="sm"
    >
      <div className="invite-modal">
        {/* ═══ SUCCESS STATE ═══ */}
        {successMessage && (
          <div className="invite-modal__success">
            <div className="invite-modal__success-icon">
              <CheckCircle size={28} />
            </div>
            <h3 className="invite-modal__success-title">Invitation Sent!</h3>
            <p className="invite-modal__success-msg">{successMessage}</p>
          </div>
        )}

        {/* ═══ INVITE FORM ═══ */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="invite-modal__form">
            <div className="invite-modal__input-group">
              <Input
                label="Email Address"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={Mail}
                autoFocus
              />
              <p className="invite-modal__helper">
                Enter the email of a registered user you&apos;d like to invite.
                They&apos;ll receive a notification to accept or decline.
              </p>
            </div>

            {error && (
              <div className="invite-modal__error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="invite-modal__actions">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                variant="primary"
                icon={loading ? null : UserPlus}
              >
                {loading ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default InviteModal;
