/* ======================= MODEL NAMES ===================== */

export const MODEL_NAMES = {
  USER: 'User',
  CHARACTER: 'Character',
  TALENT: 'Talent',
  ITEM: 'Item',
} as const;

export const ITEMS_COLLECTION = 'items';

/* ======================= SUPPLY DICE CONSTANTS ===================== */

export const SUPPLY_DICE = ['none', 'd6', 'd8', 'd10', 'd12'] as const;
export type SupplyDie = (typeof SUPPLY_DICE)[number];
export const DEFAULT_SUPPLY_DIE: SupplyDie = 'd12';

/* ======================= SKILL CONSTANTS ===================== */

export const COMBAT_SKILLS = ['dodge', 'lightMelee', 'mediumMelee', 'heavyMelee', 'might', 'missile', 'thrown'] as const;

export const MELEE_SKILLS = ['lightMelee', 'mediumMelee', 'heavyMelee'] as const;
export const RANGED_SKILLS = ['missile', 'thrown'] as const;

export const ADVENTURING_SKILLS = [
  'athletics',
  'endurance',
  'locksAndTraps',
  'perception',
  'ride',
  'sailAndBoat',
  'sleightOfHand',
  'stealth',
  'survival',
  'track',
  'willpower',
] as const;

export const SOCIAL_SKILLS = ['deceive', 'insight', 'inspire', 'intimidate', 'perform', 'persuade', 'protocol', 'seduce', 'wit'] as const;

export const LORE_SKILLS = [
  'ancientLore',
  'arcana',
  'commerce',
  'commonLore',
  'craftPractical',
  'craftArtisan',
  'divinity',
  'heal',
  'naturewise',
  'streetwise',
] as const;

export const ALL_FIXED_SKILLS = [...COMBAT_SKILLS, ...ADVENTURING_SKILLS, ...SOCIAL_SKILLS, ...LORE_SKILLS] as const;

export type CombatSkill = (typeof COMBAT_SKILLS)[number];
export type FixedSkill = (typeof ALL_FIXED_SKILLS)[number];

/* ======================= MAGIC CONSTANTS ===================== */

export const BINDS = ['change', 'conjure', 'control', 'destroy', 'witness'] as const;
export const STRANDS = ['air', 'beast', 'body', 'earth', 'fire', 'plant', 'spheres', 'spirit', 'thought', 'water'] as const;

/* ======================= HIT LOCATION CONSTANTS ===================== */

export const HIT_LOCATIONS = [
  { key: 'body', name: 'Body', range: '1-5' },
  { key: 'rightArm', name: 'Right Arm', range: '6' },
  { key: 'leftArm', name: 'Left Arm', range: '7' },
  { key: 'rightLeg', name: 'Right Leg', range: '8' },
  { key: 'leftLeg', name: 'Left Leg', range: '9' },
  { key: 'head', name: 'Head', range: '10' },
] as const;

export const HIT_LOCATION_KEYS = HIT_LOCATIONS.map((loc) => loc.key);
export type HitLocationKey = (typeof HIT_LOCATIONS)[number]['key'];

/* ======================= ARMOR CONSTANTS ===================== */

export const ARMOR_REGIONS = ['body', 'arm', 'leg', 'head'] as const;
