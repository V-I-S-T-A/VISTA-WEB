import { useEffect } from "react";
import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";
import { useToast } from "../components/toastContext";
import { useQueryClient } from "@tanstack/react-query";

// Module-level tracking keeps upload polling alive while the review page unmounts.
const activePolls = new Map();
let nextBatchId = 0;
const DRIVE_PENDING_UPLOAD_STORAGE_KEY = "vista-drive-pending-upload-task-ids";

function readPersistedTasks() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DRIVE_PENDING_UPLOAD_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      // Keep accepting the legacy string-only format written by earlier builds.
      if (typeof item === "string" && item.length > 0) {
        return [{ taskId: item, submissionId: null }];
      }
      if (item && typeof item.taskId === "string" && item.taskId.length > 0) {
        return [{
          taskId: item.taskId,
          submissionId: typeof item.submissionId === "string" ? item.submissionId : null,
        }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function persistActivePolls() {
  if (typeof window === "undefined") return;

  try {
    const tasks = [...activePolls.entries()].map(([taskId, tracking]) => ({
      taskId,
      submissionId: tracking.submissionId || null,
    }));
    if (!tasks.length) {
      window.localStorage.removeItem(DRIVE_PENDING_UPLOAD_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      DRIVE_PENDING_UPLOAD_STORAGE_KEY,
      JSON.stringify(tasks),
    );
  } catch {
    // Ignore storage quota or browser privacy issues; in-memory polling still works.
  }
}

export function startBackgroundDriveUpload({
  submissionId,
  file,
  fileName,
  folderId,
  useAutoFolder = true,
  uploadKind = "approved",
}) {
  const formData = new FormData();
  formData.append("submission_id", submissionId);
  formData.append("file", file);
  formData.append("file_name", fileName || file.name);
  if (folderId) formData.append("folder_id", folderId);
  formData.append("use_auto_folder", useAutoFolder);
  formData.append("upload_kind", uploadKind);

  return apiClient
    .post(API_ENDPOINTS.DRIVE.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => ({
      taskId: res.data.task_id,
      submissionId: String(submissionId),
    }));
}

export function watchTasks(taskInputs) {
  if (!taskInputs.length) return;

  const tasks = taskInputs
    .map((item) => typeof item === "string" ? { taskId: item, submissionId: null } : item)
    .filter((item) => item && typeof item.taskId === "string" && item.taskId.length > 0);
  if (!tasks.length) return;

  const batch = {
    remaining: tasks.length,
    total: tasks.length,
    failures: [],
  };
  const batchId = `drive-upload-${++nextBatchId}`;
  tasks.forEach(({ taskId, submissionId }) =>
    activePolls.set(taskId, {
      batchId,
      batch,
      submissionId: submissionId || null,
      startedAt: Date.now(),
      pollFailures: 0,
      warned: false,
      delayWarned: false,
    }),
  );
  persistActivePolls();
}

export function useDriveUploadWatcher() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const restoredTasks = readPersistedTasks();
    if (restoredTasks.length) {
      watchTasks(restoredTasks);
    }

    let polling = false;
    const interval = setInterval(async () => {
      if (polling) return;
      polling = true;
      try {
        for (const [taskId, tracking] of activePolls) {
          try {
            const { data } = await apiClient.get(
              API_ENDPOINTS.DRIVE.UPLOAD_STATUS(taskId),
            );
            if (tracking.warned) {
              showToast("Google Drive upload status checks have resumed.", "success");
            }
            tracking.pollFailures = 0;
            tracking.warned = false;
            if (data.status === "pending") {
              if (!tracking.delayWarned && Date.now() - tracking.startedAt > 120000) {
                tracking.delayWarned = true;
                showToast("Google Drive is taking longer than expected. The upload is still unconfirmed; we will keep checking.", "error", 15000);
              }
              continue;
            }

            if (data.archive?.archive_id && tracking.submissionId) {
              window.dispatchEvent(new CustomEvent("vista:drive-archive-updated", {
                detail: { submissionId: tracking.submissionId },
              }));
            }

            activePolls.delete(taskId);
            persistActivePolls();

            if (data.status !== "success") {
              tracking.batch.failures.push(
                data.code === "drive_reauth_required"
                  ? "Google Drive needs to be reconnected."
                  : data.detail || "A Drive upload failed.",
              );
            }
            tracking.batch.remaining -= 1;
            if (tracking.batch.remaining === 0) {
              const { failures, total } = tracking.batch;
              showToast(
                failures.length
                  ? `${total - failures.length} of ${total} Drive file(s) uploaded. ${failures[0]}`
                  : `${total} file${total === 1 ? "" : "s"} archived to Google Drive.`,
                failures.length ? "error" : "success",
              );
              queryClient.invalidateQueries({ queryKey: ["submissions"] });
              queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
            }
          } catch {
            tracking.pollFailures += 1;
            if (tracking.pollFailures >= 3 && !tracking.warned) {
              tracking.warned = true;
              showToast("Could not check a Google Drive upload. Its completion is unconfirmed. Check your connection; we will keep retrying automatically.", "error", 15000);
            }
            // Retain the task so temporary network failures are retried.
          }
        }
      } finally {
        polling = false;
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showToast, queryClient]);
}

export function watchTask(taskId) {
  watchTasks([taskId]);
}
