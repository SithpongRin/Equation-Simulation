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
