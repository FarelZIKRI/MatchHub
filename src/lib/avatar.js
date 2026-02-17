/**
 * Generate avatar fallback sebagai data URI SVG
 * Tidak bergantung pada layanan eksternal
 */

const COLORS = [
  '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6',
  '#10B981', '#8B5CF6', '#F59E0B', '#F97316', '#64748B',
]

function getColor(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function generateAvatar(nameOrEmail) {
  const seed = nameOrEmail || 'User'
  const color = getColor(seed)
  const initials = getInitials(seed.includes('@') ? seed.split('@')[0] : seed)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="50" fill="${color}"/>
    <text x="50" y="54" text-anchor="middle" dominant-baseline="middle" 
      fill="white" font-family="Inter,Arial,sans-serif" font-size="38" font-weight="600">
      ${initials}
    </text>
  </svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function getAvatarUrl(avatarUrl, nameOrEmail) {
  // Jika sudah punya avatar URL yang valid (bukan dicebear), gunakan itu
  if (avatarUrl && !avatarUrl.includes('dicebear.com')) {
    return avatarUrl
  }
  // Fallback ke generated avatar
  return generateAvatar(nameOrEmail || 'User')
}
