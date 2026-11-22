import PageSkeleton from "../../../components/loading/PageSkeleton";
import { getApiErrorMessage } from "../../../utils/apiErrorMessage";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { driveService } from "../../../services/driveService";
import { useQueryClient } from "@tanstack/react-query";

export default function GdriveCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [callbackParams] = useState(() => Object.fromEntries(
    ['code', 'state', 'scope', 'error', 'status', 'detail'].map(key => [key, searchParams.get(key)]),
  ));
  const { code, state, scope, error: errorParam, status: statusParam, detail: detailParam } = callbackParams;
  const initialError = statusParam === "error" || errorParam
    ? detailParam || "Google sign-in was cancelled or denied."
    : (!code || !state) && statusParam !== "success" ? "Missing authorization details from Google." : "";
  const [status, setStatus] = useState(() => statusParam === "success" ? "success" : initialError ? "error" : "processing");
  const [message, setMessage] = useState(initialError);
  const hasRun = useRef(false);

  useEffect(() => {
    // 1. Backend already processed the OAuth code and redirected with status=success
    if (statusParam === "success") {
      queryClient.invalidateQueries({ queryKey: ["drive-connection"] });
      const timer = setTimeout(() => navigate("/staff/gdrive-sync"), 1200);
      return () => clearTimeout(timer);
    }

    // 2. Backend redirected with error or user cancelled
    if (statusParam === "error" || errorParam) {
      return;
    }

    // 3. Fallback: Code returned directly to frontend
    const consumedKey = `gdrive_oauth_consumed_${code}`;
    if (hasRun.current || (code && sessionStorage.getItem(consumedKey))) {
      return;
    }
    hasRun.current = true;
    if (code) sessionStorage.setItem(consumedKey, "1");

    if (!code || !state) {
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
          getApiErrorMessage(err, "Could not complete the Google Drive connection."),
        );
      }
    })();

    return () => clearTimeout(timeoutId);
  }, [code, state, scope, errorParam, statusParam, navigate, queryClient]);

  if (status === "processing") return <PageSkeleton />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div style={{ textAlign: "center", maxWidth: "360px", padding: "24px" }}>
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
            <button data-ui="navigation"
              type="button"
              onClick={() => navigate("/staff/gdrive-sync")}
              className="font-inter font-bold text-white"
              style={{
                backgroundColor: "var(--ui-blue)",
                padding: "10px 20px",
                borderRadius: "var(--radius-control)",
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
