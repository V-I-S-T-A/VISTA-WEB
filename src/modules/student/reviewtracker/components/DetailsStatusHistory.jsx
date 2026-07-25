export default function DetailsStatusHistory() {
  const events = [
    {
      title: "Under Vetting Process",
      date: "Jan 24, 2026 · 02:45 PM",
      description:
        "The application folder has moved to the finance department for final review.",
      active: true,
    },
    {
      title: "Submission Logged",
      date: "Jan 21, 2026 · 11:30 PM",
      description: null,
      active: false,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e6ee",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* Yellow header bar */}
      <div
        style={{
          backgroundColor: "#FFE452",
          padding: "12px 24px",
        }}
      >
        <h4
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "13px", color: "#1a1a1a" }}
        >
          Status History
        </h4>
      </div>

      {/* Timeline */}
      <div style={{ padding: "24px 28px" }}>
        {events.map((event, index) => (
          <div key={index} className="flex gap-4" style={{ position: "relative" }}>
            {/* Dot + Line */}
            <div
              className="flex flex-col items-center"
              style={{ minWidth: "16px" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "9999px",
                  backgroundColor: event.active ? "#1A59A5" : "#9ca3af",
                  marginTop: "4px",
                  flexShrink: 0,
                }}
              />
              {index < events.length - 1 && (
                <div
                  style={{
                    width: "2px",
                    flex: 1,
                    backgroundColor: "#e2e6ee",
                    marginTop: "4px",
                    marginBottom: "4px",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: index < events.length - 1 ? "24px" : "0" }}>
              <h5
                className="font-inter font-bold text-[#142d55]"
                style={{ fontSize: "15px", lineHeight: 1.3 }}
              >
                {event.title}
              </h5>
              <p
                className="font-inter text-gray-400"
                style={{ fontSize: "12px", marginTop: "2px" }}
              >
                {event.date}
              </p>
              {event.description && (
                <p
                  className="font-inter text-gray-600"
                  style={{
                    fontSize: "13px",
                    marginTop: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
