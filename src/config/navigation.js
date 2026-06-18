import defaultUser from '../assets/shared/default_user.jpg'
import vistaLogo from '../assets/shared/vista_logo.png'

export const headerConfig = {
  public: {
    type: 'public',
  },
  admin: {
    type: 'dashboard',
    title: 'Admin Dashboard',
    avatar: defaultUser,
  },
  auditlog: {
    type: 'dashboard',
    title: 'Audit Log',
    avatar: defaultUser,
  },
  staff: {
    type: 'dashboard',
    title: 'Staff Dashboard',
    avatar: defaultUser,
  },
  student: {
    type: 'dashboard',
    title: 'Student Dashboard',
    avatar: defaultUser,
  },
}

export const sidebarConfig = {
  admin: {
    logo: vistaLogo,
    brand: 'V.I.S.T.A.',
    accessLabel: 'ADMIN ACCESS',
    user: {
      name: 'Super Admin',
      id: '2021-00451',
      avatar: defaultUser,
    },
    navItems: [
      {
        label: 'USERS',
        icon: 'Users',
        path: '/admin/dashboard',
        active: true,
      },
      {
        label: 'AUDIT LOGS',
        icon: 'FileText',
        path: '/admin/audit-logs',
        active: false,
      },
    ],
    logout: {
      label: 'LOGOUT',
      path: '/login',
    },
  },
  staff: {
    logo: vistaLogo,
    brand: 'V.I.S.T.A.',
    accessLabel: 'STAFF ACCESS',
    user: {
      name: 'Staff User',
      id: '2021-00832',
      avatar: defaultUser,
    },
    navItems: [],
    logout: {
      label: 'LOGOUT',
      path: '/login',
    },
  },
  student: {
    logo: vistaLogo,
    brand: 'V.I.S.T.A.',
    accessLabel: 'STUDENT ACCESS',
    user: {
      name: 'Student User',
      id: '2021-01204',
      avatar: defaultUser,
    },
    navItems: [],
    logout: {
      label: 'LOGOUT',
      path: '/login',
    },
  },
}

export function getHeaderConfig(layout = 'public') {
  return headerConfig[layout] ?? headerConfig.public
}

export function getSidebarConfig(role) {
  return sidebarConfig[role] ?? null
}