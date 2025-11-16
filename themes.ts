export type ColorScheme = 'light' | 'dark';
export type ThemeName = 'default' | 'forest' | 'ocean' | 'sunset' | 'rose' | 'slate';

export interface ThemeColors {
  primary: string;
  'primary-focus': string;
  secondary: string;
  'secondary-focus': string;
  accent: string;
  background: string;
  surface: string;
  'text-primary': string;
  'text-secondary': string;
  border: string;
}

export const themes: Record<ThemeName, Record<ColorScheme, ThemeColors>> = {
  default: {
    dark: {
      primary: '#6a1b9a',
      'primary-focus': '#4a148c',
      secondary: '#1a202c',
      'secondary-focus': '#2d3748',
      accent: '#f59e0b',
      background: '#111827',
      surface: '#1f2937',
      'text-primary': '#f9fafb',
      'text-secondary': '#d1d5db',
      border: '#374151',
    },
    light: {
      primary: '#8e24aa',
      'primary-focus': '#6a1b9a',
      secondary: '#f1f5f9',
      'secondary-focus': '#e2e8f0',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      border: '#cbd5e1',
    },
  },
  forest: {
    dark: {
      primary: '#22c55e',
      'primary-focus': '#16a34a',
      secondary: '#1a202c',
      'secondary-focus': '#2d3748',
      accent: '#a3e635',
      background: '#111827',
      surface: '#1f2937',
      'text-primary': '#f9fafb',
      'text-secondary': '#d1d5db',
      border: '#374151',
    },
    light: {
      primary: '#22c55e',
      'primary-focus': '#16a34a',
      secondary: '#f1f5f9',
      'secondary-focus': '#e2e8f0',
      accent: '#84cc16',
      background: '#ffffff',
      surface: '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      border: '#cbd5e1',
    },
  },
  ocean: {
    dark: {
      primary: '#0ea5e9',
      'primary-focus': '#0284c7',
      secondary: '#1a202c',
      'secondary-focus': '#2d3748',
      accent: '#67e8f9',
      background: '#111827',
      surface: '#1f2937',
      'text-primary': '#f9fafb',
      'text-secondary': '#d1d5db',
      border: '#374151',
    },
    light: {
      primary: '#0ea5e9',
      'primary-focus': '#0284c7',
      secondary: '#f1f5f9',
      'secondary-focus': '#e2e8f0',
      accent: '#22d3ee',
      background: '#ffffff',
      surface: '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      border: '#cbd5e1',
    },
  },
  sunset: {
    dark: {
      primary: '#f97316',
      'primary-focus': '#ea580c',
      secondary: '#1a202c',
      'secondary-focus': '#2d3748',
      accent: '#ef4444',
      background: '#111827',
      surface: '#1f2937',
      'text-primary': '#f9fafb',
      'text-secondary': '#d1d5db',
      border: '#374151',
    },
    light: {
      primary: '#f97316',
      'primary-focus': '#ea580c',
      secondary: '#f1f5f9',
      'secondary-focus': '#e2e8f0',
      accent: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      border: '#cbd5e1',
    },
  },
  rose: {
    dark: {
      primary: '#ec4899',
      'primary-focus': '#db2777',
      secondary: '#1a202c',
      'secondary-focus': '#2d3748',
      accent: '#f472b6',
      background: '#111827',
      surface: '#1f2937',
      'text-primary': '#f9fafb',
      'text-secondary': '#d1d5db',
      border: '#374151',
    },
    light: {
      primary: '#ec4899',
      'primary-focus': '#db2777',
      secondary: '#f1f5f9',
      'secondary-focus': '#e2e8f0',
      accent: '#f472b6',
      background: '#ffffff',
      surface: '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      border: '#cbd5e1',
    },
  },
  slate: {
    dark: {
      primary: '#64748b',
      'primary-focus': '#475569',
      secondary: '#1a202c',
      'secondary-focus': '#2d3748',
      accent: '#94a3b8',
      background: '#111827',
      surface: '#1f2937',
      'text-primary': '#f9fafb',
      'text-secondary': '#d1d5db',
      border: '#374151',
    },
    light: {
      primary: '#64748b',
      'primary-focus': '#475569',
      secondary: '#f1f5f9',
      'secondary-focus': '#e2e8f0',
      accent: '#94a3b8',
      background: '#ffffff',
      surface: '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      border: '#cbd5e1',
    },
  },
};
