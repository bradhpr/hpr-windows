import type {
  WindowEntry, PatioDoortEntry, GlobalOptions,
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
  FLAT_OPTIONS, COLOR_UPCHARGE, THERMA_COAT_UPCHARGE,
  HPR_COST_MULTIPLIER, LABOR_COST_PER_WINDOW,
} from '../data/pricing';

function findBracketIndex(ui: number, brackets: readonly { min: number; max: number }[]): number | null {
  for (let i = 0; i < brackets.length; i++) {
    if (ui >= brackets[i].min && ui <= brackets[i].max) return i;
  }
  return null;
}

function findBracketBase(ui: number, table: { min: number; max: number; base: number }[]): number | null {
  for (const row of table) {
    if (ui >= row.min && ui <= row.max) return row.base;
  }
  return null;
}

// Resolve effective option for a window (per-window override or global)
function effective<T>(perWindow: T | undefined, global: T): T {
  return perWindow !== undefined ? perWindow : global;
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
  const grids = effective(window.gridOverride, globals.grids);
  const screen = effective(window.screenOverride, globals.screenType);
  const sound = effective(window.soundPackageOverride, globals.soundPackage);
  const argon = effective(window.argonOverride, globals.argonGas);
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
    const thermaMultiplier = thermaCoat !== 'None' ? THERMA_COAT_UPCHARGE : 1;
    return base * (COLOR_UPCHARGE[color] ?? 1) * thermaMultiplier;
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
    const bIdxForGlaze = bIdx;

    // Glass upgrade adder
    if (glass === 'Infinit-e') {
      base += GLAZING_ADDERS.InfiniteE[bIdxForGlaze];
    } else if (glass === 'SunMatrix') {
      base += GLAZING_ADDERS.SunMatrix[bIdxForGlaze];
    } else if (glass === 'SunShield') {
      base += GLAZING_ADDERS.SunShield[bIdxForGlaze];
    }

    // Tempered
    if (window.tempered) {
      base += GLAZING_ADDERS.Tempered[bIdxForGlaze];
    }

    // Obscure glass
    if (window.obscure !== 'None') {
      const specialPatterns: ObscureGlass[] = ['EtchMatte', 'GlueChip', 'Rain', 'DeltaFrost', 'Reed', 'Flemish'];
      if (specialPatterns.includes(window.obscure)) {
        base += GLAZING_ADDERS.ObscureSpecial[bIdxForGlaze];
      } else {
        base += GLAZING_ADDERS.ObscureStd[bIdxForGlaze];
      }
    }

    // Grids
    if (grids === 'FlatColonial') {
      base += GLAZING_ADDERS.GridsFlat[bIdxForGlaze];
    } else if (grids === 'SculpturedColonial' || grids === 'SculpturedInch') {
      base += GLAZING_ADDERS.GridsSculpt[bIdxForGlaze];
    }

    // Sound package
    if (sound) {
      base += GLAZING_ADDERS.SoundPkg[bIdxForGlaze];
    }

    // Argon gas
    if (argon) {
      base += GLAZING_ADDERS.ArgonGas[bIdxForGlaze];
    }

    // Screen (full screen is upgrade; half screen included)
    if (screen === 'Full' && window.style !== 'PW') {
      base += SCREEN_PRICES[bIdxForGlaze];
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
  const thermaMultiplier = thermaCoat !== 'None' ? THERMA_COAT_UPCHARGE : 1;
  base = base * (COLOR_UPCHARGE[color] ?? 1) * thermaMultiplier;

  return Math.round(base * 100) / 100;
}

export function calcWindowCostAndSell(
  listPrice: number,
  quantity: number,
  margin: number,
): { hprCost: number; laborCost: number; totalCost: number; sellPrice: number; lineTotal: number; lineCost: number } {
  const hprCost = listPrice * HPR_COST_MULTIPLIER;
  const laborCost = LABOR_COST_PER_WINDOW;
  const totalCostPerUnit = hprCost + laborCost;
  const sellPricePerUnit = totalCostPerUnit / (1 - margin);
  return {
    hprCost,
    laborCost,
    totalCost: totalCostPerUnit,
    sellPrice: sellPricePerUnit,
    lineTotal: sellPricePerUnit * quantity,
    lineCost: totalCostPerUnit * quantity,
  };
}

export function calcDoorListPrice(door: PatioDoortEntry, globals: GlobalOptions): number | null {
  const ui = door.width + door.height;
  const color = effective(door.frameColorOverride, globals.frameColor);

  let base: number | null = null;

  if (door.doorType === 'Sliding') {
    const config = door.config as string;
    if (config === 'XO' || config === 'OX') {
      const bIdx = findBracketIndex(ui, SLIDING_DOOR_2PANEL_BRACKETS);
      if (bIdx === null) return null;
      base = SLIDING_DOOR_2PANEL.base[bIdx];
      // Glass adder
      const glass = effective(door.glassOverride, globals.glassPackage);
      if (glass === 'Infinit-e') base += SLIDING_DOOR_2PANEL.InfiniteE[bIdx];
      else if (glass === 'SunMatrix') base += SLIDING_DOOR_2PANEL.SunMatrix[bIdx];
      else if (glass === 'SunShield') base += SLIDING_DOOR_2PANEL.SunShield[bIdx];
      // Grids
      const grids = effective(door.gridOverride, globals.grids);
      if (grids === 'FlatColonial') base += SLIDING_DOOR_2PANEL.GridsFlat[bIdx];
      else if (grids === 'SculpturedColonial' || grids === 'SculpturedInch') base += SLIDING_DOOR_2PANEL.GridsSculpt[bIdx];
      // Argon
      if (effective(door.argonOverride, globals.argonGas)) base += SLIDING_DOOR_2PANEL.ArgonGas[bIdx];
    } else if (config === 'XOO' || config === 'OOX' || config === 'OXO') {
      const bIdx = findBracketIndex(ui, SLIDING_DOOR_3PANEL_BRACKETS);
      if (bIdx === null) return null;
      base = SLIDING_DOOR_3PANEL_BASE[bIdx];
    } else if (config === 'OXXO') {
      const bIdx = findBracketIndex(ui, SLIDING_DOOR_4PANEL_BRACKETS);
      if (bIdx === null) return null;
      base = SLIDING_DOOR_4PANEL_BASE[bIdx];
    }
  } else {
    // French doors
    const config = door.config as string;
    if (config === 'X') {
      base = findBracketBase(ui, FRENCH_SINGLE_X);
    } else if (config === 'XO' || config === 'OX') {
      base = findBracketBase(ui, FRENCH_XO_OX);
    } else if (config === 'XX') {
      base = findBracketBase(ui, FRENCH_XX);
    } else if (config === 'OXO') {
      base = findBracketBase(ui, FRENCH_OXO);
    }
    if (base == null) return null;
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

  if (base == null) return null;
  return Math.round(base * (COLOR_UPCHARGE[color] ?? 1) * 100) / 100;
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
      calcWindowCostAndSell(list, w.quantity, margin);
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
      calcWindowCostAndSell(list, d.quantity, margin);
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

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

export function formatCurrencyDecimal(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
}
