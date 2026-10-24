import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Mail, X, Loader } from "lucide-react";
import ErrorNotice from "../../../../components/ErrorNotice";
import "./ResendInvitationModal.css";

export default function ResendInvitationModal({ user, isSending, error, onClose, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (user && !dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [user]);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="resend-invitation-dialog"
      aria-labelledby="resend-invitation-title"
      aria-describedby="resend-invitation-description"
      aria-busy={isSending}
      onCancel={(event) => {
        event.preventDefault();
        if (!isSending) onClose();
      }}
    >
      <div className="resend-invitation-content">
        <div className="resend-invitation-heading">
          <span className="resend-invitation-icon"><Mail size={24} aria-hidden="true" /></span>
          <button type="button" className="resend-invitation-close" aria-label="Close invitation confirmation" onClick={onClose} disabled={isSending}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <h2 id="resend-invitation-title">Resend invitation?</h2>
        <p id="resend-invitation-description">Send a new welcome email to this account so they can sign in to VISTA.</p>
        <div className="resend-invitation-recipient">
          <span>Recipient</span>
          <strong>{user?.email}</strong>
        </div>
        <p className="resend-invitation-note">If sending succeeds, a new temporary password will replace the previous one. Ask the user to use the newest invitation.</p>
        <ErrorNotice message={error} />
        <div className="resend-invitation-buttons">
          <button type="button" className="resend-invitation-cancel" onClick={onClose} disabled={isSending} autoFocus>Cancel</button>
          <button type="button" className="resend-invitation-confirm" onClick={onConfirm} disabled={isSending}>
            {isSending ? <Loader size={16} className="animate-spin" aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
            {isSending ? "Sending..." : "Send invitation"}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
