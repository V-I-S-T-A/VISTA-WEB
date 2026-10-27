import { Component } from "react";
import { isPageLoadError, recoverBrowserPageLoad } from "../utils/pageLoadRecovery";

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
        <p className="page-error-brand">VISTA</p>
        <h1>{loadFailed ? "This page couldn’t finish loading." : "This page hit a problem."}</h1>
        <p>{loadFailed ? "Check your connection, then try opening it again." : "Reload the page to try again. If this continues, let the VISTA team know which page you were opening."}</p>
        <div className="page-error-actions">
          <button type="button" onClick={() => window.location.reload()}>Reload page</button>
          <a href="/">Back to VISTA</a>
        </div>
      </div>
    </main>;
  }
}
