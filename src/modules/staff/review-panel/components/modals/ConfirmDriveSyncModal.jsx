import { useState, useEffect } from "react";
import {
  X,
  HardDrive,
  Folder,
  FolderPlus,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useDriveConnection,
  useDriveFolders,
  useSelectDriveFolder,
  useCreateDriveFolder,
} from "../../../../../hooks/useDrive";

export default function ConfirmDriveSyncModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  submission,
  statusAction,
  remarks,
}) {
  const { data: driveConn, isLoading: isLoadingConn } = useDriveConnection();
  const [folderMode, setFolderMode] = useState("browse"); // browse | create
  const [search, setSearch] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);

  const { data: folderData, isLoading: isLoadingFolders, isFetching } =
    useDriveFolders(search);
  const selectFolderMutation = useSelectDriveFolder();
  const createFolderMutation = useCreateDriveFolder();

  const folders = folderData?.folders ?? [];
  const isDriveConnected = driveConn?.connected ?? false;

  useEffect(() => {
    if (driveConn?.target_folder_name) {
      setSelectedFolder({
        id: driveConn.target_folder_id,
        name: driveConn.target_folder_name,
      });
    }
  }, [driveConn]);

  if (!isOpen) return null;

  const handleSelectFolder = async (folder) => {
    try {
      await selectFolderMutation.mutateAsync({
        folder_id: folder.id,
        folder_name: folder.name,
      });
      setSelectedFolder(folder);
    } catch (err) {
      console.error("Failed to select folder:", err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await createFolderMutation.mutateAsync(newFolderName.trim());
      setSelectedFolder({
        id: res.id || res.folder_id,
        name: res.name || newFolderName.trim(),
      });
      setNewFolderName("");
      setFolderMode("browse");
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  const handleFinalSubmit = () => {
    onConfirm({
      folder_id: selectedFolder?.id,
      folder_name: selectedFolder?.name,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "88vh",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "#1f5cae",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <HardDrive style={{ width: "18px", height: "18px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                Confirm Submission to Drive
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.85)",
                  margin: "2px 0 0",
                  lineHeight: "1.2",
                }}
              >
                Double Authentication &amp; Drive Folder Target
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              opacity: isSubmitting ? 0.5 : 1,
            }}
            aria-label="Close modal"
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Decision Target Summary */}
          <div
            style={{
              background: "#f8f9fc",
              border: "1.5px solid #e5e7eb",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Decision Target
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#1f5cae",
                  background: "#eaf1ff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                #{submission?.id?.slice(0, 8)}
              </span>
            </div>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
                lineHeight: "1.3",
              }}
            >
              {submission?.title || "Untitled Document"}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Action:
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#15803d",
                  background: "#dcfce7",
                  padding: "2px 10px",
                  borderRadius: "99px",
                }}
              >
                {statusAction}
              </span>
            </div>

            {remarks && (
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "#4b5563",
                  fontStyle: "italic",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  margin: "4px 0 0",
                }}
              >
                &ldquo;{remarks}&rdquo;
              </p>
            )}
          </div>

          {/* Drive Storage Folder Section */}
          <div
            style={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                Google Drive Storage Folder
              </label>
              {isDriveConnected && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#15803d",
                    background: "#f0fdf4",
                    padding: "2px 8px",
                    borderRadius: "99px",
                  }}
                >
                  <CheckCircle2 style={{ width: "12px", height: "12px", color: "#16a34a" }} />
                  Connected
                </span>
              )}
            </div>

            {!isDriveConnected && !isLoadingConn ? (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <AlertCircle
                  style={{
                    width: "18px",
                    height: "18px",
                    color: "#d97706",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                />
                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#92400e",
                      margin: 0,
                    }}
                  >
                    Google Drive Not Connected
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#b45309",
                      margin: "2px 0 0",
                      lineHeight: "1.3",
                    }}
                  >
                    You can still submit your decision to the database now. Connect your Google Drive in staff settings to sync files automatically.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Active Folder Pill */}
                {selectedFolder && (
                  <div
                    style={{
                      background: "#f0f7ff",
                      border: "1px solid #cce3ff",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Folder
                        style={{
                          width: "16px",
                          height: "16px",
                          color: "#f59e0b",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#1e3a8a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedFolder.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#1d4ed8",
                        background: "#ffffff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px solid #bfdbfe",
                        textTransform: "uppercase",
                      }}
                    >
                      Active Target
                    </span>
                  </div>
                )}

                {/* Mode Selector Tabs */}
                <div
                  style={{
                    display: "flex",
                    background: "#f3f4f6",
                    padding: "3px",
                    borderRadius: "8px",
                    gap: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFolderMode("browse")}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: folderMode === "browse" ? "#ffffff" : "transparent",
                      color: folderMode === "browse" ? "#111827" : "#6b7280",
                      boxShadow: folderMode === "browse" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Select Existing Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderMode("create")}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: folderMode === "create" ? "#ffffff" : "transparent",
                      color: folderMode === "create" ? "#111827" : "#6b7280",
                      boxShadow: folderMode === "create" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Create New Folder
                  </button>
                </div>

                {folderMode === "browse" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ position: "relative" }}>
                      <Search
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "14px",
                          height: "14px",
                          color: "#9ca3af",
                        }}
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Drive folders…"
                        style={{
                          width: "100%",
                          border: "1.5px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "8px 12px 8px 34px",
                          fontSize: "12px",
                          fontFamily: "Inter, sans-serif",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {isLoadingFolders ? (
                      <div style={{ padding: "16px 0", textAlign: "center" }}>
                        <Loader2
                          className="animate-spin"
                          style={{ width: "18px", height: "18px", color: "#1f5cae", margin: "0 auto" }}
                        />
                      </div>
                    ) : folders.length === 0 ? (
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#9ca3af",
                          textAlign: "center",
                          padding: "14px 0",
                          margin: 0,
                        }}
                      >
                        {isFetching ? "Searching…" : "No folders found."}
                      </p>
                    ) : (
                      <div
                        style={{
                          maxHeight: "150px",
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {folders.map((folder) => {
                          const isSelected = selectedFolder?.id === folder.id;
                          return (
                            <button
                              key={folder.id}
                              type="button"
                              onClick={() => handleSelectFolder(folder)}
                              disabled={selectFolderMutation.isPending}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                borderRadius: "7px",
                                border: isSelected ? "1.5px solid #f59e0b" : "1px solid #e5e7eb",
                                backgroundColor: isSelected ? "#fffbeb" : "#f9fafb",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  overflow: "hidden",
                                }}
                              >
                                <Folder
                                  style={{
                                    width: "15px",
                                    height: "15px",
                                    color: "#f59e0b",
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: isSelected ? "#92400e" : "#111827",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {folder.name}
                                </span>
                              </div>
                              {isSelected && (
                                <CheckCircle2
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    color: "#d97706",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name (e.g. SARF Submissions 2026)"
                      style={{
                        width: "100%",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontFamily: "Inter, sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateFolder}
                      disabled={createFolderMutation.isPending || !newFolderName.trim()}
                      style={{
                        width: "100%",
                        padding: "9px 0",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#ffc700",
                        color: "#031c36",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor:
                          createFolderMutation.isPending || !newFolderName.trim()
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          createFolderMutation.isPending || !newFolderName.trim() ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      {createFolderMutation.isPending ? (
                        <Loader2 className="animate-spin" style={{ width: "14px", height: "14px" }} />
                      ) : (
                        <FolderPlus style={{ width: "14px", height: "14px" }} />
                      )}
                      {createFolderMutation.isPending ? "Creating…" : "Create & Select Folder"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            background: "#f9fafb",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              background: "#ffffff",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 18px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#031c36",
              background: "#ffc700",
              border: "none",
              borderRadius: "8px",
              padding: "9px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" style={{ width: "15px", height: "15px" }} />
            ) : (
              <CheckCircle2 style={{ width: "15px", height: "15px" }} />
            )}
            {isSubmitting ? "CONFIRMING…" : "CONFIRM & SUBMIT TO DRIVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
