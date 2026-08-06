import { useState } from "react";
import { Search, FolderPlus, Folder, Loader2 } from "lucide-react";
import {
  useDriveFolders,
  useSelectDriveFolder,
  useCreateDriveFolder,
} from "../../../../hooks/useDrive";

export default function FolderPicker({ onDone }) {
  const [search, setSearch] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [mode, setMode] = useState("browse"); // browse | create
  const { data, isLoading, isFetching } = useDriveFolders(search);
  const selectFolder = useSelectDriveFolder();
  const createFolder = useCreateDriveFolder();

  const folders = data?.folders ?? [];

  async function handleSelect(folder) {
    try {
      await selectFolder.mutateAsync({
        folder_id: folder.id,
        folder_name: folder.name,
      });
      onDone?.();
    } catch (err) {
      console.error("Failed to select folder:", err);
    }
  }

  async function handleCreate() {
    if (!newFolderName.trim()) return;
    try {
      await createFolder.mutateAsync(newFolderName.trim());
      onDone?.();
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  }

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
      <h3
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          color: "#031c36",
          margin: 0,
        }}
      >
        Choose a Drive folder
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#4b5563",
          margin: "6px 0 20px",
        }}
      >
        Pick where approved documents will be archived, or create a new folder.
      </p>

      <div className="flex" style={{ gap: "8px", marginBottom: "18px" }}>
        <button
          type="button"
          onClick={() => setMode("browse")}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: mode === "browse" ? "#031c36" : "#f3f4f6",
            color: mode === "browse" ? "#fff" : "#374151",
          }}
        >
          Existing Folder
        </button>
        <button
          type="button"
          onClick={() => setMode("create")}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: mode === "create" ? "#031c36" : "#f3f4f6",
            color: mode === "create" ? "#fff" : "#374151",
          }}
        >
          New Folder
        </button>
      </div>

      {mode === "browse" ? (
        <>
          <div className="relative" style={{ marginBottom: "14px" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "15px",
                height: "15px",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search folders…"
              style={{
                width: "100%",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 12px 9px 36px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                outline: "none",
              }}
            />
          </div>

          {isLoading ? (
            <div
              className="flex items-center justify-center"
              style={{ padding: "24px 0" }}
            >
              <Loader2
                className="animate-spin"
                style={{ width: "20px", height: "20px", color: "#1f5cae" }}
              />
            </div>
          ) : folders.length === 0 ? (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#9ca3af",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              {isFetching ? "Searching…" : "No folders found."}
            </p>
          ) : (
            <div
              style={{
                maxHeight: "260px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleSelect(folder)}
                  disabled={selectFolder.isPending}
                  className="flex items-center justify-between"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="flex items-center"
                    style={{ gap: "10px", minWidth: 0 }}
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
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {folder.name}
                    </span>
                  </span>
                  {selectFolder.isPending &&
                    selectFolder.variables?.folder_id === folder.id && (
                      <Loader2
                        className="animate-spin"
                        style={{
                          width: "14px",
                          height: "14px",
                          color: "#1f5cae",
                        }}
                      />
                    )}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            style={{
              width: "100%",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "9px 13px",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              outline: "none",
              marginBottom: "14px",
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={createFolder.isPending || !newFolderName.trim()}
            className="flex items-center justify-center"
            style={{
              width: "100%",
              gap: "8px",
              padding: "10px 0",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#facc15",
              color: "#031c36",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              cursor:
                createFolder.isPending || !newFolderName.trim()
                  ? "not-allowed"
                  : "pointer",
              opacity:
                createFolder.isPending || !newFolderName.trim() ? 0.6 : 1,
            }}
          >
            {createFolder.isPending ? (
              <Loader2
                className="animate-spin"
                style={{ width: "15px", height: "15px" }}
              />
            ) : (
              <FolderPlus style={{ width: "15px", height: "15px" }} />
            )}
            {createFolder.isPending ? "Creating…" : "Create & Use Folder"}
          </button>
        </div>
      )}

      {(selectFolder.isError || createFolder.isError) && (
        <p
          style={{
            color: "#dc2626",
            fontSize: "12px",
            marginTop: "12px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
