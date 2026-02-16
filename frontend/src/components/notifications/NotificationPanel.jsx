import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Users,
  Check,
  X,
  CheckCheck,
  Clock,
  ChevronDown,
} from "lucide-react";
import useNotificationStore from "../../store/notificationStore";
import useTeamStore from "../../store/teamStore";
import "./NotificationPanel.css";

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    acceptInvite,
    declineInvite,
  } = useNotificationStore();

  const fetchMyTeams = useTeamStore((s) => s.fetchMyTeams);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleAccept = async (e, notifId) => {
    e.stopPropagation();
    const result = await acceptInvite(notifId);
    if (result.success) {
      // Refresh teams list since user joined a new team
      fetchMyTeams();
    }
  };

  const handleDecline = async (e, notifId) => {
    e.stopPropagation();
    await declineInvite(notifId);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "accepted":
        return (
          <span className="notif-panel__status notif-panel__status--accepted">
            <Check size={12} /> Accepted
          </span>
        );
      case "declined":
        return (
          <span className="notif-panel__status notif-panel__status--declined">
            <X size={12} /> Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="notif-panel" ref={panelRef}>
      {/* ── Bell Button ── */}
      <button
        className="topbar__icon-btn notif-panel__bell"
        aria-label="Notifications"
        onClick={handleToggle}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-panel__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div className="notif-panel__dropdown">
          {/* Header */}
          <div className="notif-panel__header">
            <h3 className="notif-panel__title">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="notif-panel__mark-all"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="notif-panel__list">
            {isLoading && notifications.length === 0 ? (
              <div className="notif-panel__empty">
                <Clock size={24} />
                <span>Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-panel__empty">
                <Bell size={24} />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-panel__item ${!notif.is_read ? "notif-panel__item--unread" : ""}`}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                  }}
                >
                  {/* Icon */}
                  <div className="notif-panel__item-icon">
                    {notif.type === "team_invite" ? (
                      <Users size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="notif-panel__item-content">
                    <p className="notif-panel__item-message">{notif.message}</p>
                    <span className="notif-panel__item-time">
                      {formatTime(notif.created_at)}
                    </span>

                    {/* Status or Actions */}
                    {notif.type === "team_invite" &&
                    notif.status === "pending" ? (
                      <div className="notif-panel__item-actions">
                        <button
                          className="notif-panel__action-btn notif-panel__action-btn--accept"
                          onClick={(e) => handleAccept(e, notif.id)}
                        >
                          <Check size={14} />
                          Accept
                        </button>
                        <button
                          className="notif-panel__action-btn notif-panel__action-btn--decline"
                          onClick={(e) => handleDecline(e, notif.id)}
                        >
                          <X size={14} />
                          Decline
                        </button>
                      </div>
                    ) : (
                      getStatusLabel(notif.status)
                    )}
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && <span className="notif-panel__item-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
