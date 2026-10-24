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
  goldHighlight: '#FFF3B0', // Specular champagne gold highlight
  brassBright: '#F5DE88',   // Gleaming polished brass highlight
  brass: '#D4A843',         // Classic warm antique brass
  brassWarm: '#C49234',     // Rich golden-bronze midtone
  brassDark: '#7A5420',     // Aged patina brass / shadow crevices
  bronze: '#9B6B38',        // Cast bronze accent
  copper: '#B86B43',        // Warm burnished copper accent
  iron: '#2B303C',          // Satin gunmetal cast iron
  ironDark: '#171A22',      // Deep cast iron
  steel: '#CBD5E1',         // Hardened knife-edge bearing steel
  walnut: '#5C341B',        // Warm polished walnut wood
  walnutDark: '#361C0D',    // Rich dark mahogany / walnut shadow
  velvet: '#0F3D3E',        // Deep apothecary baize / emerald-teal velvet inlay
  ivory: '#FAF5E8',         // Aged porcelain / enamel dial face
  emerald: '#10B981',       // Balanced indicator jewel
  amber: '#F59E0B',         // Close-to-balance warm amber
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
