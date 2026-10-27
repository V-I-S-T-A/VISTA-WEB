import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./footer";
import PageSkeleton from "./loading/PageSkeleton";
import PageErrorBoundary from "./PageErrorBoundary";

export default function PublicLayout() {
  const { pathname } = useLocation();
  const theme = pathname === "/get-app" ? "get-app-page"
    : pathname === "/privacy-policy" || pathname === "/terms-of-service" ? "legal-page"
      : pathname === "/login" ? "login-page" : "landing-page";

  return <div className={`public-layout ${theme}`}>
    <Header />
    <PageErrorBoundary key={pathname}><Suspense fallback={<PageSkeleton />}><Outlet /></Suspense></PageErrorBoundary>
    <Footer />
  </div>;
}
