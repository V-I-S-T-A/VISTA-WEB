import GoogleDriveLogo from "../../../../components/GoogleDriveLogo";
import ErrorNotice from "../../../../components/ErrorNotice";
import { Folder, LogOut } from "lucide-react";
import { useState } from "react";
import { useDisconnectDrive } from "../../../../hooks/useDrive";

export default function ConnectedStatusCard({ connection, onChangeFolder }) {
  const disconnectDrive = useDisconnectDrive();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDisconnect() {
    try {
      await disconnectDrive.mutateAsync();
      setConfirmOpen(false);
    } catch (err) {
      console.error("Failed to disconnect Google Drive:", err);
    }
  }

  const lastSynced = connection?.last_synced_at
    ? new Date(connection.last_synced_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not synced yet";

  return (
    <div className="vista-surface drive-connection-panel"
      style={{
        background: "var(--ui-surface)",
        borderRadius: "var(--radius-card)",
        padding: "28px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        marginTop: "28px",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: "10px", marginBottom: "18px" }}
      >
        <span className="vista-plain-icon"><GoogleDriveLogo size={28} /></span>
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 700,
              color: "#031c36",
              margin: 0,
            }}
          >
            Google Drive Connected
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--ui-muted)",
              margin: 0,
            }}
          >
            {connection?.google_account_email}
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          background: "#f8f9fc",
          border: "1.5px solid #e5e7eb",
          borderRadius: "var(--radius-chip)",
          padding: "14px 16px",
          marginBottom: "10px",
        }}
      >
        <div className="flex items-center" style={{ gap: "10px", minWidth: 0 }}>
          <Folder
            style={{
              width: "18px",
              height: "18px",
              color: "#f59e0b",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {connection?.folder_name || "No folder selected"}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "#9ca3af",
                margin: 0,
              }}
            >
              Last synced: {lastSynced}
            </p>
          </div>
        </div>
        <button data-ui="secondary"
          type="button"
          onClick={onChangeFolder}
          className="font-inter font-bold"
          style={{ cursor: "pointer", flexShrink: 0 }}
        >
          Change
        </button>
      </div>

      <ErrorNotice message={disconnectDrive.isError ? "Could not disconnect Google Drive. Please try again." : ""} />
      {!confirmOpen ? (
        <button data-ui="destructive"
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center justify-center"
          style={{ width: "100%", gap: "8px", cursor: "pointer", marginTop: "8px" }}
        >
          <LogOut style={{ width: "14px", height: "14px" }} />
          Disconnect Google Drive
        </button>
      ) : (
        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <button aria-busy={Boolean(disconnectDrive.isPending)} data-ui="destructive"
            type="button"
            onClick={handleDisconnect}
            disabled={disconnectDrive.isPending}
            style={{ flex: 1, cursor: disconnectDrive.isPending ? "not-allowed" : "pointer", opacity: disconnectDrive.isPending ? 0.7 : 1 }}
          >
            {disconnectDrive.isPending
              ? "Disconnecting…"
              : "Confirm Disconnect"}
          </button>
          <button data-ui="secondary"
            type="button"
            onClick={() => setConfirmOpen(false)}
            style={{ flex: 1, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
