export default function SecureIntegrationBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        borderRadius: "14px",
        padding: "18px 32px",
        textAlign: "center",
        marginTop: "20px",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: "0 4px 16px rgba(245, 158, 11, 0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "0 6px 20px rgba(245, 158, 11, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(245, 158, 11, 0.25)";
      }}
    >
      <h2
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "20px",
          fontWeight: "800",
          color: "#ffffff",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Secure Integration
      </h2>
    </div>
  );
}
