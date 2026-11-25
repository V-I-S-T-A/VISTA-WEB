import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  CloudCheck,
  FilePlus2,
  FileText,
  FolderSearch,
  History,
  List,
  Lock,
  LogIn,
  Menu,
  MessageSquare,
  Monitor,
  Printer,
  ScanLine,
  Search,
  Shield,
  Sliders,
  Smartphone,
  UserPlus,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { MANUAL_ROLE_ORDER, USER_MANUAL_ROLES } from "../config/userManualData";
import vistaLogo from "../assets/shared/vista_logo.webp";
import "./UserManual.css";

const ICON_MAP = {
  briefcase: Briefcase,
  users: Users,
  shield: Shield,
  "log-in": LogIn,
  "file-plus": FilePlus2,
  "clipboard-check": ClipboardCheck,
  cloud: Cloud,
  smartphone: Smartphone,
  "scan-line": ScanLine,
  "message-square": MessageSquare,
  "cloud-check": CloudCheck,
  search: Search,
  "file-text": FileText,
  "folder-search": FolderSearch,
  bell: Bell,
  lock: Lock,
  "user-plus": UserPlus,
  sliders: Sliders,
  history: History,
};

function ManualIcon({ name, size = 18 }) {
  const IconComponent = ICON_MAP[name] || FileText;
  return <IconComponent size={size} aria-hidden="true" />;
}

function buildStepHash(roleId, moduleId, stepNumber) {
  return `#/${roleId}/${moduleId}/${stepNumber}`;
}

function parseManualHash(hashString) {
  const segments = (hashString || "")
    .replace(/^#\/?/, "")
    .trim()
    .split("/")
    .filter(Boolean);

  if (segments[0]?.toLowerCase() === "full-manual") {
    const validFilters = ["all", ...MANUAL_ROLE_ORDER];
    const maybeFilter = segments[1]?.toLowerCase();
    const activeFilter = validFilters.includes(maybeFilter) ? maybeFilter : "all";
    const scrollTarget = validFilters.includes(maybeFilter) ? segments[2] || null : segments[1] || null;
    return { view: "full-manual", activeFilter, scrollTarget };
  }

  const requestedRole = segments[0]?.toLowerCase();
  const roleId = USER_MANUAL_ROLES[requestedRole] ? requestedRole : MANUAL_ROLE_ORDER[0];
  const roleData = USER_MANUAL_ROLES[roleId];

  const requestedModule = segments[1];
  const moduleData = roleData.modules.find((m) => m.id === requestedModule) || roleData.modules[0];

  const requestedStep = Number.parseInt(segments[2], 10);
  const stepData =
    moduleData.steps.find((s) => s.number === requestedStep) || moduleData.steps[0];

  return {
    view: "step",
    roleId,
    moduleId: moduleData.id,
    stepNumber: stepData.number,
  };
}

function LightboxModal({ item, onClose }) {
  const dialogRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [item]);

  if (!item) return null;

  return (
    <dialog
      ref={dialogRef}
      className="um-lightbox-dialog"
      aria-label={item.caption}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="um-lightbox-container">
        <div className="um-lightbox-toolbar">
          <span className="um-lightbox-caption">{item.caption}</span>
          <div className="um-lightbox-actions">
            <button
              type="button"
              className="um-lightbox-btn"
              onClick={() => setZoomed((z) => !z)}
            >
              {zoomed ? <ZoomOut size={16} aria-hidden="true" /> : <ZoomIn size={16} aria-hidden="true" />}
              <span>{zoomed ? "Fit screen" : "Zoom"}</span>
            </button>
            <button type="button" className="um-lightbox-btn" onClick={onClose}>
              <X size={16} aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
        </div>
        <div className="um-lightbox-viewport">
          <img
            src={item.src}
            alt={item.caption}
            className={`um-lightbox-img ${zoomed ? "is-zoomed" : ""}`}
            onClick={() => setZoomed((z) => !z)}
          />
        </div>
      </div>
    </dialog>
  );
}

function buildPageLayout(roles) {
  let pageCounter = 2;
  return roles.map((role) => {
    const startPage = pageCounter;
    const modules = role.modules.map((mod) => {
      const page = pageCounter;
      pageCounter += 1;
      return { ...mod, pageNumber: page };
    });
    return { role, startPage, modules };
  });
}

function FullManualView({ activeFilter, scrollTarget, onOpenLightbox }) {
  const visibleRoles = useMemo(
    () =>
      activeFilter === "all"
        ? MANUAL_ROLE_ORDER.map((id) => USER_MANUAL_ROLES[id])
        : [USER_MANUAL_ROLES[activeFilter]].filter(Boolean),
    [activeFilter]
  );

  const pageLayout = useMemo(() => buildPageLayout(visibleRoles), [visibleRoles]);

  useEffect(() => {
    if (!scrollTarget) return;
    const timer = setTimeout(() => {
      const target = document.getElementById(scrollTarget);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
    return () => clearTimeout(timer);
  }, [scrollTarget, activeFilter]);

  const scrollToSection = (event, targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="um-full-manual-wrapper">
      <div className="um-full-manual-toolbar um-no-print">
        <div className="um-full-manual-toolbar-left">
          <div className="um-part-filter-group" role="navigation" aria-label="Filter manual sections">
            <a
              href="#/full-manual/all"
              className={`um-part-filter-btn ${activeFilter === "all" ? "active" : ""}`}
            >
              All Roles
            </a>
            {MANUAL_ROLE_ORDER.map((id) => (
              <a
                key={id}
                href={`#/full-manual/${id}`}
                className={`um-part-filter-btn ${activeFilter === id ? "active" : ""}`}
              >
                {USER_MANUAL_ROLES[id].shortLabel}
              </a>
            ))}
          </div>
        </div>
        <div className="um-full-manual-toolbar-right">
          <button
            type="button"
            className="um-doc-action-pill primary"
            onClick={() => window.print()}
          >
            <Printer size={15} aria-hidden="true" />
            <span>Print / Save PDF</span>
          </button>
          <a href="#/student-org/01-web-find-submission/1" className="um-doc-action-pill">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Interactive Guide</span>
          </a>
        </div>
      </div>

      {/* Sheet 1: Table of Contents */}
      <section id="doc-toc" className="um-doc-sheet um-toc-sheet" aria-labelledby="doc-toc-title">
        <div className="um-doc-running-header">
          <span className="um-running-header-title">VISTA User Manual</span>
        </div>

        <h1 id="doc-toc-title" className="um-doc-main-title">
          VISTA User Manual — Table of Contents
        </h1>
        <p className="um-doc-intro">
          Use the section for your device and account role. OSA staff register and review event
          documents. Student organization representatives track their organization’s documents and
          follow up on staff feedback.
        </p>

        <div className="um-toc-entries">
          {pageLayout.map(({ role, startPage, modules }) => (
            <div key={role.id} className="um-toc-part-block">
              <div className="um-toc-level-part">
                <a
                  href={`#part-${role.id}`}
                  className="um-toc-link"
                  onClick={(e) => scrollToSection(e, `part-${role.id}`)}
                >
                  <span>{role.partLabel}</span>
                  <span className="um-toc-dots" aria-hidden="true" />
                  <span className="um-toc-page">{startPage}</span>
                </a>
              </div>
              {modules.map((mod) => (
                <div key={mod.id}>
                  <div className="um-toc-level-module">
                    <a
                      href={`#mod-${role.id}-${mod.id}`}
                      className="um-toc-link"
                      onClick={(e) => scrollToSection(e, `mod-${role.id}-${mod.id}`)}
                    >
                      <span>{mod.title}</span>
                      <span className="um-toc-dots" aria-hidden="true" />
                      <span className="um-toc-page">{mod.pageNumber}</span>
                    </a>
                  </div>
                  {mod.steps.map((step) => (
                    <div key={step.number} className="um-toc-level-step">
                      <a
                        href={`#step-${role.id}-${mod.id}-${step.number}`}
                        className="um-toc-link"
                        onClick={(e) =>
                          scrollToSection(e, `step-${role.id}-${mod.id}-${step.number}`)
                        }
                      >
                        <span>
                          Step {step.number}: {step.title}
                        </span>
                        <span className="um-toc-dots" aria-hidden="true" />
                        <span className="um-toc-page">{mod.pageNumber}</span>
                      </a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <footer className="um-doc-running-footer">
          <span>VISTA User Manual</span>
          <span>Office of Student Affairs · Page 1</span>
        </footer>
      </section>

      {/* Content Sheets */}
      {pageLayout.map(({ role, modules }) => (
        <section
          key={role.id}
          id={`part-${role.id}`}
          className="um-manual-part-section"
          aria-label={role.partLabel}
        >
          {modules.map((mod, modIndex) => (
            <article
              key={mod.id}
              id={`mod-${role.id}-${mod.id}`}
              className="um-doc-sheet"
            >
              <div className="um-doc-running-header">
                <span />
                <span className="um-running-header-title">VISTA User Manual</span>
                <a
                  href="#doc-toc"
                  className="um-toc-back-link um-no-print"
                  onClick={(e) => scrollToSection(e, "doc-toc")}
                >
                  ↑ Back to TOC
                </a>
              </div>

              {modIndex === 0 && (
                <div className="um-doc-part-inline-header">
                  <h2 className="um-doc-part-heading">{role.partLabel}</h2>
                  <p className="um-doc-part-desc">{role.description}</p>
                </div>
              )}

              <div className="um-doc-module-header">
                <div className="um-doc-module-title-row">
                  <h3 className="um-doc-module-heading">{mod.title}</h3>
                  <a
                    href={buildStepHash(role.id, mod.id, 1)}
                    className="um-open-interactive-link um-no-print"
                  >
                    Open Interactive View →
                  </a>
                </div>
                <p className="um-doc-module-overview">{mod.overview}</p>
              </div>

              <div className="um-doc-steps-list">
                {mod.steps.map((step) => (
                  <div
                    key={step.number}
                    id={`step-${role.id}-${mod.id}-${step.number}`}
                    className="um-doc-step-block"
                  >
                    <div className="um-doc-step-header">
                      <h4 className="um-doc-step-title">
                        <span className="um-doc-step-num">Step {step.number}:</span>
                        {step.title}
                      </h4>
                      <a
                        href={buildStepHash(role.id, mod.id, step.number)}
                        className="um-doc-step-jump-link um-no-print"
                      >
                        Interactive Step
                      </a>
                    </div>

                    <div
                      className={`um-doc-step-body-flow ${step.image ? "" : "no-image"}`}
                    >
                      <div className="um-doc-step-instructions">
                        <ol>
                          {step.instructions.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ol>
                        {step.callout && (
                          <div className={`um-callout um-callout-${step.callout.type}`}>
                            <div className="um-callout-tag">{step.callout.label}</div>
                            <div className="um-callout-content">{step.callout.text}</div>
                          </div>
                        )}
                      </div>

                      {step.image && (
                        <figure className="um-doc-screenshot-frame">
                          <img
                            src={step.image}
                            alt={step.screenAlt}
                            className="um-doc-screenshot-img"
                            loading="lazy"
                            onClick={() =>
                              onOpenLightbox({
                                src: step.image,
                                caption: `${role.label} — ${mod.title} — Step ${step.number}: ${step.title}`,
                              })
                            }
                          />
                          <figcaption className="um-doc-screenshot-caption">
                            {step.screenLabel}
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <footer className="um-doc-running-footer">
                <span>VISTA User Manual · {role.label}</span>
                <span>Page {mod.pageNumber}</span>
              </footer>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function UserManual() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);

  const parsed = useMemo(() => parseManualHash(hash), [hash]);

  useEffect(() => {
    const prev = document.title;
    document.title = "User Manual | VISTA";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    if (!hash) {
      navigate({ hash: "#/student-org/01-web-find-submission/1" }, { replace: true });
    }
  }, [hash, navigate]);

  useEffect(() => {
    if (parsed.view === "step") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash, parsed.view]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const activeRoleId =
    parsed.view === "full-manual"
      ? parsed.activeFilter === "all"
        ? "student-org"
        : parsed.activeFilter
      : parsed.roleId;

  const activeRole = USER_MANUAL_ROLES[activeRoleId];
  const activeModule =
    parsed.view === "step"
      ? activeRole.modules.find((m) => m.id === parsed.moduleId) || activeRole.modules[0]
      : null;
  const activeStep =
    parsed.view === "step" && activeModule
      ? activeModule.steps.find((s) => s.number === parsed.stepNumber) || activeModule.steps[0]
      : null;

  const stepIndex = activeModule
    ? activeModule.steps.findIndex((s) => s.number === activeStep.number)
    : -1;
  const prevStep = stepIndex > 0 ? activeModule.steps[stepIndex - 1] : null;
  const nextStep =
    activeModule && stepIndex < activeModule.steps.length - 1
      ? activeModule.steps[stepIndex + 1]
      : null;

  return (
    <div className="um-page">
      <a href="#um-main-content" className="um-skip-link">
        Skip to main content
      </a>

      <div
        className={`um-drawer-backdrop ${drawerOpen ? "drawer-open" : ""}`}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      <header className="um-header">
        <div className="um-header-container">
          <div className="um-header-brand-row">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <a href="#/student-org/01-web-find-submission/1" className="um-brand-badge">
                <img src={vistaLogo} alt="VISTA" className="um-brand-icon" />
                <div className="um-brand-titles">
                  <span className="um-brand-name">
                    VIS<span>TA</span>
                  </span>
                  <span className="um-brand-subtitle">User Manual</span>
                </div>
              </a>
              <Link
                to="/get-app"
                className="um-back-getapp"
                aria-label="Back to Get the VISTA app"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>Get App</span>
              </Link>
            </div>

            <button
              type="button"
              className="um-mobile-menu-btn"
              aria-label="Open guide topics menu"
              aria-expanded={drawerOpen}
              aria-controls="um-sidebar"
              onClick={() => setDrawerOpen((open) => !open)}
            >
              <Menu size={18} aria-hidden="true" />
              <span>Topics</span>
            </button>
          </div>

          <nav className="um-role-tabs-wrapper" aria-label="Select user role">
            <div className="um-role-tabs-nav" role="tablist">
              {MANUAL_ROLE_ORDER.map((roleKey) => {
                const role = USER_MANUAL_ROLES[roleKey];
                const firstMod = role.modules[0];
                const targetHref = buildStepHash(
                  role.id,
                  firstMod.id,
                  firstMod.steps[0].number
                );
                const isActive = parsed.view === "step" && activeRoleId === role.id;
                return (
                  <a
                    key={role.id}
                    href={targetHref}
                    role="tab"
                    aria-selected={isActive}
                    className={`um-role-tab ${isActive ? "active" : ""}`}
                  >
                    <span className="um-role-icon">
                      <ManualIcon name={role.icon} size={16} />
                    </span>
                    <span>{role.shortLabel}</span>
                  </a>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="um-mobile-topic-bar">
          <label htmlFor="um-mobile-module-select" className="um-mobile-topic-label">
            Topic:
          </label>
          <div className="um-mobile-topic-select-wrap">
            <select
              id="um-mobile-module-select"
              className="um-mobile-module-select"
              value={activeModule?.id || ""}
              onChange={(e) => {
                if (e.target.value) {
                  navigate({ hash: buildStepHash(activeRole.id, e.target.value, 1) });
                }
              }}
            >
              {activeRole.modules.map((mod, idx) => (
                <option key={mod.id} value={mod.id}>
                  {idx + 1}. {mod.title}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="um-select-chevron-icon" aria-hidden="true" />
          </div>
        </div>
      </header>

      <div className="um-layout">
        <aside
          id="um-sidebar"
          className={`um-sidebar ${drawerOpen ? "drawer-open" : ""}`}
          aria-label="Guide topics list"
        >
          <div className="um-sidebar-header-bar">
            <span className="um-sidebar-header-title">Guide Topics</span>
            <button
              type="button"
              className="um-sidebar-close-btn"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close guide topics menu"
            >
              <X size={16} aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>

          <div className="um-sidebar-full-manual-box">
            <a
              href="#/full-manual"
              className={`um-full-manual-sidebar-btn ${
                parsed.view === "full-manual" ? "active" : ""
              }`}
              aria-current={parsed.view === "full-manual" ? "page" : undefined}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="um-mod-icon">
                <List size={17} aria-hidden="true" />
              </span>
              <span className="um-mod-title">Full Manual &amp; Table of Contents</span>
              <span className="um-mod-step-badge">All Docs</span>
            </a>
          </div>

          <nav aria-label="Modules list">
            <ul className="um-module-nav-list">
              {activeRole.modules.map((mod) => {
                const isActive = parsed.view === "step" && activeModule?.id === mod.id;
                return (
                  <li key={mod.id}>
                    <a
                      href={buildStepHash(activeRole.id, mod.id, mod.steps[0].number)}
                      className={`um-module-nav-link ${isActive ? "active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <span className="um-mod-icon">
                        <ManualIcon name={mod.icon} size={17} />
                      </span>
                      <span className="um-mod-title">{mod.title}</span>
                      <span className="um-mod-step-badge">
                        {mod.steps.length} {mod.steps.length === 1 ? "step" : "steps"}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main id="um-main-content" className="um-main" tabIndex={-1}>
          {parsed.view === "full-manual" ? (
            <FullManualView
              activeFilter={parsed.activeFilter}
              scrollTarget={parsed.scrollTarget}
              onOpenLightbox={setLightboxItem}
            />
          ) : (
            <>
              <header className="um-module-header-card">
                <div className="um-module-header-top-row">
                  <nav className="um-module-breadcrumb" aria-label="Breadcrumb">
                    <span>{activeRole.label}</span>
                    <span className="um-breadcrumb-separator" aria-hidden="true">
                      ›
                    </span>
                    <span className="um-breadcrumb-current">{activeModule.title}</span>
                  </nav>
                  <div className="um-module-doc-actions">
                    <a href="#/full-manual" className="um-doc-action-pill">
                      <List size={15} aria-hidden="true" />
                      <span>Full Manual &amp; TOC</span>
                    </a>
                    <button
                      type="button"
                      className="um-doc-action-pill"
                      onClick={() => window.print()}
                    >
                      <Printer size={15} aria-hidden="true" />
                      <span>Print / Save PDF</span>
                    </button>
                  </div>
                </div>
                <h1 className="um-module-title">{activeModule.title}</h1>
                <p className="um-module-overview">{activeModule.overview}</p>
              </header>

              <article className="um-step-card" aria-labelledby="um-current-step-heading">
                <div className="um-step-meta-bar">
                  <span className="um-step-progress-badge">
                    Step {activeStep.number} of {activeModule.steps.length}
                  </span>

                  <div className="um-step-quick-jump">
                    <label htmlFor="um-step-select" className="um-step-select-label">
                      Jump to step:
                    </label>
                    <select
                      id="um-step-select"
                      className="um-step-select-dropdown"
                      value={activeStep.number}
                      onChange={(e) => {
                        const targetStep = Number.parseInt(e.target.value, 10);
                        if (!Number.isNaN(targetStep)) {
                          navigate({
                            hash: buildStepHash(activeRole.id, activeModule.id, targetStep),
                          });
                        }
                      }}
                    >
                      {activeModule.steps.map((s) => (
                        <option key={s.number} value={s.number}>
                          Step {s.number}: {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h2 id="um-current-step-heading" className="um-step-heading">
                  <span className="um-step-num-prefix">Step {activeStep.number}:</span>
                  {activeStep.title}
                </h2>

                <div className="um-step-viewer-grid">
                  <div className="um-step-screenshot-column">
                    {activeStep.image ? (
                      <figure className="um-screenshot-figure">
                        <div
                          className="um-screenshot-img-container"
                          onClick={() =>
                            setLightboxItem({
                              src: activeStep.image,
                              caption: `${activeRole.label} — ${activeModule.title} — Step ${activeStep.number}: ${activeStep.title}`,
                            })
                          }
                        >
                          <img
                            src={activeStep.image}
                            alt={activeStep.screenAlt}
                            className="um-screenshot-img"
                            loading="lazy"
                          />
                        </div>
                        <figcaption className="um-screenshot-caption">
                          <button
                            type="button"
                            className="um-enlarge-btn"
                            onClick={() =>
                              setLightboxItem({
                                src: activeStep.image,
                                caption: `${activeRole.label} — ${activeModule.title} — Step ${activeStep.number}: ${activeStep.title}`,
                              })
                            }
                          >
                            <ZoomIn size={15} aria-hidden="true" />
                            <span>Enlarge screen</span>
                          </button>
                        </figcaption>
                      </figure>
                    ) : (
                      <div className="um-screenshot-placeholder">
                        <span className="um-placeholder-icon">
                          {activeModule.platform === "Mobile App" ? (
                            <Smartphone size={20} aria-hidden="true" />
                          ) : (
                            <Monitor size={20} aria-hidden="true" />
                          )}
                        </span>
                        <div className="um-placeholder-content">
                          <span className="um-placeholder-title">{activeStep.screenLabel}</span>
                          <span className="um-placeholder-desc">{activeStep.screenAlt}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="um-step-instructions-column um-markdown-body">
                    <ol>
                      {activeStep.instructions.map((instruction) => (
                        <li key={instruction}>{instruction}</li>
                      ))}
                    </ol>

                    {activeStep.callout && (
                      <div className={`um-callout um-callout-${activeStep.callout.type}`}>
                        <div className="um-callout-tag">{activeStep.callout.label}</div>
                        <div className="um-callout-content">{activeStep.callout.text}</div>
                      </div>
                    )}
                  </div>
                </div>

                <nav className="um-step-nav-footer" aria-label="Step navigation">
                  <a
                    href={
                      prevStep
                        ? buildStepHash(activeRole.id, activeModule.id, prevStep.number)
                        : "#"
                    }
                    className={`um-step-nav-btn prev-btn ${prevStep ? "" : "disabled"}`}
                    aria-disabled={!prevStep}
                    onClick={(e) => {
                      if (!prevStep) e.preventDefault();
                    }}
                  >
                    <span className="um-nav-icon">
                      <ArrowLeft size={18} aria-hidden="true" />
                    </span>
                    <span className="um-nav-text">
                      <span className="um-nav-direction">Previous</span>
                      <span className="um-nav-step-title">
                        {prevStep ? `Step ${prevStep.number}: ${prevStep.title}` : "Start of topic"}
                      </span>
                    </span>
                  </a>

                  <a
                    href={
                      nextStep
                        ? buildStepHash(activeRole.id, activeModule.id, nextStep.number)
                        : "#"
                    }
                    className={`um-step-nav-btn next-btn ${nextStep ? "" : "disabled"}`}
                    aria-disabled={!nextStep}
                    onClick={(e) => {
                      if (!nextStep) e.preventDefault();
                    }}
                  >
                    <span className="um-nav-text">
                      <span className="um-nav-direction">Next</span>
                      <span className="um-nav-step-title">
                        {nextStep ? `Step ${nextStep.number}: ${nextStep.title}` : "End of topic"}
                      </span>
                    </span>
                    <span className="um-nav-icon">
                      <ArrowRight size={18} aria-hidden="true" />
                    </span>
                  </a>
                </nav>
              </article>
            </>
          )}
        </main>
      </div>

      <LightboxModal
        key={lightboxItem?.src || "closed"}
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />
    </div>
  );
}
