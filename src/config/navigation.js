import defaultUser from "../assets/shared/default_user.jpg";
import vistaLogo from "../assets/shared/vista_logo.png";

export const headerConfig = {
  public: {
    type: "public",
  },
  admin: {
    type: "dashboard",
    title: "Admin Dashboard",
    avatar: defaultUser,
  },
  auditlog: {
    type: "dashboard",
    title: "Audit Log",
    avatar: defaultUser,
  },
  staff: {
    type: "dashboard",
    title: "Staff Dashboard",
    avatar: defaultUser,
  },
  student: {
    type: "dashboard",
    title: "Student Organization Dashboard",
    avatar: defaultUser,
  },
  gdrive: {
    type: "dashboard",
    title: "GDRIVE Sync",
    avatar: defaultUser,
  },
  registration: {
    type: "dashboard",
    title: "Registration",
    avatar: defaultUser,
  },
  profile: {
    type: "dashboard",
    title: "Student Organization Dashboard",
    avatar: defaultUser,
  },
};

export const sidebarConfig = {
  admin: {
    logo: vistaLogo,
    brand: "V.I.S.T.A.",
    accessLabel: "ADMIN ACCESS",
    user: {
      name: "Super Admin",
      id: "2021-00451",
      avatar: defaultUser,
    },
    navItems: [
      {
        label: "USERS",
        icon: "Users",
        path: "/admin/dashboard",
        active: true,
      },
      {
        label: "AUDIT LOGS",
        icon: "FileText",
        path: "/admin/audit-logs",
        active: false,
      },
    ],
    logout: {
      label: "LOGOUT",
      path: "/login",
    },
  },
  staff: {
    logo: vistaLogo,
    brand: "V.I.S.T.A.",
    accessLabel: "STAFF ACCESS",
    user: {
      name: "Staff User",
      id: "2021-00832",
      avatar: defaultUser,
    },
    navItems: [
      {
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: "/staff/dashboard",
        active: true,
      },
      {
        label: "Registration",
        icon: "ClipboardList",
        path: "/staff/registration",
        active: false,
      },
      {
        label: "Review Panel",
        icon: "ClipboardCheck",
        path: "/staff/review-panel",
        active: false,
      },
      {
        label: "Audit Logs",
        icon: "FileText",
        path: "/staff/audit-logs",
        active: false,
      },
      {
        label: "GDrive Sync",
        icon: "CloudUpload",
        path: "/staff/gdrive-sync",
        active: false,
      },
    ],
    logout: {
      label: "LOGOUT",
      path: "/login",
    },
  },
  student: {
    logo: vistaLogo,
    brand: "V.I.S.T.A.",
    accessLabel: "STUDENT ORG. ACCESS",
    user: {
      name: "Student User",
      id: "2021-01204",
      avatar: defaultUser,
    },
    navItems: [
      {
        label: "DASHBOARD",
        icon: "LayoutDashboard",
        path: "/student/dashboard",
        active: true,
      },
      {
        label: "REVIEW TRACKER",
        icon: "ClipboardList",
        path: "/student/review-tracker",
        active: false,
      },
    ],
    logout: {
      label: "LOGOUT",
      path: "/login",
    },
  },
};

export function getHeaderConfig(layout = "public") {
  return headerConfig[layout] ?? headerConfig.public;
}

export function getSidebarConfig(role) {
  return sidebarConfig[role] ?? null;
}
