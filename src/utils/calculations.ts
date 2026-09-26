import type {
  WindowEntry, PatioDoortEntry, GlobalOptions, Adder,
  WindowSeries, FrameType, FrameColor, GlassPackage,
  GridStyle, ObscureGlass, ScreenType, GeometricCategory,
  PricingConfig, ProjectTotals, PriceBreakdown,
} from '../types';
import {
  getUiBracketIndex,
  CAT_PAN_BASE, CORONADO_BASE,
  RETRO_FIN_ADDERS, BRICK_MOULD_ADDERS,
  GLAZING_ADDERS, SCREEN_PRICES,
  CASEMENT_AWNING_BRACKETS, CASEMENT_BASE,
  GEOMETRIC_RATES,
  SLIDING_DOOR_2PANEL_BRACKETS, SLIDING_DOOR_2PANEL,
  SLIDING_DOOR_3PANEL_BRACKETS, SLIDING_DOOR_3PANEL_BASE,
  SLIDING_DOOR_4PANEL_BRACKETS, SLIDING_DOOR_4PANEL_BASE,
  FRENCH_SINGLE_X, FRENCH_XO_OX, FRENCH_XX, FRENCH_OXO,
  SLIDING_DOOR_3PANEL_GLAZING, SLIDING_DOOR_4PANEL_GLAZING,
  FRENCH_SINGLE_X_GLAZING, FRENCH_XO_OX_XX_GLAZING, FRENCH_OXO_GLAZING,
  type DoorGlazingAdders,
  FLAT_OPTIONS, COLOR_UPCHARGE, THERMA_COAT_UPCHARGE, DESIGNER_BLACK, DESIGNER_BLACK_UPCHARGE,
  HPR_COST_MULTIPLIER, LABOR_COST_PER_WINDOW,
  LOVE_THAT_DOOR_PRICING, ANLIN_DOOR_INSTALL_COST, LOVE_THAT_DOOR_INSTALL_COST, FINANCING,
} from '../data/pricing';

function findBracketIndex(ui: number, brackets: readonly { min: number; max: number }[]): number | null {
  for (let i = 0; i < brackets.length; i++) {
    if (ui >= brackets[i].min && ui <= brackets[i].max) return i;
  }
  return null;
}

// Resolve effective option for a window (per-window override or global)
function effective<T>(perWindow: T | undefined, global: T): T {
  return perWindow !== undefined ? perWindow : global;
}

// Frame color + ThermaCoat price multiplier. Designer Black replaces both (11% over ThermaCoat).
export function windowColorMultiplier(color: FrameColor, thermaCoat: string): number {
  if (color === DESIGNER_BLACK) return DESIGNER_BLACK_UPCHARGE;
  const thermaMultiplier = thermaCoat !== 'None' ? THERMA_COAT_UPCHARGE : 1;
  return (COLOR_UPCHARGE[color] ?? 1) * thermaMultiplier;
}

// Glass / obscure / tempered / grid / sound / argon adders for a UI bracket.
// Geometrics: the price book adds a $165 "pattern charge for tempered glass" on top of the UI-list tempered adder.
function glazingAdders(
  bIdx: number,
  window: WindowEntry,
  o: { glass: GlassPackage; grids: GridStyle; sound: boolean; argon: boolean },
  geometric = false,
): number {
  let add = 0;

  if (o.glass === 'Infinit-e') add += GLAZING_ADDERS.InfiniteE[bIdx];
  else if (o.glass === 'SunMatrix') add += GLAZING_ADDERS.SunMatrix[bIdx];
  else if (o.glass === 'SunShield') add += GLAZING_ADDERS.SunShield[bIdx];

  if (window.tempered) {
    add += GLAZING_ADDERS.Tempered[bIdx];
    if (geometric) add += FLAT_OPTIONS.GeometricTemperedPattern;
  }

  if (window.obscure !== 'None') {
    const specialPatterns: ObscureGlass[] = ['EtchMatte', 'GlueChip', 'Rain', 'DeltaFrost', 'Reed', 'Flemish'];
    add += specialPatterns.includes(window.obscure) ? GLAZING_ADDERS.ObscureSpecial[bIdx] : GLAZING_ADDERS.ObscureStd[bIdx];
  }

  if (o.grids === 'FlatColonial') add += GLAZING_ADDERS.GridsFlat[bIdx];
  else if (o.grids === 'SculpturedColonial' || o.grids === 'SculpturedInch') add += GLAZING_ADDERS.GridsSculpt[bIdx];

  if (o.sound) add += GLAZING_ADDERS.SoundPkg[bIdx];
  if (o.argon) add += GLAZING_ADDERS.ArgonGas[bIdx];

  return add;
}

// ThermaCoat is active unless it's "None" or the window is Designer Black (which excludes ThermaCoat).
export function thermaCoatActive(window: WindowEntry, globals: GlobalOptions): boolean {
  const color = effective(window.frameColorOverride, globals.frameColor);
  return color !== DESIGNER_BLACK && effective(window.thermaCoatOverride, globals.thermaCoat) !== 'None';
}

// ThermaCoat windows can only have Flat Colonial grids (or none).
export function effectiveGridStyle(window: WindowEntry, globals: GlobalOptions): GridStyle {
  const grids = effective(window.gridOverride, globals.grids);
  return grids !== 'None' && thermaCoatActive(window, globals) ? 'FlatColonial' : grids;
}

export function calcWindowListPrice(
  window: WindowEntry,
  globals: GlobalOptions,
): number | null {
  const ui = window.width + window.height;
  const series = effective(window.seriesOverride, globals.series);
  const frame = effective(window.frameTypeOverride, globals.frameType);
  const color = effective(window.frameColorOverride, globals.frameColor);
  const glass = effective(window.glassOverride, globals.glassPackage);
  const grids = effectiveGridStyle(window, globals);
  const screen = effective(window.screenOverride, globals.screenType);
  const sound = effective(window.soundPackageOverride, globals.soundPackage);
  const argon = true; // Argon gas is standard on all Anlin windows (no longer optional)
  const thermaCoat = effective(window.thermaCoatOverride, globals.thermaCoat);

  let base: number | null = null;

  // ── Geometric ──
  if (window.style === 'Geometric') {
    const cat = (window.geometricCategory ?? 1) as GeometricCategory;
    const seriesKey = series === 'Coronado' ? 'Coronado' : 'CatPan';
    const frameKey = frame === 'RetroFin' ? 'RetroFin' : frame === 'BrickMould' ? 'BrickMould' : 'Block';
    const rate = GEOMETRIC_RATES[seriesKey][cat][frameKey as keyof typeof GEOMETRIC_RATES['CatPan'][1]];
    if (rate == null) return null;
    base = rate * ui;
    // Glazing options apply to geometrics too, priced off the UI bracket.
    const gIdx = getUiBracketIndex(ui);
    if (gIdx === null) return null;
    base += glazingAdders(gIdx, window, { glass, grids, sound, argon }, true);
    return Math.round(base * windowColorMultiplier(color, thermaCoat) * 100) / 100;
  }

  // ── Casement / Awning (Coronado only) ──
  if (window.style === 'Casement' || window.style === 'Awning') {
    const bIdx = findBracketIndex(ui, CASEMENT_AWNING_BRACKETS);
    if (bIdx === null) return null;
    if (window.style === 'Awning') {
      base = CASEMENT_BASE.Awning[bIdx];
    } else {
      // Default to Operable casement; user can note "Fixed" in notes
      base = CASEMENT_BASE.Operable[bIdx];
    }
    if (base == null) return null;
  } else {
    // ── Regular windows ──
    const bIdx = getUiBracketIndex(ui);
    if (bIdx === null) return null;

    if (series === 'Coronado') {
      const styleMap: Record<string, keyof typeof CORONADO_BASE> = {
        DH: 'DH', XX: 'XX', XOX: 'XOX', PW: 'PW',
        XO: 'XX', OX: 'XX', // map single gliders to double glider table for Coronado
        SH: 'DH', RoundTopSH: 'DH', // map SH variants to DH for Coronado
      };
      const coronadoStyle = styleMap[window.style] ?? 'PW';
      base = CORONADO_BASE[coronadoStyle][bIdx];
    } else {
      // Catalina / Panoramic
      const styleMap: Record<string, keyof typeof CAT_PAN_BASE> = {
        SH: 'SH', RoundTopSH: 'SH', XO: 'XO', OX: 'XO', XOX: 'XOX', PW: 'PW',
        DH: 'SH', XX: 'XO', // fallback
      };
      const catStyle = styleMap[window.style] ?? 'PW';
      base = CAT_PAN_BASE[catStyle][bIdx];
    }

    if (base == null) return null;

    // Round Top SH geometric adder
    if (window.style === 'RoundTopSH') {
      base += 220;
    }

    // Frame adder
    const frameStyleMap: Record<string, keyof typeof RETRO_FIN_ADDERS> = {
      SH: 'SH', RoundTopSH: 'SH', XO: 'XO', OX: 'XO', XOX: 'XOX', PW: 'PW',
      DH: 'SH', XX: 'XO',
    };
    const adderKey = frameStyleMap[window.style] ?? 'PW';

    if (frame === 'RetroFin') {
      const adder = RETRO_FIN_ADDERS[adderKey][bIdx];
      if (adder != null) base += adder;
    } else if (frame === 'BrickMould') {
      const adder = BRICK_MOULD_ADDERS[adderKey][bIdx];
      if (adder != null) base += adder;
    }

    // ── Glazing adders ──
    base += glazingAdders(bIdx, window, { glass, grids, sound, argon });

    // Screen (full screen is upgrade; half screen included)
    if (screen === 'Full' && window.style !== 'PW') {
      base += SCREEN_PRICES[bIdx];
    }

    // Hardware
    const lock = effective(window.hardwareLockOverride, globals.hardwareLock);
    if (lock === 'TrueAction') {
      base += FLAT_OPTIONS.TrueActionLock;
    } else if (lock === 'ArchFinish') {
      base += FLAT_OPTIONS.ArchLock;
    }

    // Custom vent
    if (window.customVentSize) {
      base += FLAT_OPTIONS.CustomVentSize;
    }

    // Window limiting device
    if (window.windowLimitingDevice) {
      base += FLAT_OPTIONS.WindowLimitingDevice;
    }
  }

  // Color upcharge
  base = base * windowColorMultiplier(color, thermaCoat);

  return Math.round(base * 100) / 100;
}

export function calcWindowCostAndSell(
  listPrice: number,
  quantity: number,
  margin: number,
  opts?: { laborPerUnit?: number; listIsCost?: boolean; adderPerUnit?: number; adderCostPerUnit?: number },
): { hprCost: number; laborCost: number; totalCost: number; sellPrice: number; lineTotal: number; lineCost: number } {
  // For Anlin the price table is a retail "list" price and HPR pays a fraction of it.
  // For vendors whose guide price is already HPR's cost (e.g. Love That Door), pass listIsCost.
  const hprCost = opts?.listIsCost ? listPrice : listPrice * HPR_COST_MULTIPLIER;
  const laborCost = opts?.laborPerUnit ?? LABOR_COST_PER_WINDOW;
  const baseCostPerUnit = hprCost + laborCost;
  const totalCostPerUnit = baseCostPerUnit + (opts?.adderCostPerUnit ?? 0);
  // Adders are billed to the customer as entered (no markup). Their cost counts toward HPR cost only,
  // so it does not feed the margin-based sell price.
  const sellPricePerUnit = baseCostPerUnit / (1 - margin) + (opts?.adderPerUnit ?? 0);
  return {
    hprCost,
    laborCost,
    totalCost: totalCostPerUnit,
    sellPrice: sellPricePerUnit,
    lineTotal: sellPricePerUnit * quantity,
    lineCost: totalCostPerUnit * quantity,
  };
}

// ── Love That Door — priced by square foot (see LOVE_THAT_DOOR_PRICING) ──
// Returns the vendor guide total, which is treated as HPR cost downstream.
export function calcLoveThatDoorPrice(door: PatioDoortEntry): number | null {
  const sqFt = (door.width * door.height) / 144;
  if (!sqFt || sqFt <= 0) return null;
  const P = LOVE_THAT_DOOR_PRICING;

  let doorPortion = sqFt * P.pricePerSqFt;
  if (door.ltdThermallyBroken) doorPortion *= 1 + P.thermallyBrokenUpcharge;

  let total = doorPortion + P.hardwarePerSet + P.delivery;
  if (door.ltdElectricGlass) total += sqFt * P.electricGlassPerSqFt;
  if (door.ltdPivotUpgrade) total += P.pivotUpgrade;
  if (door.ltdLongPulls) total += P.longPulls;
  if (door.ltdBiometricLock === 'standard') total += P.biometricLock;
  else if (door.ltdBiometricLock === 'wifi') total += P.biometricLockWifi;

  return Math.round(total * 100) / 100;
}

// Per-vendor cost model for a door line item.
// Anlin: guide value is retail list -> HPR pays HPR_COST_MULTIPLIER of it.
// Love That Door: guide value is already HPR's cost.
export function adderPerUnit(item: { adders?: Adder[] }): number {
  return (item.adders ?? []).reduce((sum, a) => sum + (a.price || 0), 0);
}

export function adderCostPerUnit(item: { adders?: Adder[] }): number {
  return (item.adders ?? []).reduce((sum, a) => sum + (a.cost ?? 0), 0);
}

export function getWindowCostParams(w: WindowEntry): { adderPerUnit: number; adderCostPerUnit: number } {
  return { adderPerUnit: adderPerUnit(w), adderCostPerUnit: adderCostPerUnit(w) };
}

export function getDoorCostParams(door: PatioDoortEntry): { laborPerUnit: number; listIsCost: boolean; adderPerUnit: number; adderCostPerUnit: number } {
  if ((door.brand ?? 'Anlin') === 'LoveThatDoor') {
    return { laborPerUnit: LOVE_THAT_DOOR_INSTALL_COST, listIsCost: true, adderPerUnit: adderPerUnit(door), adderCostPerUnit: adderCostPerUnit(door) };
  }
  return { laborPerUnit: ANLIN_DOOR_INSTALL_COST, listIsCost: false, adderPerUnit: adderPerUnit(door), adderCostPerUnit: adderCostPerUnit(door) };
}

// Display label for a door line item, shared by the schedule, proposal and PDF.
export function doorDisplayName(d: PatioDoortEntry): string {
  if ((d.brand ?? 'Anlin') === 'LoveThatDoor') {
    if (d.ltdLine === 'PatioSlider') {
      return `Love That Door — Euro Slider${d.ltdSliderPanels ? ` (${d.ltdSliderPanels}-Panel)` : ''}`;
    }
    return 'Love That Door — Iron Entry';
  }
  return `${d.doorType} Door – ${d.config}`;
}

// ThermaCoat on a door is set per door only (window globals don't apply). Designer Black excludes it.
export function doorThermaCoatActive(door: PatioDoortEntry, globals: GlobalOptions): boolean {
  const color = effective(door.frameColorOverride, globals.frameColor);
  return color !== DESIGNER_BLACK && (door.thermaCoatOverride ?? 'None') !== 'None';
}

// ThermaCoat doors can only have Flat Colonial grids (or none).
export function doorEffectiveGridStyle(door: PatioDoortEntry, globals: GlobalOptions): GridStyle {
  const grids = effective(door.gridOverride, globals.grids);
  return grids !== 'None' && doorThermaCoatActive(door, globals) ? 'FlatColonial' : grids;
}

function doorGlazingAdders(
  a: DoorGlazingAdders,
  idx: number,
  door: PatioDoortEntry,
  globals: GlobalOptions,
): number {
  let add = 0;
  const glass = effective(door.glassOverride, globals.glassPackage);
  if (glass === 'Infinit-e') add += a.InfiniteE[idx];
  else if (glass === 'SunMatrix') add += a.SunMatrix[idx];
  else if (glass === 'SunShield') add += a.SunShield[idx];

  const grids = doorEffectiveGridStyle(door, globals);
  if (grids === 'FlatColonial') add += a.GridsFlat[idx];
  else if (grids === 'SculpturedColonial' || grids === 'SculpturedInch') add += a.GridsSculpt[idx];

  // Argon gas is standard on all Anlin doors (always included in the price)
  add += a.ArgonGas[idx];
  return add;
}

export function calcDoorListPrice(door: PatioDoortEntry, globals: GlobalOptions): number | null {
  if ((door.brand ?? 'Anlin') === 'LoveThatDoor') {
    return calcLoveThatDoorPrice(door);
  }

  const ui = door.width + door.height;
  const color = effective(door.frameColorOverride, globals.frameColor);

  let base: number | null = null;

  if (door.doorType === 'Sliding') {
    const config = door.config as string;
    if (config === 'XO' || config === 'OX') {
      const bIdx = findBracketIndex(ui, SLIDING_DOOR_2PANEL_BRACKETS);
      if (bIdx === null) return null;
      base = SLIDING_DOOR_2PANEL.base[bIdx] + doorGlazingAdders(SLIDING_DOOR_2PANEL, bIdx, door, globals);
    } else if (config === 'XOO' || config === 'OOX' || config === 'OXO') {
      const bIdx = findBracketIndex(ui, SLIDING_DOOR_3PANEL_BRACKETS);
      if (bIdx === null) return null;
      base = SLIDING_DOOR_3PANEL_BASE[bIdx] + doorGlazingAdders(SLIDING_DOOR_3PANEL_GLAZING, bIdx, door, globals);
    } else if (config === 'OXXO') {
      const bIdx = findBracketIndex(ui, SLIDING_DOOR_4PANEL_BRACKETS);
      if (bIdx === null) return null;
      base = SLIDING_DOOR_4PANEL_BASE[bIdx] + doorGlazingAdders(SLIDING_DOOR_4PANEL_GLAZING, bIdx, door, globals);
    }
    if (base == null) return null;

    // Sliding handle / lock options
    if (door.slidingHandleStyle === 'Interior') base += FLAT_OPTIONS.HandleFinishIntOnly;
    else if (door.slidingHandleStyle === 'InteriorExterior') base += FLAT_OPTIONS.HandleFinishIntExt;
    if (door.quadLock) base += FLAT_OPTIONS.QuadLock;
    else if (door.keyedCylinder) {
      base += FLAT_OPTIONS.KeyedLockCylinder;
      if (door.extPullHandle) base += FLAT_OPTIONS.ExtPullHandle;
    }
    if (door.deadBolt) base += FLAT_OPTIONS.DeadBoltUpperVent;
    if (door.stainlessRollers) base += FLAT_OPTIONS.StainlessRollers;
  } else {
    // French doors
    const config = door.config as string;
    let glazing: DoorGlazingAdders | null = null;
    let table: { min: number; max: number; base: number }[] | null = null;
    if (config === 'X') { table = FRENCH_SINGLE_X; glazing = FRENCH_SINGLE_X_GLAZING; }
    else if (config === 'XO' || config === 'OX') { table = FRENCH_XO_OX; glazing = FRENCH_XO_OX_XX_GLAZING; }
    else if (config === 'XX') { table = FRENCH_XX; glazing = FRENCH_XO_OX_XX_GLAZING; }
    else if (config === 'OXO') { table = FRENCH_OXO; glazing = FRENCH_OXO_GLAZING; }
    if (!table || !glazing) return null;
    const bIdx = findBracketIndex(ui, table);
    if (bIdx === null) return null;
    base = table[bIdx].base + doorGlazingAdders(glazing, bIdx, door, globals);
    // French door adders
    if (door.overHeight) {
      base += door.panelCount === 2
        ? FLAT_OPTIONS.FrenchOverHeight2Panel
        : FLAT_OPTIONS.FrenchOverHeight1Panel;
    }
    if (door.archFinish) {
      const panels = (config.match(/X/g) || []).length;
      base += panels >= 2 ? FLAT_OPTIONS.FrenchArchFinishXX : FLAT_OPTIONS.FrenchArchFinishX;
    }
    if (door.operableSideLites) {
      base += FLAT_OPTIONS.FrenchOperableSideLite * door.operableSideLites;
    }
  }

  const thermaCoat = doorThermaCoatActive(door, globals) ? door.thermaCoatOverride! : 'None';
  return Math.round(base * windowColorMultiplier(color, thermaCoat) * 100) / 100;
}

export function calcAllBreakdowns(
  windows: WindowEntry[],
  doors: PatioDoortEntry[],
  globals: GlobalOptions,
  margin: number,
): PriceBreakdown[] {
  const results: PriceBreakdown[] = [];

  for (const w of windows) {
    const list = calcWindowListPrice(w, globals);
    if (list == null) continue;
    const { hprCost, laborCost, totalCost, sellPrice, lineTotal, lineCost } =
      calcWindowCostAndSell(list, w.quantity, margin, getWindowCostParams(w));
    results.push({
      windowId: w.id,
      listPrice: list,
      hprCost,
      laborCost,
      totalCost,
      sellPrice,
      quantity: w.quantity,
      lineTotal,
      lineCost,
    });
  }

  for (const d of doors) {
    const list = calcDoorListPrice(d, globals);
    if (list == null) continue;
    const { hprCost, laborCost, totalCost, sellPrice, lineTotal, lineCost } =
      calcWindowCostAndSell(list, d.quantity, margin, getDoorCostParams(d));
    results.push({
      windowId: d.id,
      listPrice: list,
      hprCost,
      laborCost,
      totalCost,
      sellPrice,
      quantity: d.quantity,
      lineTotal,
      lineCost,
    });
  }

  return results;
}

export function calcProjectTotals(
  breakdowns: PriceBreakdown[],
  windowSillQty: number,
  windowSillUnitPrice: number,
  pricing: PricingConfig,
  windowCount: number,
): ProjectTotals {
  const listPriceTotal = breakdowns.reduce((s, b) => s + b.listPrice * b.quantity, 0);
  const hprCostTotal = breakdowns.reduce((s, b) => s + b.lineCost, 0);
  const laborCostTotal = breakdowns.reduce((s, b) => s + b.laborCost * b.quantity, 0);
  const totalCost = hprCostTotal;

  const windowSillTotal = windowSillQty * windowSillUnitPrice;
  const rawSubtotal = breakdowns.reduce((s, b) => s + b.lineTotal, 0) + windowSillTotal;

  // Discount
  let discountAmount = 0;
  if (pricing.discountType === 'percent') {
    discountAmount = rawSubtotal * (pricing.discountValue / 100);
  } else if (pricing.discountType === 'flat') {
    discountAmount = pricing.discountValue;
  } else if (pricing.discountType === 'perWindow') {
    discountAmount = pricing.discountValue * windowCount;
  }

  const subtotal = rawSubtotal;
  const totalContractAmount = subtotal - discountAmount;
  const grossProfit = totalContractAmount - totalCost;
  const marginPercent = totalContractAmount > 0 ? (grossProfit / totalContractAmount) * 100 : 0;
  const depositAmount = totalContractAmount * (pricing.depositPercent / 100);

  return {
    listPriceTotal,
    hprCostTotal,
    laborCostTotal,
    totalCost,
    subtotal,
    discountAmount,
    totalContractAmount,
    grossProfit,
    marginPercent,
    windowSillTotal,
    depositAmount,
  };
}

// Low monthly payment option: the project total up to the financing cap is amortized at the
// financing APR over the term. Anything over the cap is shown as a deposit.
export function calcFinancing(total: number): { financed: number; deposit: number; monthly: number } {
  const financed = Math.min(Math.max(total, 0), FINANCING.monthlyMaxFinanced);
  const deposit = Math.max(total - FINANCING.monthlyMaxFinanced, 0);
  const r = FINANCING.monthlyApr / 12;
  const n = FINANCING.monthlyTermYears * 12;
  const monthly = financed <= 0 ? 0 : (financed * r) / (1 - Math.pow(1 + r, -n));
  return { financed, deposit, monthly };
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

export function formatCurrencyDecimal(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}
