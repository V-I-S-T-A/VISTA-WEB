import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../hooks/useAuth";
import { accessScope } from "../utils/accessScope";
import PageSkeleton from "./loading/PageSkeleton";
import { tokenClaims } from "../services/realtimeService";

export default function AccessScopeBoundary({ children }) {
  const queryClient = useQueryClient();
  const { data: user, isPending, isError } = useCurrentUser({ poll: true });
  const [accountVersion, setAccountVersion] = useState(0);
  useEffect(() => {
    const changed = event => {
      if (event.type === "storage" && event.key !== "access_token" && event.key !== "refresh_token" && event.key !== null) return;
      // Token rotation for the same account must not remount reply composers.
      if (event.key === "refresh_token" && localStorage.getItem("access_token")) return;
      if (event.key === "access_token" && event.oldValue && event.newValue &&
          tokenClaims(event.oldValue).user_id === tokenClaims(event.newValue).user_id) return;
      queryClient.cancelQueries();
      queryClient.clear();
      setAccountVersion(value => value + 1);
    };
    window.addEventListener("storage", changed);
    window.addEventListener("vista:session-changed", changed);
    return () => {
      window.removeEventListener("storage", changed);
      window.removeEventListener("vista:session-changed", changed);
    };
  }, [queryClient]);
  const authenticated = Boolean(localStorage.getItem("access_token") || localStorage.getItem("refresh_token"));
  const privatePage = /^\/(student|staff|admin)\//.test(window.location.pathname);
  if (privatePage && authenticated && !user && (isPending || isError)) {
    return isError ? <p role="alert" className="p-6">Unable to verify your access. Refresh the page to try again.</p> : <PageSkeleton />;
  }
  return <div key={`${accountVersion}:${accessScope(user)}`} className="contents">{children}</div>;
}
