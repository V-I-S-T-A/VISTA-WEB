import { CheckCircle2, Folder, LogOut } from "lucide-react";
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
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
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
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle2
            style={{ width: "20px", height: "20px", color: "#16a34a" }}
          />
        </div>
        <div>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
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
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#6b7280",
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
          borderRadius: "10px",
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
                fontFamily: "Inter, sans-serif",
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
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#9ca3af",
                margin: 0,
              }}
            >
              Last synced: {lastSynced}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeFolder}
          className="font-inter font-bold"
          style={{
            fontSize: "12px",
            color: "#1f5cae",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Change
        </button>
      </div>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center justify-center"
          style={{
            width: "100%",
            gap: "8px",
            padding: "10px 0",
            borderRadius: "8px",
            border: "1.5px solid #fecaca",
            backgroundColor: "#fff",
            color: "#dc2626",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          <LogOut style={{ width: "14px", height: "14px" }} />
          Disconnect Google Drive
        </button>
      ) : (
        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnectDrive.isPending}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#dc2626",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              cursor: disconnectDrive.isPending ? "not-allowed" : "pointer",
              opacity: disconnectDrive.isPending ? 0.7 : 1,
            }}
          >
            {disconnectDrive.isPending
              ? "Disconnecting…"
              : "Confirm Disconnect"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "8px",
              border: "1.5px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
