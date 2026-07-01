// Mock audit log data
export const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: "Oct 24, 2023",
    user: "Admin_User",
    userType: "Admin",
    action: "USER_CREATION",
    reference: "VISTA-88291-X",
  },
  {
    id: 2,
    timestamp: "Oct 24, 2023",
    user: "Jeon Wonwoo",
    userType: "OSA Staff",
    action: "SUBMISSION_APPROVED",
    reference: "VISTA-88291-X",
  },
  {
    id: 3,
    timestamp: "Oct 24, 2023",
    user: "SITE: Society of I...",
    userType: "Student Organization",
    action: "REVISION",
    reference: "VISTA-88291-X",
  },
  {
    id: 4,
    timestamp: "Oct 24, 2023",
    user: "Google Dev.",
    userType: "Student Organization",
    action: "PENDING",
    reference: "VISTA-88291-X",
  },
  {
    id: 5,
    timestamp: "Oct 24, 2023",
    user: "Student User",
    userType: "Student",
    action: "SUBMISSION_APPROVED",
    reference: "VISTA-88291-X",
  },
  {
    id: 6,
    timestamp: "Oct 23, 2023",
    user: "Admin_User",
    userType: "Admin",
    action: "USER_DELETION",
    reference: "VISTA-88290-X",
  },
  {
    id: 7,
    timestamp: "Oct 23, 2023",
    user: "Jane Smith",
    userType: "Faculty",
    action: "DOCUMENT_UPLOADED",
    reference: "VISTA-88289-X",
  },
  {
    id: 8,
    timestamp: "Oct 23, 2023",
    user: "Tech Support",
    userType: "Staff",
    action: "SYSTEM_CONFIG_CHANGED",
    reference: "VISTA-88288-X",
  },
  {
    id: 9,
    timestamp: "Oct 22, 2023",
    user: "Maria Santos",
    userType: "Student",
    action: "LOGIN",
    reference: "VISTA-88287-X",
  },
  {
    id: 10,
    timestamp: "Oct 22, 2023",
    user: "System Admin",
    userType: "Admin",
    action: "BACKUP_COMPLETED",
    reference: "VISTA-88286-X",
  },
];

export const PAGE_SIZE = 5;
export const CONTENT_PADDING = "30px";

export const ACTION_COLORS = {
  USER_CREATION: { bg: "#dbeafe", text: "#0369a1" },
  USER_DELETION: { bg: "#fee2e2", text: "#991b1b" },
  SUBMISSION_APPROVED: { bg: "#dcfce7", text: "#166534" },
  REVISION: { bg: "#fef3c7", text: "#92400e" },
  PENDING: { bg: "#fecaca", text: "#7c2d12" },
  DOCUMENT_UPLOADED: { bg: "#e9d5ff", text: "#6b21a8" },
  SYSTEM_CONFIG_CHANGED: { bg: "#d1d5db", text: "#374151" },
  LOGIN: { bg: "#cffafe", text: "#164e63" },
  BACKUP_COMPLETED: { bg: "#f3e8ff", text: "#5b21b6" },
};

// Mock "details" payload attached to every log entry so the detail page
// has something realistic to render regardless of which row was clicked.
export function buildLogDetails(log) {
  return {
    severity: "INFO",
    logId: log.reference,
    title: log.action
      .toLowerCase()
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    actor: log.user,
    actorRole: log.userType,
    timestamp: log.timestamp,
    time: "14:32:18 GMT+8",
    actionCategory: log.action,
    referenceId: `REF-APP-2024-${9000 + log.id}-B`,
    impactedEntities: [
      {
        type: "student",
        label: "STUDENT",
        name: "Angelo Binonggo",
        id: "2021-4492-STU",
      },
      {
        type: "document",
        label: "DOCUMENT",
        name: "Annual Act. Pro. 2024",
        id: "DOC-PRO-8812",
      },
    ],
    timeline: [
      { time: "14:32:18", label: log.action.replace(/_/g, " "), current: true },
      { time: "14:30:05", label: "Validation Passed", current: false },
    ],
  };
}
