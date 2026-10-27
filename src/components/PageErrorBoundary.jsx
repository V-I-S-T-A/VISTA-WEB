import { Component } from "react";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { isPageLoadError, recoverBrowserPageLoad } from "../utils/pageLoadRecovery";
import vistaLogo from "../assets/shared/vista_logo.webp";

export default class PageErrorBoundary extends Component {
  state = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("VISTA page failed to open:", error, info);
    recoverBrowserPageLoad(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const loadFailed = isPageLoadError(this.state.error);
    return <main className="page-error" role="alert">
      <div className="page-error-card">
        <div className="page-error-heading">
          <span className="page-error-mark" aria-hidden="true"><TriangleAlert size={21} strokeWidth={2.25} /></span>
          <img className="page-error-logo" src={vistaLogo} alt="VISTA" />
        </div>
        <h1>{loadFailed ? "This page couldn’t finish loading." : "This page hit a problem."}</h1>
        <p>{loadFailed ? "Check your connection, then try opening it again." : "Reload the page to try again. If this continues, let the VISTA team know which page you were opening."}</p>
        <div className="page-error-actions">
          <button type="button" onClick={() => window.location.reload()}><RefreshCw size={17} aria-hidden="true" />Reload page</button>
          <a href="/"><ArrowLeft size={17} aria-hidden="true" />Back to VISTA</a>
        </div>
      </div>
    </main>;
  }
}
