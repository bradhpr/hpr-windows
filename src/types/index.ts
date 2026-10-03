export type WindowSeries = 'Panoramic' | 'Catalina' | 'Coronado';

export type WindowStyle =
  | 'SH'         // Single Hung
  | 'RoundTopSH' // Round Top Single Hung
  | 'XO'         // Single Glider OX side
  | 'OX'         // Single Glider XO side
  | 'XOX'        // 3-Lite Glider
  | 'PW'         // Picture Window / Fixed
  | 'DH'         // Double Hung (Coronado only)
  | 'XX'         // Double Glider (Coronado only)
  | 'Casement'
  | 'Awning'
  | 'Geometric';

export type FrameType = 'Block' | 'RetroFin' | 'BrickMould';
export type FrameColor = 'White' | 'Adobe' | 'Tan' | 'Designer Black';
export type GlassPackage = 'Standard' | 'Infinit-e' | 'SunMatrix' | 'SunShield';
export type GridStyle = 'None' | 'FlatColonial' | 'SculpturedColonial' | 'SculpturedInch';
export type ObscureGlass =
  | 'None'
  | 'P516'
  | 'EtchMatte'
  | 'GlueChip'
  | 'Rain'
  | 'DeltaFrost'
  | 'Reed'
  | 'Flemish';
export type ScreenType = 'Half' | 'Full' | 'None';
export type HouseSide = 'Front' | 'Right' | 'Back' | 'Left';
export type GeometricCategory = 1 | 2 | 3;

export type ThermaCoatColor =
  | 'None'
  | 'ArchitecturalBlack'
  | 'ArchitecturalBronze'
  | 'ArchitecturalSilver'
  | 'ClassicGray'
  | 'Espresso'
  | 'Taupe'
  | 'RedPepper'
  | 'RoseWood'
  | 'DesertTan'
  | 'Sandstone'
  | 'DivineWine'
  | 'ForestGreen';

export type HardwareLock = 'Standard' | 'TrueAction' | 'ArchFinish';
export type ArchFinishColor = 'SatinBlack' | 'Bronze' | 'Brass' | 'Nickel';

// Patio door types
export type SlidingDoorConfig = 'XO' | 'OX' | 'XOO' | 'OOX' | 'OXO' | 'OXXO';
export type FrenchDoorConfig = 'X' | 'XO' | 'OX' | 'XX' | 'OXO' | 'OXXO';
export type DoorRailStyle = 'Standard' | 'French';
// Sliding door handle: standard (white/tan/adobe) or an architectural finish on the interior only / both sides
// Handle design (no price difference)
export type HandleDesign = 'Traditional' | 'Contemporary';
export type SlidingHandleStyle = 'Standard' | 'Interior' | 'InteriorExterior';
// Anlin in-glass pet (doggie) door, dual flap
export type PetDoorSize = 'None' | 'Small' | 'Medium' | 'Large' | 'XLarge';

// Door vendor / brand. Anlin is priced by United Inches; Love That Door by square foot.
export type DoorBrand = 'Anlin' | 'LoveThatDoor';
// Love That Door product lines
export type LoveThatDoorLine = 'IronEntry' | 'PatioSlider';
export type LoveThatDoorBiometric = 'none' | 'standard' | 'wifi';

// Custom line-item adder for extra construction (e.g. increase opening, add header).
// price is what the customer is charged per unit (not marked up); cost is HPR's internal cost per unit.
export interface Adder {
  id: string;
  description: string;
  price: number;
  cost?: number;
}

export interface WindowEntry {
  id: string;
  side: HouseSide;
  width: number;
  height: number;
  style: WindowStyle;
  quantity: number;
  note: string;
  geometricCategory?: GeometricCategory;
  // Per-window overrides
  seriesOverride?: WindowSeries;
  frameColorOverride?: FrameColor;
  glassOverride?: GlassPackage;
  gridOverride?: GridStyle;
  frameTypeOverride?: FrameType;
  tempered: boolean;
  obscure: ObscureGlass;
  screenOverride?: ScreenType;
  thermaCoatOverride?: ThermaCoatColor;
  soundPackageOverride?: boolean;
  hardwareLockOverride?: HardwareLock;
  argonOverride?: boolean;
  customVentSize?: boolean;
  windowLimitingDevice?: boolean;
  adders?: Adder[];
  extraNotes: string;
  // Whether this line is priced into the quote. Undefined is treated as true for saved projects.
  includedInQuote?: boolean;
}

export interface PatioDoortEntry {
  id: string;
  side: HouseSide;
  doorType: 'Sliding' | 'French';
  config: SlidingDoorConfig | FrenchDoorConfig;
  railStyle: DoorRailStyle;
  width: number;
  height: number;
  quantity: number;
  note: string;
  tempered: boolean;
  glassOverride?: GlassPackage;
  gridOverride?: GridStyle;
  frameColorOverride?: FrameColor;
  extraNotes: string;
  // Whether this line is priced into the quote. Undefined is treated as true for saved projects.
  includedInQuote?: boolean;
  // French door specific
  overHeight?: boolean; // over 84"
  panelCount?: 1 | 2;
  archFinish?: boolean;
  operableSideLites?: number;
  handleFinish?: ArchFinishColor | 'Standard';
  // Anlin door edit panel
  thermaCoatOverride?: ThermaCoatColor; // doors default to no ThermaCoat (not inherited from window globals)
  adders?: Adder[];
  handleDesign?: HandleDesign; // undefined = Traditional
  slidingHandleStyle?: SlidingHandleStyle;
  quadLock?: boolean;
  keyedCylinder?: boolean;
  extPullHandle?: boolean;
  deadBolt?: boolean;
  stainlessRollers?: boolean;
  petDoor?: PetDoorSize; // undefined = None
  // ── Vendor / brand ──
  // Undefined is treated as 'Anlin' for backward compatibility with saved projects.
  brand?: DoorBrand;
  // ── Love That Door specific (priced by square foot) ──
  ltdLine?: LoveThatDoorLine;
  ltdSliderPanels?: 2 | 3 | 4 | 6;
  ltdColor?: string;
  ltdGlassOption?: string;
  ltdThermallyBroken?: boolean; // iron doors: +20% on the per-sq-ft door portion
  ltdElectricGlass?: boolean;   // +$25 / sq ft
  ltdPivotUpgrade?: boolean;    // iron doors: +$1,000
  ltdLongPulls?: boolean;       // +$200
  ltdBiometricLock?: LoveThatDoorBiometric; // standard +$300, wifi +$400
}

export interface GlobalOptions {
  series: WindowSeries;
  frameColor: FrameColor;
  glassPackage: GlassPackage;
  grids: GridStyle;
  frameType: FrameType;
  soundPackage: boolean;
  hardwareLock: HardwareLock;
  hardwareFinish: ArchFinishColor | 'Standard';
  screenType: ScreenType;
  thermaCoat: ThermaCoatColor;
  argonGas: boolean;
}

export interface WindowSillReplacement {
  quantity: number;
  unitPrice: number;
}

export interface HomeownerInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

export interface SalesRepInfo {
  name: string;
  phone: string;
  email: string;
}

export interface PricingConfig {
  margin: number; // 0.20 to 0.70
  discountType: 'none' | 'percent' | 'flat' | 'perWindow';
  discountValue: number;
  discountLabel: string;
  insuranceJob: boolean;
  depositPercent: number;
  paymentMethod: 'Check' | 'ACH' | 'CreditCard';
  showCertificationsPage: boolean;
  // Show per-line prices on the proposal. Undefined is treated as true for saved projects.
  showWindowPrices?: boolean;
  showDoorPrices?: boolean;
  // Show the financing options block on the proposal. Undefined is treated as true.
  showFinancing?: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  homeowner: HomeownerInfo;
  salesRep: SalesRepInfo;
  windows: WindowEntry[];
  doors: PatioDoortEntry[];
  globalOptions: GlobalOptions;
  windowSills: WindowSillReplacement;
  pricing: PricingConfig;
  additionalDetails: string;
}

export interface PriceBreakdown {
  windowId: string;
  listPrice: number;
  hprCost: number;
  laborCost: number;
  totalCost: number;
  sellPrice: number;
  quantity: number;
  lineTotal: number;
  lineCost: number;
}

export interface ProjectTotals {
  listPriceTotal: number;
  hprCostTotal: number;
  laborCostTotal: number;
  totalCost: number;
  subtotal: number;
  discountAmount: number;
  totalContractAmount: number;
  grossProfit: number;
  marginPercent: number;
  windowSillTotal: number;
  depositAmount: number;
}
