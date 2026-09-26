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

// Glass / grid / argon adders by patio door bracket (same row order as the bracket tables).
export interface DoorGlazingAdders {
  SunMatrix: readonly number[];
  InfiniteE: readonly number[];
  SunShield: readonly number[];
  GridsFlat: readonly number[];
  GridsSculpt: readonly number[];
  ArgonGas: readonly number[];
}

export const SLIDING_DOOR_3PANEL_GLAZING: DoorGlazingAdders = {
  SunMatrix:   [493, 604, 640, 716, 827, 880, 990],
  InfiniteE:   [340, 416, 441, 493, 571, 607, 683],
  SunShield:   [390, 479, 507, 568, 657, 696, 786],
  GridsFlat:   [216, 248, 281, 309, 347, 386, 424],
  GridsSculpt: [324, 380, 419, 462, 511, 560, 609],
  ArgonGas:    [139, 170, 193, 232, 293, 352, 413],
};

export const SLIDING_DOOR_4PANEL_GLAZING: DoorGlazingAdders = {
  SunMatrix:   [493, 604, 640, 716, 827, 880, 990, 1102],
  InfiniteE:   [340, 416, 441, 493, 571, 607, 683, 760],
  SunShield:   [390, 479, 507, 568, 657, 696, 786, 876],
  GridsFlat:   [216, 248, 281, 309, 347, 386, 424, 462],
  GridsSculpt: [324, 380, 419, 462, 511, 560, 609, 657],
  ArgonGas:    [139, 170, 193, 232, 293, 352, 413, 474],
};

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

export const FRENCH_SINGLE_X_GLAZING: DoorGlazingAdders = {
  SunMatrix:   [315, 358],
  InfiniteE:   [217, 247],
  SunShield:   [238, 271],
  GridsFlat:   [110, 137],
  GridsSculpt: [163, 204],
  ArgonGas:    [93, 108],
};
// XO / OX and XX share the same glazing adders.
export const FRENCH_XO_OX_XX_GLAZING: DoorGlazingAdders = {
  SunMatrix:   [358, 448],
  InfiniteE:   [247, 309],
  SunShield:   [271, 340],
  GridsFlat:   [182, 204],
  GridsSculpt: [273, 397],
  ArgonGas:    [124, 170],
};
export const FRENCH_OXO_GLAZING: DoorGlazingAdders = {
  SunMatrix:   [448, 493, 604, 640],
  InfiniteE:   [309, 340, 416, 441],
  SunShield:   [340, 373, 458, 485],
  GridsFlat:   [204, 319, 357, 412],
  GridsSculpt: [397, 479, 535, 617],
  ArgonGas:    [159, 209, 239, 276],
};

// ─── FLAT OPTION PRICES ───────────────────────────────────────────────────────
export const FLAT_OPTIONS = {
  TrueActionLock: 13.90,
  ArchLock: 22.20,
  SashDeadBolt: 38.60,
  WindowLimitingDevice: 21.00,
  GeometricTemperedPattern: 165.00, // price book: pattern charge for tempered glass on geometrics, added to UI-list tempered
  CustomVentSize: 19.80,
  FactoryMullionPerFoot: 44.00,
  // Patio door options
  QuadLock: 250,
  KeyedLockCylinder: 30,
  ExtPullHandle: 47,          // for keyed cylinder
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
// ─── COLOR PRICING MULTIPLIER ─────────────────────────────────────────────────
// White, Adobe and Tan are priced identically so all three cost the homeowner the same.
export const COLOR_UPCHARGE: Record<string, number> = {
  White: 1.04,
  Adobe: 1.04,
  Tan: 1.04,
};

export const THERMA_COAT_UPCHARGE = 1.59;

// Designer Black: material price is 11% more than ThermaCoat. It replaces the frame-color
// upcharge and ThermaCoat entirely (neither is available with Designer Black).
export const DESIGNER_BLACK = 'Designer Black';
export const DESIGNER_BLACK_UPCHARGE = THERMA_COAT_UPCHARGE * 1.11;

// ─── LOVE THAT DOOR PRICING (priced by SQUARE FOOT, not United Inches) ────────
// Partnership pricing matrix, guide dated 9-18-2025.
// sq ft = (width in inches × height in inches) / 144
// Total = door portion ($/sq ft) + hardware/set + delivery, plus any upgrades.
// The guide price is what HPR pays (cost), not a marked-up list price.
export const LOVE_THAT_DOOR_PRICING = {
  pricePerSqFt: 85,
  hardwarePerSet: 250,
  delivery: 300,
  // Thermally-broken iron doors carry a 20% add-on applied to the per-sq-ft door
  // portion only (verified against the guide's example prices).
  thermallyBrokenUpcharge: 0.20,
  electricGlassPerSqFt: 25,   // iron / steel doors
  pivotUpgrade: 1000,         // iron doors — pivot system
  longPulls: 200,             // 48" / 60" / 96" pulls
  biometricLock: 300,
  biometricLockWifi: 400,
} as const;

export const LOVE_THAT_DOOR_COLORS = [
  'Midnight', 'Midnight w/ Copper Edges',
  'Bronze', 'Bronze w/ Copper Edges',
  'Black', 'Black w/ Copper Edges',
  'Pewter', 'Amber', 'Amber w/ Copper Edges',
] as const;

export const LOVE_THAT_DOOR_GLASS_OPTIONS = [
  'Clear', 'Old AquaTex', 'New AquaTex', 'Water Cube', 'Rain', 'Steam', 'EPI',
  'Reeded', 'Frosted', 'Frost Bite', 'Lite Flemish', 'Smoke Reflective',
] as const;

// ─── FINANCING OPTIONS (shown on the proposal) ───────────────────────────────
export const FINANCING = {
  promoMonths: 18,            // Special Promo Financing: 18 months, 0% interest
  monthlyApr: 0.099,          // Low monthly payment option
  monthlyTermYears: 20,
  monthlyMaxFinanced: 50000,  // financed amount is capped here; any balance over it is shown as a deposit
  securedMaxLoan: 150000,     // secured loans available up to this amount
} as const;

// ─── BUSINESS CONSTANTS ───────────────────────────────────────────────────────
export const HPR_COST_MULTIPLIER = 0.48;
export const LABOR_COST_PER_WINDOW = 125;
// Install labor is charged per door unit and varies by vendor.
export const ANLIN_DOOR_INSTALL_COST = 500;
export const LOVE_THAT_DOOR_INSTALL_COST = 3000;
export const DEFAULT_MARGIN = 0.50;
export const DEFAULT_SILL_PRICE = 75;

// ─── LOVE THAT DOOR EURO SLIDER — JOB DESCRIPTION (shown on proposal + PDF) ──
export const LTD_SLIDER_JOB_DESCRIPTION = {
  intro:
    'Furnish and professionally install a custom Love That Door® Euro Lift & Slide patio door. This premium aluminum door system features smooth, effortless operation, expansive glass panels, thermally broken frames, double-pane tempered Low-E glass, argon-gas insulation, enhanced security, and integrated weather sealing and drainage.',
  scopeHeading: 'Scope includes:',
  scope: [
    'Final field measurement and custom ordering',
    'Removal and disposal of the existing door',
    'Preparation of the existing opening',
    'Professional installation, leveling, fastening, insulation, and sealing',
    'Installation and adjustment of all included hardware and screens',
    'Final operation testing and jobsite cleanup',
  ],
  note:
    'Pricing assumes installation within the existing opening. Structural modifications, concealed damage, masonry or stucco repairs, painting, electrical work, and permit fees are excluded unless specifically listed.',
} as const;

// ─── ANLIN WINDOW INSTALLATION SCOPE OF WORK (shown on proposal + PDF) ───────
export const ANLIN_SCOPE_OF_WORK = {
  heading: 'Scope of Work – Anlin Window Installation',
  items: [
    'Remove and properly dispose of the existing window.',
    'Inspect the exposed sheathing and framing for rotten, damaged, or deteriorated wood. Any required wood repairs will be documented and quoted separately before work proceeds.',
    'Prepare the existing window opening for installation.',
    'Install the new Anlin window level, square, plumb, and securely fastened.',
    'Apply low-expansion spray foam insulation around the window frame to help prevent air and water infiltration.',
    'Apply a high-grade exterior sealant around the window perimeter to create a durable, weather-resistant seal.',
    'Clean the window, remove installation debris, and test the window for proper operation and locking.',
    'Exterior or interior trim work and painting are not included unless otherwise specified in the proposal.',
  ],
} as const;

// Architectural finishes for lock hardware (Anlin price book: CAM or TAL lock, +$22.20 each)
export const ARCH_FINISH_LABELS = {
  SatinBlack: 'Satin Black',
  Bronze: 'Bronze',
  Brass: 'Brass',
  Nickel: 'Nickel',
} as const;
