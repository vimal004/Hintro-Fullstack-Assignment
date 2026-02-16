import useSocketStore from "../../store/socketStore";
import { X, Zap } from "lucide-react";
import "./Toast.css";

export default function ToastContainer() {
  const toasts = useSocketStore((s) => s.toasts);
  const dismissToast = useSocketStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <div className="toast__icon">
            <Zap size={14} />
          </div>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__dismiss"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
