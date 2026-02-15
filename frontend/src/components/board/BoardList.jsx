import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import TaskCard from "./TaskCard";
import useBoardStore from "../../store/boardStore";
import "./BoardList.css";

export default function BoardList({ list, boardId }) {
  const createTask = useBoardStore((s) => s.createTask);
  const deleteList = useBoardStore((s) => s.deleteList);
  const updateListTitle = useBoardStore((s) => s.updateListTitle);

  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    createTask(boardId, list.id, { title: newTaskTitle.trim() });
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== list.title) {
      updateListTitle(boardId, list.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="board-list">
      {/* ── Header ──── */}
      <div className="board-list__header">
        {isEditing ? (
          <input
            className="board-list__title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            autoFocus
          />
        ) : (
          <h3
            className="board-list__title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {list.title}
            <span className="board-list__count">{list.tasks.length}</span>
          </h3>
        )}

        <div className="board-list__menu-wrapper">
          <button
            className="board-list__menu-btn"
            onClick={() => setShowMenu((p) => !p)}
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="board-list__dropdown">
              <button
                className="board-list__dropdown-item"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
              >
                <Edit3 size={14} />
                Rename
              </button>
              <button
                className="board-list__dropdown-item board-list__dropdown-item--danger"
                onClick={() => {
                  deleteList(boardId, list.id);
                  setShowMenu(false);
                }}
              >
                <Trash2 size={14} />
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tasks ──── */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`board-list__tasks ${snapshot.isDraggingOver ? "board-list__tasks--active" : ""}`}
          >
            {list.tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                listId={list.id}
                boardId={boardId}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* ── Add Task ──── */}
      {isAdding ? (
        <div className="board-list__add-form">
          <input
            className="board-list__add-input"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title…"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
              if (e.key === "Escape") setIsAdding(false);
            }}
            autoFocus
          />
          <div className="board-list__add-actions">
            <button className="board-list__add-confirm" onClick={handleAddTask}>
              Add
            </button>
            <button
              className="board-list__add-cancel"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="board-list__add-btn"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={16} />
          Add a task
        </button>
      )}
    </div>
  );
}
