import { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2, Clock } from "lucide-react";
import useBoardStore from "../../store/boardStore";
import useAuthStore from "../../store/authStore";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import "./CommentSection.css";

export default function CommentSection({ taskId, boardId }) {
  const [newComment, setNewComment] = useState("");
  const { user: currentUser } = useAuthStore();
  const { taskComments, fetchComments, createComment, deleteComment } =
    useBoardStore();

  const comments = taskComments[taskId] || [];

  useEffect(() => {
    fetchComments(boardId, taskId);
  }, [boardId, taskId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment(boardId, taskId, newComment.trim());
    setNewComment("");
  };

  const handleDelete = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      await deleteComment(boardId, taskId, commentId);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="comment-section">
      <div className="comment-section__list">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isMine = comment.user_id === currentUser?.id;
            return (
              <div
                key={comment.id}
                className={`comment ${isMine ? "comment--mine" : ""}`}
              >
                <div className="comment__avatar">
                  <Avatar
                    user={{
                      name: comment.user_name,
                      email: comment.user_email,
                      initials: comment.initials,
                      color: comment.color,
                    }}
                    size="sm"
                  />
                </div>
                <div className="comment__content">
                  <div className="comment__header">
                    <span className="comment__author">{comment.user_name}</span>
                    <span className="comment__time">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                  <div className="comment__bubble">
                    <p>{comment.text}</p>
                  </div>
                  {isMine && (
                    <button
                      className="comment__delete"
                      onClick={() => handleDelete(comment.id)}
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="comment-section__empty">
            <MessageSquare size={24} opacity={0.3} />
            <p>No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <form className="comment-section__form" onSubmit={handleSubmit}>
        <Avatar user={currentUser} size="sm" />
        <div className="comment-section__input-wrapper">
          <input
            className="comment-section__input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            className="comment-section__send-btn"
            disabled={!newComment.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
