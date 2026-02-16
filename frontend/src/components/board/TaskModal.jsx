import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Tag,
  Users,
  Clock,
  AlertCircle,
  Trash2,
  MessageSquare,
} from "lucide-react";
import useBoardStore from "../../store/boardStore";
import useSocketStore from "../../store/socketStore";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import CommentSection from "./CommentSection";
import "./TaskModal.css";

export default function TaskModal() {
  const {
    selectedTask,
    isTaskModalOpen,
    closeTaskModal,
    updateTask,
    deleteTask,
    boardDetail,
    activities,
    fetchActivities,
    getUserById,
  } = useBoardStore();

  const { emitEvent } = useSocketStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || "");
      setDescription(selectedTask.description || "");
      setDueDate(selectedTask.due_date || selectedTask.dueDate || "");
      setPriority(selectedTask.priority || "medium");
      setSelectedLabels(selectedTask.labels || []);
      setSelectedAssignees(selectedTask.assignees || []);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (activeTab === "activity" && selectedTask?.boardId) {
      fetchActivities(selectedTask.boardId);
    }
  }, [activeTab, selectedTask?.boardId, fetchActivities]);

  if (!isTaskModalOpen || !selectedTask) return null;

  const members = boardDetail?.members || [];
  const labels = boardDetail?.labels || [];
  const taskActivities = activities.filter(
    (a) => a.task_id === selectedTask.id,
  );

  const handleSave = async () => {
    await updateTask(
      selectedTask.boardId,
      selectedTask.listId,
      selectedTask.id,
      {
        title,
        description,
        dueDate: dueDate || null,
        priority,
        labels: selectedLabels,
        assignees: selectedAssignees,
      },
    );

    emitEvent("task:updated", {
      boardId: selectedTask.boardId,
      listId: selectedTask.listId,
      task: { id: selectedTask.id, title, description, priority },
    });

    closeTaskModal();
  };

  const handleDelete = async () => {
    await deleteTask(
      selectedTask.boardId,
      selectedTask.listId,
      selectedTask.id,
    );

    emitEvent("task:deleted", {
      boardId: selectedTask.boardId,
      listId: selectedTask.listId,
      taskId: selectedTask.id,
    });

    closeTaskModal();
  };

  const toggleLabel = (labelId) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((l) => l !== labelId)
        : [...prev, labelId],
    );
  };

  const toggleAssignee = (userId) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((u) => u !== userId)
        : [...prev, userId],
    );
  };

  const priorities = [
    { id: "low", label: "Low", color: "#1e8e3e" },
    { id: "medium", label: "Medium", color: "#f9ab00" },
    { id: "high", label: "High", color: "#d93025" },
  ];

  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="task-modal-overlay" onClick={closeTaskModal}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ──── */}
        <div className="task-modal__header">
          <div className="task-modal__tabs">
            {["details", "activity", "comments"].map((tab) => (
              <button
                key={tab}
                className={`task-modal__tab ${activeTab === tab ? "task-modal__tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button className="task-modal__close" onClick={closeTaskModal}>
            <X size={20} />
          </button>
        </div>

        <div className="task-modal__content-scroll">
          {activeTab === "details" ? (
            <div className="task-modal__body">
              <div className="task-modal__main">
                {/* Title */}
                <input
                  className="task-modal__title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />

                {/* Description */}
                <div className="task-modal__field">
                  <label className="task-modal__label">Description</label>
                  <textarea
                    className="task-modal__textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a detailed description…"
                    rows={4}
                  />
                </div>
              </div>

              {/* ── Sidebar Meta ──── */}
              <div className="task-modal__sidebar">
                {/* Due Date */}
                <div className="task-modal__field">
                  <label className="task-modal__label">
                    <Calendar size={14} /> Due date
                  </label>
                  <input
                    type="date"
                    className="task-modal__date-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div className="task-modal__field">
                  <label className="task-modal__label">
                    <AlertCircle size={14} /> Priority
                  </label>
                  <div className="task-modal__priority-group">
                    {priorities.map((p) => (
                      <button
                        key={p.id}
                        className={`task-modal__priority-btn ${priority === p.id ? "task-modal__priority-btn--active" : ""}`}
                        style={
                          priority === p.id
                            ? {
                                backgroundColor: p.color + "18",
                                color: p.color,
                                borderColor: p.color,
                              }
                            : {}
                        }
                        onClick={() => setPriority(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Labels */}
                <div className="task-modal__field">
                  <label className="task-modal__label">
                    <Tag size={14} /> Labels
                  </label>
                  <div className="task-modal__labels-grid">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        className={`task-modal__label-chip ${selectedLabels.includes(label.id) ? "task-modal__label-chip--active" : ""}`}
                        style={
                          selectedLabels.includes(label.id)
                            ? {
                                backgroundColor: label.color + "18",
                                color: label.color,
                                borderColor: label.color,
                              }
                            : {}
                        }
                        onClick={() => toggleLabel(label.id)}
                      >
                        {label.name}
                      </button>
                    ))}
                    {labels.length === 0 && (
                      <span className="task-modal__no-labels">
                        No labels yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignees */}
                <div className="task-modal__field">
                  <label className="task-modal__label">
                    <Users size={14} /> Assignees
                  </label>
                  <div className="task-modal__assignees">
                    {members.map((user) => (
                      <button
                        key={user.id}
                        className={`task-modal__assignee ${selectedAssignees.includes(user.id) ? "task-modal__assignee--active" : ""}`}
                        onClick={() => toggleAssignee(user.id)}
                      >
                        <Avatar user={user} size="sm" />
                        <span>{user.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "comments" ? (
            /* ── Comments Tab ──── */
            <div className="task-modal__comments">
              <CommentSection
                taskId={selectedTask.id}
                boardId={selectedTask.boardId}
              />
            </div>
          ) : (
            /* ── Activity Tab ──── */
            <div className="task-modal__activity">
              {taskActivities.length > 0 ? (
                taskActivities.map((act) => {
                  const actUser = act.user || getUserById(act.user_id);
                  return (
                    <div key={act.id} className="task-modal__activity-item">
                      <Avatar user={actUser} size="sm" />
                      <div className="task-modal__activity-content">
                        <span className="task-modal__activity-text">
                          <strong>{actUser?.name}</strong> {act.detail}
                        </span>
                        <span className="task-modal__activity-time">
                          {formatTimestamp(act.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="task-modal__no-activity">
                  <Clock size={32} strokeWidth={1.2} />
                  <p>No activity yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ──── */}
        <div className="task-modal__footer">
          <Button
            variant="ghost"
            icon={Trash2}
            onClick={handleDelete}
            size="sm"
          >
            Delete
          </Button>
          <div className="task-modal__footer-right">
            <Button variant="text" onClick={closeTaskModal} size="sm">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} size="sm">
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
