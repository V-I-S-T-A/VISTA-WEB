import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { registerDialog } from '../utils/dialogFocus';
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, FileText } from 'lucide-react';

function createObjectUrlStore(file, fileUrl) {
  let current = '';
  return {
    snapshot: () => current,
    subscribe: notify => {
      if (file && !fileUrl) current = URL.createObjectURL(file);
      notify();
      return () => { if (current) URL.revokeObjectURL(current); current = ''; };
    },
  };
}

export default function AttachmentImagePreview({
  file,
  fileUrl,
  fileName,
  mimeType,
  children,
  triggerLabel = 'Preview attachment',
  triggerClassName,
}) {
  const objectUrl = useMemo(() => createObjectUrlStore(file, fileUrl), [file, fileUrl]);
  const localUrl = useSyncExternalStore(objectUrl.subscribe, objectUrl.snapshot, () => '');
  const url = fileUrl || localUrl;
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [baseWidth, setBaseWidth] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const imgRef = useRef(null);
  const dialogRef = useRef(null);
  const [focusTarget, setFocusTarget] = useState(null);

  useEffect(() => {
    if (!open) return;
    const unregister = registerDialog(dialogRef.current, { onDismiss: () => setOpen(false) });
    return () => {
      unregister();
      // The portal's autofocus runs before this effect. Restore the actual
      // attachment opener captured before mounting the preview.
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
    };
  }, [open, focusTarget]);

  // Restore focus when closing
  const handleClose = () => {
    setOpen(false);
  };

  const displayName = fileName || file?.name || 'Document';
  const isPdf = Boolean(
    (file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || ''))) ||
    mimeType === 'application/pdf' ||
    /\.pdf$/i.test(fileName || '') ||
    /\.pdf($|\?)/i.test(fileUrl || '')
  );

  const changeZoom = (delta) => {
    let currentBase = baseWidth;
    if ((zoom === 1 || !currentBase) && imgRef.current) {
      currentBase = imgRef.current.getBoundingClientRect().width;
      setBaseWidth(currentBase);
    }
    setZoom((z) => Math.min(3, Math.max(0.5, +(z + delta).toFixed(2))));
  };

  const resetZoom = () => {
    setZoom(1);
    setBaseWidth(0);
  };

  const openPreview = () => {
    if (!url) return;
    setFocusTarget(document.activeElement);
    setLoadError(false);
    resetZoom();
    setOpen(true);
  };

  if (!url && typeof children !== 'function') return null;

  return (
    <>
      {typeof children === 'function' ? (
        children({ openPreview, canPreview: Boolean(url) })
      ) : (
        <button data-ui="tertiary"
          type="button"
          onClick={openPreview}
          className={triggerClassName}
          title={`Preview ${displayName}`}
          style={{
            color: "var(--ui-blue)",
            padding: '6px 10px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            background: 'transparent',
            border: 'none',
          }}
        >
          {triggerLabel}
        </button>
      )}
      {open && url && createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${displayName}`}
          tabIndex={-1}
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#10213Af2',
            display: 'flex',
            flexDirection: 'column',
            padding: 'clamp(12px, 3vw, 24px)',
            gap: 'clamp(10px, 2vw, 16px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              width: '100%',
            }}
          >
            <button data-ui="secondary"
              autoFocus
              type="button"
              onClick={handleClose}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Close preview
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" download={displayName}
              style={{ color: 'white', fontWeight: 600, textDecoration: 'underline' }}>Open or download file</a>
            {!isPdf && !loadError && (
              <div className="vista-surface"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 'clamp(3px, 1vw, 4px) clamp(5px, 1.2vw, 6px)',
                  background: 'white',
                  borderRadius: 24,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                }}
              >
                <button data-ui="icon"
                  type="button"
                  aria-label="Zoom out"
                  disabled={zoom <= 0.5}
                  onClick={() => changeZoom(-0.25)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'clamp(26px, 6vw, 30px)',
                    height: 'clamp(26px, 6vw, 30px)',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: zoom <= 0.5 ? '#9ca3af' : '#142d55',
                    cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ZoomOut size={16} aria-hidden="true" />
                </button>
                <span
                  style={{
                    minWidth: 'clamp(40px, 9vw, 48px)',
                    textAlign: 'center',
                    fontFamily: "var(--font-body)",
                    fontSize: 'clamp(11.5px, 2.5vw, 12.5px)',
                    fontWeight: 700,
                    color: "var(--ui-text)",
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <button data-ui="icon"
                  type="button"
                  aria-label="Zoom in"
                  disabled={zoom >= 3}
                  onClick={() => changeZoom(0.25)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'clamp(26px, 6vw, 30px)',
                    height: 'clamp(26px, 6vw, 30px)',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: zoom >= 3 ? '#9ca3af' : '#142d55',
                    cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ZoomIn size={16} aria-hidden="true" />
                </button>
                {zoom !== 1 && (
                  <button data-ui="icon"
                    type="button"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                    onClick={resetZoom}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 'clamp(26px, 6vw, 30px)',
                      height: 'clamp(26px, 6vw, 30px)',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#eef2fa',
                      color: "var(--ui-blue)",
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
            }}
          >
            {isPdf ? (
              <object
                data={url}
                type="application/pdf"
                aria-label={displayName}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 900,
                  height: '100%',
                  background: 'white',
                  borderRadius: 8,
                  margin: 'auto',
                }}
              >
                <div
                  style={{
                    padding: '32px 24px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: "var(--radius-chip)",
                    margin: 'auto',
                    maxWidth: '450px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  <FileText size={36} color="#1f5cae" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: '0 0 8px', fontWeight: 600, color: "var(--ui-text)", fontSize: '15px' }}>
                    Inline PDF Preview Unavailable
                  </p>
                  <p style={{ margin: '0 0 16px', color: "var(--ui-muted)", fontSize: '13px' }}>
                    This browser could not render the PDF directly inside the modal.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={displayName}
                    style={{
                      display: 'inline-block',
                      padding: '9px 18px',
                      backgroundColor: "var(--ui-blue)",
                      color: 'white',
                      borderRadius: "var(--radius-chip)",
                      fontWeight: 600,
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    Open or Download PDF
                  </a>
                </div>
              </object>
            ) : loadError ? (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: "var(--radius-chip)",
                  margin: 'auto',
                  maxWidth: '450px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: '0 0 8px', fontWeight: 600, color: "var(--ui-text)", fontSize: '15px' }}>
                  Preview Unavailable
                </p>
                <p style={{ margin: '0 0 16px', color: "var(--ui-muted)", fontSize: '13px' }}>
                  The image could not be loaded for display.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={displayName}
                  style={{
                    display: 'inline-block',
                    padding: '9px 18px',
                    backgroundColor: "var(--ui-blue)",
                    color: 'white',
                    borderRadius: "var(--radius-chip)",
                    fontWeight: 600,
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  Open or Download File
                </a>
              </div>
            ) : (
              <img
                ref={imgRef}
                src={url}
                alt={displayName}
                onLoad={(e) => {
                  if (zoom === 1) setBaseWidth(e.currentTarget.getBoundingClientRect().width);
                }}
                onError={() => setLoadError(true)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'block',
                  width: zoom === 1 || !baseWidth ? 'auto' : `${Math.round(baseWidth * zoom)}px`,
                  height: 'auto',
                  maxWidth: zoom === 1 ? 'min(100%, 760px)' : 'none',
                  maxHeight: zoom === 1 ? 'calc(100dvh - 96px)' : 'none',
                  objectFit: 'contain',
                  margin: 'auto',
                  borderRadius: 8,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                  transition: 'width 0.15s ease',
                }}
              />
            )}
          </div>
        </div>, document.body
      )}
    </>
  );
}
