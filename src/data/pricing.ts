// All Anlin pricing data as constants
// UI = Width + Height (United Inches)

export const UI_BRACKETS = [
  { min: 0,   max: 72  },
  { min: 73,  max: 84  },
  { min: 85,  max: 96  },
  { min: 97,  max: 108 },
  { min: 109, max: 120 },
  { min: 121, max: 132 },
  { min: 133, max: 144 },
  { min: 145, max: 156 },
  { min: 157, max: 168 },
  { min: 169, max: 180 },
  { min: 181, max: 192 },
  { min: 193, max: 216 },
] as const;

export type BracketIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export function getUiBracketIndex(ui: number): BracketIndex | null {
  for (let i = 0; i < UI_BRACKETS.length; i++) {
    if (ui >= UI_BRACKETS[i].min && ui <= UI_BRACKETS[i].max) {
      return i as BracketIndex;
    }
  }
  return null;
}

// ─── CATALINA / PANORAMIC BASE PRICES (White, Block/NF) ──────────────────────
// Index = bracket 0–11; null = not available
export const CAT_PAN_BASE: Record<'SH' | 'XO' | 'XOX' | 'PW', (number | null)[]> = {
  SH:  [510, 551, 594, 604, 639, 668, 720, 788, 874, null, null, null],
  XO:  [466, 525, 561, 615, 680, 715, 734, 805, 880, null, null, null],
  XOX: [545, 583, 626, 717, 907, 976, 1079, 1197, 1293, 1351, 1414, 1516],
  PW:  [363, 408, 445, 499, 551, 628, 689, 753, 836, 920, null, null],
};

// ─── CORONADO BASE PRICES (White, Block/NF) ───────────────────────────────────
export const CORONADO_BASE: Record<'DH' | 'XX' | 'XOX' | 'PW', (number | null)[]> = {
  DH:  [610, 651, 713, 759, 842, 934, null, null, null, null, null, null],
  XX:  [555, 595, 657, 740, 821, 902, 987, 1066, 1147, null, null, null],
  XOX: [null, 722, 774, 885, 966, 1089, 1211, 1375, 1435, 1478, 1591, 1706],
  PW:  [380, 427, 468, 522, 579, 660, 723, 790, 879, 962, null, null],
};

// ─── RETRO-FIN ADDERS ─────────────────────────────────────────────────────────
export const RETRO_FIN_ADDERS: Record<'SH' | 'XO' | 'XOX' | 'PW', (number | null)[]> = {
  SH:  [28, 32, 40, 47, 57, 66, 78, 90, 98, null, null, null],
  XO:  [27, 32, 41, 47, 57, 66, 79, 90, 97, null, null, null],
  XOX: [28, 32, 40, 47, 58, 66, 79, 89, 98, null, null, null],
  PW:  [27, 32, 40, 47, 58, 66, 78, 90, 98, null, null, null],
};

// ─── BRICK MOULD ADDERS ───────────────────────────────────────────────────────
export const BRICK_MOULD_ADDERS: Record<'SH' | 'XO' | 'XOX' | 'PW', (number | null)[]> = {
  SH:  [84, 97, 119, 144, 171, 206, 235, 270, 295, null, null, null],
  XO:  [84, 97, 119, 144, 171, 206, 235, 270, 295, null, null, null],
  XOX: [84, 97, 119, 144, 171, 206, 235, 270, 295, null, null, null],
  PW:  [84, 97, 119, 144, 171, 206, 235, 270, 295, null, null, null],
};

// ─── GLAZING ADDERS ──────────────────────────────────────────────────────────
export const GLAZING_ADDERS = {
  SunMatrix:      [98,  114, 137, 159, 181, 209, 254, 299, 344, 575, 641, 773],
  InfiniteE:      [48,  66,  84,  107, 132, 162, 180, 217, 239, 276, 313, 368],
  SunShield:      [65,  90,  114, 144, 178, 218, 243, 294, 323, 373, 422, 496],
  ObscureStd:     [48,  70,  93,  122, 147, 173, 209, 247, 283, 331, 413, 506],
  ObscureSpecial: [84,  126, 166, 217, 265, 309, 364, 441, 534, 644, 754, 872],
  Tempered:       [129, 170, 228, 283, 352, 423, 452, 507, 567, 706, 864, 964],
  SoundPkg:       [127, 148, 171, 190, 213, 236, 257, 276, 298, 321, 340, 384],
  GridsFlat:      [48,  63,  81,  99,  117, 155, 209, 247, 283, 319, 357, 412],
  GridsSculpt:    [72,  94,  122, 148, 176, 232, 314, 369, 424, 479, 535, 617],
  ArgonGas:       [33,  48,  60,  77,  93,  114, 132, 159, 180, 209, 239, 276],
} as const;

// ─── SCREEN PRICES ────────────────────────────────────────────────────────────
export const SCREEN_PRICES = [68, 76, 82, 87, 93, 101, 108, 114, 120, 125, 131, 139];

// ─── CORONADO CASEMENT & AWNING ───────────────────────────────────────────────
// Uses its own UI brackets
export const CASEMENT_AWNING_BRACKETS = [
  { min: 0,   max: 72  },
  { min: 73,  max: 84  },
  { min: 85,  max: 96  },
  { min: 97,  max: 108 },
  { min: 109, max: 120 },
  { min: 121, max: 132 },
  { min: 133, max: 144 },
  { min: 145, max: 156 },
  { min: 157, max: 168 },
];

export const CASEMENT_BASE = {
  Fixed:    [474,  549,  660,  754,  849, 1100, 1193, 1272, 1365],
  Operable: [584,  678,  770,  864,  959, null, null, null, null],
  Awning:   [584,  678,  770,  null, null, null, null, null, null],
};

// ─── GEOMETRIC PRICING (per UI) ───────────────────────────────────────────────
export const GEOMETRIC_RATES = {
  CatPan: {
    1: { Block: 9.64,  RetroFin: 10.20, BrickMould: 11.21 },
    2: { Block: 10.22, RetroFin: 10.78, BrickMould: 11.79 },
    3: { Block: 11.35, RetroFin: 11.91, BrickMould: null  },
  },
  Coronado: {
    1: { Block: 11.28, RetroFin: 11.93, BrickMould: 13.11 },
    2: { Block: 11.95, RetroFin: 12.60, BrickMould: 13.78 },
    3: { Block: 13.28, RetroFin: 13.93, BrickMould: null  },
  },
} as const;

// ─── SLIDING PATIO DOORS (Malibu) ─────────────────────────────────────────────
export const SLIDING_DOOR_2PANEL_BRACKETS = [
  { min: 120, max: 145 },
  { min: 146, max: 158 },
  { min: 159, max: 181 },
  { min: 182, max: 193 },
  { min: 194, max: 202 },
  { min: 203, max: 219 },
];

export const SLIDING_DOOR_2PANEL = {
  base:       [1673, 1766, 1951, 2514, 3070, 3626],
  SunMatrix:  [358,  404,  493,  604,  640,  716 ],
  InfiniteE:  [247,  278,  340,  416,  441,  493 ],
  SunShield:  [283,  319,  390,  479,  507,  568 ],
  Sound:      [258,  279,  321,  null, null, null ],
  GridsFlat:  [124,  139,  216,  248,  281,  309 ],
  GridsSculpt:[185,  201,  324,  380,  419,  462 ],
  ArgonGas:   [108,  124,  139,  170,  193,  232 ],
};

export const SLIDING_DOOR_3PANEL_BRACKETS = [
  { min: 146, max: 182 },
  { min: 183, max: 195 },
  { min: 196, max: 208 },
  { min: 209, max: 224 },
  { min: 225, max: 240 },
  { min: 241, max: 256 },
  { min: 257, max: 281 },
];
export const SLIDING_DOOR_3PANEL_BASE = [2514, 2804, 3151, 3498, 4250, 4445, 4876];

export const SLIDING_DOOR_4PANEL_BRACKETS = [
  { min: 159, max: 181 },
  { min: 182, max: 193 },
  { min: 194, max: 208 },
  { min: 209, max: 224 },
  { min: 225, max: 240 },
  { min: 241, max: 256 },
  { min: 257, max: 274 },
  { min: 275, max: 291 },
];
export const SLIDING_DOOR_4PANEL_BASE = [3103, 3392, 3567, 3867, 4608, 4781, 5244, 5706];

// ─── FRENCH SWINGING DOORS ────────────────────────────────────────────────────
export const FRENCH_SINGLE_X = [
  { min: 100, max: 112, base: 2161 },
  { min: 113, max: 134, base: 2370 },
];
export const FRENCH_XO_OX = [
  { min: 120, max: 142, base: 3007 },
  { min: 143, max: 170, base: 3200 },
];
export const FRENCH_XX = [
  { min: 120, max: 142, base: 3879 },
  { min: 143, max: 170, base: 4122 },
];
export const FRENCH_OXO = [
  { min: 140, max: 166, base: 3747 },
  { min: 167, max: 181, base: 3968 },
  { min: 182, max: 193, base: 4232 },
  { min: 194, max: 216, base: 4497 },
];

// ─── FLAT OPTION PRICES ───────────────────────────────────────────────────────
export const FLAT_OPTIONS = {
  TrueActionLock: 13.90,
  ArchLock: 22.20,
  SashDeadBolt: 38.60,
  WindowLimitingDevice: 21.00,
  CustomVentSize: 19.80,
  FactoryMullionPerFoot: 44.00,
  // Patio door options
  QuadLock: 250,
  KeyedLockCylinder: 30,
  HandleFinishIntOnly: 204,
  HandleFinishIntExt: 250,
  DeadBoltUpperVent: 62,
  StainlessRollers: 122,
  FrenchOverHeight1Panel: 276,
  FrenchOverHeight2Panel: 552,
  FrenchArchFinishX: 165,
  FrenchArchFinishXX: 330,
  FrenchOperableSideLite: 650,
} as const;

// ─── COLOR UPCHARGE MULTIPLIER ────────────────────────────────────────────────
export const COLOR_UPCHARGE: Record<string, number> = {
  White: 1.0,
  Adobe: 1.04,
  Tan: 1.04,
};

export const THERMA_COAT_UPCHARGE = 1.59;

// ─── BUSINESS CONSTANTS ───────────────────────────────────────────────────────
export const HPR_COST_MULTIPLIER = 0.48;
export const LABOR_COST_PER_WINDOW = 125;
export const DEFAULT_MARGIN = 0.50;
export const DEFAULT_SILL_PRICE = 75;
