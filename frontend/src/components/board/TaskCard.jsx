import { Draggable } from "@hello-pangea/dnd";
import { Calendar, MessageSquare } from "lucide-react";
import useBoardStore from "../../store/boardStore";
import Avatar from "../ui/Avatar";
import "./TaskCard.css";

export default function TaskCard({ task, index, listId, boardId }) {
  const openTaskModal = useBoardStore((s) => s.openTaskModal);
  const getLabelById = useBoardStore((s) => s.getLabelById);
  const getUserById = useBoardStore((s) => s.getUserById);

  const assigneeUsers = (task.assignees || [])
    .map((id) => getUserById(id))
    .filter(Boolean);

  const labelData = (task.labels || [])
    .map((id) => getLabelById(id))
    .filter(Boolean);

  const priorityColors = {
    high: "#d93025",
    medium: "#f9ab00",
    low: "#1e8e3e",
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const dueDate = task.due_date || task.dueDate;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? "task-card--dragging" : ""}`}
          onClick={() => openTaskModal({ ...task, listId, boardId })}
        >
          {/* ── Labels ──── */}
          {labelData.length > 0 && (
            <div className="task-card__labels">
              {labelData.map((label) => (
                <span
                  key={label.id}
                  className="task-card__label"
                  style={{
                    backgroundColor: label.color + "18",
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* ── Title ──── */}
          <h4 className="task-card__title">{task.title}</h4>

          {/* ── Description preview ──── */}
          {task.description && (
            <p className="task-card__desc">{task.description}</p>
          )}

          {/* ── Footer ──── */}
          <div className="task-card__footer">
            <div className="task-card__meta">
              {dueDate && (
                <span className="task-card__due">
                  <Calendar size={12} />
                  {formatDueDate(dueDate)}
                </span>
              )}
              {task.priority && (
                <span
                  className="task-card__priority"
                  style={{ color: priorityColors[task.priority] }}
                >
                  ●
                </span>
              )}
              {parseInt(task.comments_count || 0) > 0 && (
                <span className="task-card__comments">
                  <MessageSquare
                    size={12}
                    fill="currentColor"
                    fillOpacity={0.1}
                  />
                  {task.comments_count}
                </span>
              )}
            </div>
            <div className="task-card__assignees">
              {assigneeUsers.slice(0, 2).map((u) => (
                <Avatar key={u.id} user={u} size="sm" />
              ))}
              {assigneeUsers.length > 2 && (
                <span className="task-card__more">
                  +{assigneeUsers.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
