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
export type FrameColor = 'White' | 'Adobe' | 'Tan';
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
  extraNotes: string;
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
  argonOverride?: boolean;
  extraNotes: string;
  // French door specific
  overHeight?: boolean; // over 84"
  panelCount?: 1 | 2;
  archFinish?: boolean;
  operableSideLites?: number;
  handleFinish?: ArchFinishColor | 'Standard';
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
