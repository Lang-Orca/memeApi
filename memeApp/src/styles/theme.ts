export const theme = {
  colors: {
    background: '#0B0A0F',     // Deep space black/dark purple
    surface: '#151324',        // Glass-like dark violet surface
    surfaceElevated: '#1D1A30', // Elevated surface for inputs and cards
    primary: '#8B5CF6',        // Vibrant violet
    primaryLight: '#A78BFA',   // Light violet for active borders
    primaryDark: '#6D28D9',    // Dark violet for gradients/shadows
    secondary: '#06B6D4',      // Neon cyan accent
    text: '#F3F4F6',           // Bright off-white
    textSecondary: '#9CA3AF',  // Muted gray
    border: '#2A264D',         // Subtle violet border
    error: '#EF4444',          // Soft error red
    success: '#10B981',        // Soft success green
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    round: 9999,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 26,
      xxl: 36,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      black: '900' as const,
    },
  },
};
