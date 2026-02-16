import React, { useState, useEffect } from "react";
import useTeamStore from "../../store/teamStore";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Users } from "lucide-react";
import "./TeamModal.css";

const TeamModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const { createTeam } = useTeamStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const team = await createTeam(name.trim());
      setLoading(false);

      if (team) {
        setName("");
        onClose();
      } else {
        setError("Failed to create team. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Team" size="sm">
      <form onSubmit={handleSubmit} className="team-modal__form">
        <Input
          label="Team Name"
          placeholder="e.g. Design Team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          icon={Users}
          autoFocus
        />

        {error && (
          <div className="team-modal__error">
            <span>{error}</span>
          </div>
        )}

        <div className="team-modal__actions">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading} variant="primary">
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamModal;
