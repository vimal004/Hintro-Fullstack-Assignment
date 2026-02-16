import React, { useState } from "react";
import useTeamStore from "../../store/teamStore";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const TeamModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const { createTeam } = useTeamStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const team = await createTeam(name);
    setLoading(false);

    if (team) {
      setName("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Team">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Team Name"
          placeholder="e.g. Design Team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamModal;
