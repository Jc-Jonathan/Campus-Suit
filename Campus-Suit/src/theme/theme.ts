export const colors = {
  background: '#e5dedeff',
  surface: '#ffffffff',
  primary: '#0d0627e0',
  primaryGradient: ['#0D0627', '#1a0d4dff', '#2514736c'] as const,
  primarySoft: '#DBEAFE',
  accent: '#22C55E',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  text: '#0F172A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
};

export const typography = {
  title: 24,
  h5: 20,  // Adding h5 as a medium size between title and subtitle
  subtitle: 18,
  body: 14,
  small: 12,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
} as const;
