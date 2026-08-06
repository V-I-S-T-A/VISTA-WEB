import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { driveService } from "../../../services/driveService";
import { useQueryClient } from "@tanstack/react-query";

export default function GdriveCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("processing"); // processing | success | error
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const scope = searchParams.get("scope");
    const errorParam = searchParams.get("error");

    // Idempotency guard that survives StrictMode's double-invoke AND
    // accidental page refreshes on this same URL (auth codes are one-time use).
    const consumedKey = `gdrive_oauth_consumed_${code}`;
    if (hasRun.current || (code && sessionStorage.getItem(consumedKey))) {
      return;
    }
    hasRun.current = true;
    if (code) sessionStorage.setItem(consumedKey, "1");

    if (errorParam) {
      setStatus("error");
      setMessage("Google sign-in was cancelled or denied.");
      return;
    }
    if (!code || !state) {
      setStatus("error");
      setMessage("Missing authorization details from Google.");
      return;
    }

    // Belt-and-suspenders: never let this screen hang forever, even if
    // the request genuinely never resolves (dropped connection, etc.)
    const timeoutId = setTimeout(() => {
      setStatus((current) => {
        if (current === "processing") {
          setMessage("This is taking longer than expected. Please try again.");
          return "error";
        }
        return current;
      });
    }, 15000);

    (async () => {
      try {
        console.log("Exchanging Google auth code…", { state, scope });
        await driveService.completeAuth({ code, state, scope });
        clearTimeout(timeoutId);
        queryClient.invalidateQueries({ queryKey: ["drive-connection"] });
        setStatus("success");
        setTimeout(() => navigate("/staff/gdrive-sync"), 1200);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error(
          "Drive auth callback failed:",
          err?.response?.data || err,
        );
        setStatus("error");
        setMessage(
          err?.response?.data?.detail ||
            "Failed to complete Google Drive connection.",
        );
      }
    })();

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div style={{ textAlign: "center", maxWidth: "360px", padding: "24px" }}>
        {status === "processing" && (
          <>
            <Loader2
              className="animate-spin"
              style={{
                width: "36px",
                height: "36px",
                margin: "0 auto 16px",
                color: "#1f5cae",
              }}
            />
            <p className="font-inter font-semibold text-gray-700">
              Connecting your Google account…
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2
              style={{
                width: "36px",
                height: "36px",
                margin: "0 auto 16px",
                color: "#22c55e",
              }}
            />
            <p className="font-inter font-semibold text-gray-700">
              Connected! Redirecting…
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle
              style={{
                width: "36px",
                height: "36px",
                margin: "0 auto 16px",
                color: "#dc2626",
              }}
            />
            <p
              className="font-inter font-semibold text-gray-700"
              style={{ marginBottom: "12px" }}
            >
              {message}
            </p>
            <button
              type="button"
              onClick={() => navigate("/staff/gdrive-sync")}
              className="font-inter font-bold text-white"
              style={{
                backgroundColor: "#1f5cae",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Back to Google Drive Sync
            </button>
          </>
        )}
      </div>
    </div>
  );
}
