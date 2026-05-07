export const normalizeRole = (role) => String(role || '').trim().toLowerCase()

export const getDefaultRouteForRole = (role) => {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'admin') {
    return '/admin/dashboard'
  }

  if (normalizedRole === 'hr_manager') {
    return '/admin/rewards'
  }

  return '/dashboard'
}

export const isRoleAllowed = (role, allowedRoles = []) => {
  const normalizedRole = normalizeRole(role)
  return allowedRoles.map(normalizeRole).includes(normalizedRole)
}
