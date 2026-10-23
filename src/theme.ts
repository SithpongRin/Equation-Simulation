export const ANIME_THEME = {
  bg: '#0A0F24',
  surface: '#131A38',
  surfaceCard: '#1B244D',
  border: '#2E3D75',
  borderGlow: '#6366F1',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  accentCyan: '#38BDF8',
  accentGold: '#FBBF24',
  accentPink: '#F43F5E',
  accentMint: '#34D399',
  accentPurple: '#A855F7',
} as const;

// Antique brass & cast-iron palette for the 3D balance scale
export const ANTIQUE = {
  brassBright: '#F5DE88',   // Gleaming polished brass highlight
  brass: '#CCA045',         // Classic warm antique brass
  brassDark: '#78531E',     // Aged patina brass / shadow crevices
  bronze: '#9B6B38',        // Cast bronze accent
  iron: '#272B33',          // Satin gunmetal cast iron
  ironDark: '#171A20',      // Deep cast iron
  walnut: '#55341E',        // Warm polished walnut wood
  walnutDark: '#351D0E',    // Rich dark mahogany / walnut shadow
  ivory: '#FAF4E4',         // Aged porcelain / enamel dial face
  emerald: '#10B981',       // Balanced indicator jewel
  ruby: '#EF4444',          // Unbalanced indicator jewel
} as const;

export type ItemThemeId = 'fruits' | 'sweets' | 'toys' | 'space';

export interface ItemThemeOption {
  id: ItemThemeId;
  nameKm: string;
  nameEn: string;
}

export const ITEM_THEMES: Record<ItemThemeId, ItemThemeOption> = {
  fruits: {
    id: 'fruits',
    nameKm: 'ផ្លែឈើ Anime (Fruits)',
    nameEn: 'Fruits',
  },
  sweets: {
    id: 'sweets',
    nameKm: 'បង្អែម Anime (Sweets)',
    nameEn: 'Sweets',
  },
  toys: {
    id: 'toys',
    nameKm: 'របស់លេង Anime (Toys)',
    nameEn: 'Toys',
  },
  space: {
    id: 'space',
    nameKm: 'លំហវេទមន្ត (Space)',
    nameEn: 'Space',
  },
};
