import { ScanText } from "lucide-react";

export default function GoogleSignInCard() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "36px 28px 28px",
        textAlign: "center",
        marginTop: "28px",
        border: "none",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "18px",
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "10px",
            background: "#031c36",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScanText
            style={{ width: "26px", height: "26px", color: "#fff" }}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: "700",
          color: "#031c36",
          margin: 0,
        }}
      >
        Internal Staff Login
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#4b5563",
          margin: "8px 0 24px",
          lineHeight: "1.5",
        }}
      >
        Please use your institutional email to
        <br />
        access the VISTA scanning gateway.
      </p>

      {/* Google Sign-In Button */}
      <button
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          background: "#facc15",
          border: "2px solid #3f2a00",
          borderRadius: "4px",
          padding: "4px 20px 4px 4px",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: "600",
          color: "#031c36",
          transition: "all 0.15s",
          boxShadow: "0 2px 4px rgba(250, 204, 21, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#eab308";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#facc15";
        }}
      >
        {/* Google "G" icon wrapper */}
        <div style={{ background: "#ffffff", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
        </div>
        Sign in with Google
      </button>

      {/* Privacy Section */}
      <div style={{ marginTop: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ height: "1px", background: "#e5e7eb", flex: 1, maxWidth: "80px" }} />
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: "600",
              color: "#9ca3af",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Privacy Assurance
          </p>
          <div style={{ height: "1px", background: "#e5e7eb", flex: 1, maxWidth: "80px" }} />
        </div>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "9px",
            color: "#9ca3af",
            lineHeight: "1.5",
            margin: 0,
            maxWidth: "320px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Access is restricted to authorized personnel. Data is handled
          according to the <span style={{textDecoration: "underline"}}>Institutional Privacy Framework</span>. All uploads are
          logged for audit purposes.
        </p>
      </div>
    </div>
  );
}
