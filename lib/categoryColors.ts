export const FUNDING_CATEGORY_COLORS: Record<string, {
  header: string      // dark background for header rows
  subheader: string   // medium background for subcategory rows
  rowTint: string     // very light tint for project rows
  text: string        // text color on header (always white or near-white)
  accent: string      // accent color for borders or highlights
}> = {
  W: {
    header: '#1d4ed8',
    subheader: '#dbeafe',
    rowTint: '#eff6ff',
    text: '#ffffff',
    accent: '#3b82f6'
  },
  WW: {
    header: '#15803d',
    subheader: '#dcfce7',
    rowTint: '#f0fdf4',
    text: '#ffffff',
    accent: '#22c55e'
  },
  RW: {
    header: '#7e22ce',
    subheader: '#f3e8ff',
    rowTint: '#faf5ff',
    text: '#ffffff',
    accent: '#a855f7'
  }
}

// Fallback for any funding category not in the map
export const DEFAULT_CATEGORY_COLORS = {
  header: '#374151',
  subheader: '#f3f4f6',
  rowTint: '#ffffff',
  text: '#ffffff',
  accent: '#6b7280'
}

export function getCategoryColors(code: string) {
  return FUNDING_CATEGORY_COLORS[code] ?? DEFAULT_CATEGORY_COLORS
}
