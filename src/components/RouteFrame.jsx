import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteFrame({ children }) {
  const { pathname } = useLocation();
  const surface = pathname === "/get-app" ? "app"
    : pathname === "/privacy-policy" || pathname === "/terms-of-service" ? "legal"
      : /^\/(admin|staff|student)\//.test(pathname) ? "dashboard" : "public";

  // Reset before the destination paints. Explicit instant scrolling overrides
  // the smooth behavior used by links within a long public page.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return <div className="route-frame" data-surface={surface}>{children}</div>;
}
