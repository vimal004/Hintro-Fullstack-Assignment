import React, { useState } from "react";
import useTeamStore from "../../store/teamStore";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const InviteModal = ({ isOpen, onClose, teamId, teamName }) => {
  const [email, setEmail] = useState("");
  const { inviteMember, sendAppInvite } = useTeamStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAppInvitePrompt, setShowAppInvitePrompt] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");
    setShowAppInvitePrompt(false);

    const result = await inviteMember(teamId, email);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || "Member added successfully!");
      if (!result.message || !result.message.includes("already")) {
        setEmail("");
      }
      // If validation error (like "already member"), we show it as message but keep modal open?
      // Actually result.success is true for both "added" and "already member" handling logic in store
      // But let's assume if it returns success=true it's good.
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1500);
    } else {
      // Check if it's "USER_NOT_FOUND"
      if (result.error?.response?.data?.code === "USER_NOT_FOUND") {
        setShowAppInvitePrompt(true);
      } else {
        setError(
          result.error?.response?.data?.message || "Failed to invite member",
        );
      }
    }
  };

  const handleAppInvite = async () => {
    setLoading(true);
    const success = await sendAppInvite(teamId, email);
    setLoading(false);

    if (success) {
      setSuccessMessage(`Invitation to join the app sent to ${email}`);
      setShowAppInvitePrompt(false);
      setEmail("");
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 2000);
    } else {
      setError("Failed to send invitation.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite to ${teamName}`}>
      {successMessage ? (
        <div className="p-4 text-green-600 bg-green-50 rounded-md text-center">
          {successMessage}
        </div>
      ) : showAppInvitePrompt ? (
        <div className="flex flex-col gap-4">
          <p className="text-gray-700">
            User <strong>{email}</strong> does not have an account.
            <br />
            Would you like to send them an email invitation to join the app?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowAppInvitePrompt(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAppInvite} disabled={loading}>
              {loading ? "Sending..." : "Send App Invite"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Inviting..." : "Invite Member"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default InviteModal;
