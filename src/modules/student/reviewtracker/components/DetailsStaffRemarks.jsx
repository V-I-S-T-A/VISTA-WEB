import defaultAvatar from "../../../../assets/shared/default_user.jpg";

export default function DetailsStaffRemarks() {
  const remarks = [
    {
      name: "Jeon Wonwoo",
      role: "OSA SECRETARY",
      date: "Jan 22, 10:15 AM",
      message:
        "The paper copy of your transcript was received. The essential data is legible for initial processing.",
      avatar: defaultAvatar,
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
        className="flex items-center justify-between"
        style={{
          backgroundColor: "#1A59A5",
          padding: "12px 24px",
        }}
      >
        <h4
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "13px", color: "white" }}
        >
          Staff Remarks & Feedbacks
        </h4>
        <span
          className="inline-flex items-center font-inter font-bold text-#1a1a1a"
          style={{
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "6px",
            backgroundColor: "#FFE452",
          }}
        >
          {remarks.length} UPDATE
        </span>
      </div>

      {/* Remarks list */}
      <div style={{ padding: "20px 28px" }}>
        {remarks.map((remark, index) => (
          <div
            key={index}
            style={{
              marginBottom: index < remarks.length - 1 ? "20px" : "0",
            }}
          >
            {/* Author row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={remark.avatar}
                  alt={remark.name}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <p
                    className="font-inter font-bold text-[#142d55]"
                    style={{ fontSize: "14px", lineHeight: 1.2 }}
                  >
                    {remark.name}
                  </p>
                  <p
                    className="font-inter font-bold uppercase tracking-wider text-gray-400"
                    style={{ fontSize: "10px" }}
                  >
                    {remark.role}
                  </p>
                </div>
              </div>
              <p
                className="font-inter text-gray-400"
                style={{ fontSize: "12px" }}
              >
                {remark.date}
              </p>
            </div>

            {/* Message */}
            <div
              style={{
                backgroundColor: "#edf2fb",
                borderRadius: "8px",
                border: "1px solid #dbe4f0",
                padding: "16px 20px",
                marginLeft: "48px",
              }}
            >
              <p
                className="font-inter text-[#142d55]"
                style={{ fontSize: "14px", lineHeight: 1.6 }}
              >
                {remark.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
