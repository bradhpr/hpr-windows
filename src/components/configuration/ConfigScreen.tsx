import { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp, Eye, EyeOff, Pencil } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { Select, Toggle, Btn, Card, SectionHeader, ColorSwatch, StatBadge } from '../shared/UI';
import { WindowStyleSVG, WINDOW_STYLE_LABELS } from '../shared/WindowStyleSVG';
import { calcWindowListPrice, calcWindowCostAndSell, calcDoorListPrice, calcProjectTotals, calcAllBreakdowns, formatCurrency } from '../../utils/calculations';
import type { GlobalOptions, WindowEntry, ObscureGlass, ScreenType, GridStyle, WindowStyle, FrameType, FrameColor, GlassPackage, ThermaCoatColor } from '../../types';
import WindowOverridePanel from './WindowOverridePanel';

const SERIES_OPTS = [
  { value: 'Panoramic', label: 'Panoramic (standard)' },
  { value: 'Catalina', label: 'Catalina' },
  { value: 'Coronado', label: 'Coronado (premium)' },
];
const FRAME_COLOR_OPTS = [
  { value: 'White', label: 'White (standard)' },
  { value: 'Adobe', label: 'Adobe (+4%)' },
  { value: 'Tan', label: 'Tan (+4%)' },
];
const GLASS_OPTS = [
  { value: 'Infinit-e', label: 'Infinit-e (standard)' },
  { value: 'SunMatrix', label: 'SunMatrix (upgrade)' },
  { value: 'SunShield', label: 'SunShield (upgrade)' },
  { value: 'Standard', label: 'Standard (no upgrade)' },
];
const GRID_OPTS = [
  { value: 'None', label: 'No Grids' },
  { value: 'FlatColonial', label: '5/8" Flat Colonial' },
  { value: 'SculpturedColonial', label: '5/8" Sculptured' },
  { value: 'SculpturedInch', label: '1" Sculptured' },
];
const FRAME_TYPE_OPTS = [
  { value: 'Block', label: 'Block / Nail Fin (standard)' },
  { value: 'RetroFin', label: 'Retro-Fin' },
  { value: 'BrickMould', label: 'Brick Mould' },
];
const SCREEN_OPTS = [
  { value: 'Half', label: 'Half Screen (standard)' },
  { value: 'Full', label: 'Full Screen (upgrade)' },
  { value: 'None', label: 'No Screen' },
];
const HARDWARE_OPTS = [
  { value: 'Standard', label: 'Standard Cam Lock' },
  { value: 'TrueAction', label: 'True Action Lock (+$13.90)' },
  { value: 'ArchFinish', label: 'Arch Finishes (+$22.20)' },
];
const THERMA_COAT_OPTS = [
  { value: 'None', label: 'Not Included' },
  { value: 'ArchitecturalBlack', label: 'Architectural Black' },
  { value: 'ArchitecturalBronze', label: 'Architectural Bronze' },
  { value: 'ArchitecturalSilver', label: 'Architectural Silver' },
  { value: 'ClassicGray', label: 'Classic Gray' },
  { value: 'Espresso', label: 'Espresso' },
  { value: 'Taupe', label: 'Taupe' },
  { value: 'RedPepper', label: 'Red Pepper' },
  { value: 'RoseWood', label: 'Rose Wood' },
  { value: 'DesertTan', label: 'Desert Tan' },
  { value: 'Sandstone', label: 'Sandstone' },
  { value: 'DivineWine', label: 'Divine Wine' },
  { value: 'ForestGreen', label: 'Forest Green' },
];

const FRAME_COLOR_HEX: Record<string, string> = {
  White: '#FFFFFF',
  Adobe: '#C4A882',
  Tan: '#D2B48C',
};

export default function ConfigScreen() {
  const {
    currentProject, updateGlobalOptions, updatePricing,
    updateWindowSills, setPhase, internalView, toggleInternalView,
  } = useProjectStore();

  const { globalOptions: opts, windows, doors, pricing, windowSills } = currentProject;
  const [showGlobal, setShowGlobal] = useState(true);
  const [overrideWindowId, setOverrideWindowId] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(true);

  // Compute totals
  const breakdowns = calcAllBreakdowns(windows, doors, opts, pricing.margin);
  const totals = calcProjectTotals(breakdowns, windowSills.quantity, windowSills.unitPrice, pricing, windows.length + doors.length);

  const overrideWindow = overrideWindowId ? windows.find((w) => w.id === overrideWindowId) : null;

  function g(key: keyof GlobalOptions) {
    return opts[key] as string;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-hpr-blue text-white px-4 pt-safe-top pb-3 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Options & Pricing</h1>
            <p className="text-blue-200 text-xs">{currentProject.homeowner.name || 'Configure windows'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleInternalView} className="p-2 rounded-full bg-blue-800 hover:bg-blue-700">
              {internalView ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <div className="text-right">
              <div className="text-lg font-bold">{formatCurrency(totals.totalContractAmount)}</div>
              <div className="text-xs text-blue-200">{windows.length + doors.length} items</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-4xl mx-auto space-y-4">

        {/* Internal stats */}
        {internalView && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBadge label="HPR Cost" value={formatCurrency(totals.hprCostTotal)} />
            <StatBadge label="Sell Price" value={formatCurrency(totals.totalContractAmount)} />
            <StatBadge label="Gross Profit" value={formatCurrency(totals.grossProfit)} />
            <StatBadge label="Margin" value={`${totals.marginPercent.toFixed(1)}%`} />
          </div>
        )}

        {/* Global defaults */}
        <Card>
          <button
            className="flex w-full items-center justify-between px-4 py-3"
            onClick={() => setShowGlobal(!showGlobal)}
          >
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-hpr-blue" />
              <span className="font-semibold text-hpr-dark">Global Defaults (all windows)</span>
            </div>
            {showGlobal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showGlobal && (
            <div className="border-t px-4 py-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Window Series" value={g('series')} onChange={(e) => updateGlobalOptions({ series: e.target.value as GlobalOptions['series'] })} options={SERIES_OPTS} />
                <Select label="Glass Package" value={g('glassPackage')} onChange={(e) => updateGlobalOptions({ glassPackage: e.target.value as GlassPackage })} options={GLASS_OPTS} />
                <Select label="Frame Type" value={g('frameType')} onChange={(e) => updateGlobalOptions({ frameType: e.target.value as FrameType })} options={FRAME_TYPE_OPTS} />
                <Select label="Screen Type" value={g('screenType')} onChange={(e) => updateGlobalOptions({ screenType: e.target.value as ScreenType })} options={SCREEN_OPTS} />
                <Select label="Grids" value={g('grids')} onChange={(e) => updateGlobalOptions({ grids: e.target.value as GridStyle })} options={GRID_OPTS} />
                <Select label="Hardware / Cam Lock" value={g('hardwareLock')} onChange={(e) => updateGlobalOptions({ hardwareLock: e.target.value as GlobalOptions['hardwareLock'] })} options={HARDWARE_OPTS} />
                <Select label="ThermaCoat Color" value={g('thermaCoat')} onChange={(e) => updateGlobalOptions({ thermaCoat: e.target.value as ThermaCoatColor })} options={THERMA_COAT_OPTS} />
              </div>

              {/* Frame color swatches */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Frame Color</label>
                <div className="flex gap-3">
                  {FRAME_COLOR_OPTS.map((c) => (
                    <ColorSwatch
                      key={c.value}
                      color={FRAME_COLOR_HEX[c.value]}
                      label={c.label}
                      selected={opts.frameColor === c.value}
                      onClick={() => updateGlobalOptions({ frameColor: c.value as FrameColor })}
                    />
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Toggle label="Sound Package (SST)" checked={opts.soundPackage} onChange={(v) => updateGlobalOptions({ soundPackage: v })} />
                <Toggle label="Argon Gas" checked={opts.argonGas} onChange={(v) => updateGlobalOptions({ argonGas: v })} />
              </div>
            </div>
          )}
        </Card>

        {/* Margin slider */}
        <Card>
          <button
            className="flex w-full items-center justify-between px-4 py-3"
            onClick={() => setShowPricing(!showPricing)}
          >
            <span className="font-semibold text-hpr-dark">Margin & Discount</span>
            {showPricing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showPricing && (
            <div className="border-t px-4 py-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Margin</label>
                  <span className="text-lg font-bold text-hpr-blue">{(pricing.margin * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={70}
                  value={Math.round(pricing.margin * 100)}
                  onChange={(e) => updatePricing({ margin: parseInt(e.target.value) / 100 })}
                  className="w-full accent-hpr-blue"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>20%</span><span>70%</span>
                </div>
              </div>

              {internalView && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-600">HPR Cost:</span><span className="font-semibold">{formatCurrency(totals.hprCostTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Sell Price:</span><span className="font-semibold text-hpr-blue">{formatCurrency(totals.totalContractAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Gross Profit:</span><span className="font-semibold text-green-600">{formatCurrency(totals.grossProfit)}</span></div>
                </div>
              )}

              {/* Discount */}
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Discount Type"
                  value={pricing.discountType}
                  onChange={(e) => updatePricing({ discountType: e.target.value as typeof pricing.discountType })}
                  options={[
                    { value: 'none', label: 'No Discount' },
                    { value: 'percent', label: 'Percent Off' },
                    { value: 'flat', label: 'Flat Dollar Off' },
                    { value: 'perWindow', label: 'Per Window Off' },
                  ]}
                />
                {pricing.discountType !== 'none' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {pricing.discountType === 'percent' ? 'Percent' : 'Amount ($)'}
                    </label>
                    <input
                      type="number"
                      value={pricing.discountValue}
                      onChange={(e) => updatePricing({ discountValue: parseFloat(e.target.value) || 0 })}
                      className="h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-hpr-blue"
                    />
                  </div>
                )}
                {pricing.discountType !== 'none' && (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Discount Label</label>
                    <input
                      type="text"
                      value={pricing.discountLabel}
                      onChange={(e) => updatePricing({ discountLabel: e.target.value })}
                      placeholder="e.g., Multi-window discount"
                      className="h-12 px-3 w-full rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-hpr-blue"
                    />
                  </div>
                )}
              </div>

              {/* Window sills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Window Sill Qty</label>
                  <input type="number" min={0} value={windowSills.quantity}
                    onChange={(e) => updateWindowSills({ quantity: parseInt(e.target.value) || 0 })}
                    className="h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-hpr-blue"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Sill Unit Price</label>
                  <input type="number" min={0} value={windowSills.unitPrice}
                    onChange={(e) => updateWindowSills({ unitPrice: parseFloat(e.target.value) || 0 })}
                    className="h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-hpr-blue"
                  />
                </div>
              </div>

              {/* Deposit */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Deposit %</label>
                  <input type="number" min={0} max={100} value={pricing.depositPercent}
                    onChange={(e) => updatePricing({ depositPercent: parseInt(e.target.value) || 50 })}
                    className="h-12 px-3 w-full rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-hpr-blue"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Deposit Amount</label>
                  <div className="h-12 flex items-center px-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-bold text-hpr-blue">
                    {formatCurrency(totals.depositAmount)}
                  </div>
                </div>
              </div>

              <Select
                label="Payment Method"
                value={pricing.paymentMethod}
                onChange={(e) => updatePricing({ paymentMethod: e.target.value as typeof pricing.paymentMethod })}
                options={[
                  { value: 'Check', label: 'Check' },
                  { value: 'ACH', label: 'ACH Transfer' },
                  { value: 'CreditCard', label: 'Credit Card (+3% fee)' },
                ]}
              />
            </div>
          )}
        </Card>

        {/* Window list */}
        <Card>
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-hpr-dark">Window Schedule</h3>
            <p className="text-xs text-gray-400">Tap pencil to set per-window overrides</p>
          </div>
          <div className="divide-y">
            {windows.map((w) => {
              const listPrice = calcWindowListPrice(w, opts);
              const breakdown = listPrice != null
                ? calcWindowCostAndSell(listPrice, w.quantity, pricing.margin)
                : null;
              return (
                <WindowConfigRow
                  key={w.id}
                  window={w}
                  listPrice={listPrice}
                  breakdown={breakdown}
                  internalView={internalView}
                  onEdit={() => setOverrideWindowId(w.id)}
                />
              );
            })}
            {doors.length > 0 && doors.map((d) => {
              const listPrice = calcDoorListPrice(d, opts);
              const breakdown = listPrice != null
                ? calcWindowCostAndSell(listPrice, d.quantity, pricing.margin)
                : null;
              return (
                <div key={d.id} className="flex items-center px-4 py-3 gap-3">
                  <div className="text-2xl">🚪</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.doorType} Door – {d.config}</div>
                    <div className="text-xs text-gray-500">{d.side} · {d.width}×{d.height} · qty {d.quantity}</div>
                  </div>
                  <div className="text-right">
                    {breakdown ? (
                      <>
                        <div className="font-semibold text-hpr-blue">{formatCurrency(breakdown.lineTotal)}</div>
                        {internalView && <div className="text-xs text-gray-400">Cost: {formatCurrency(breakdown.lineCost)}</div>}
                      </>
                    ) : <span className="text-xs text-red-400">No price</span>}
                  </div>
                </div>
              );
            })}
            {windowSills.quantity > 0 && (
              <div className="flex items-center px-4 py-3 gap-3 bg-gray-50">
                <div className="flex-1">
                  <div className="text-sm font-medium">Window Sill Replacement</div>
                  <div className="text-xs text-gray-500">×{windowSills.quantity} @ {formatCurrency(windowSills.unitPrice)} each</div>
                </div>
                <div className="font-semibold">{formatCurrency(windowSills.quantity * windowSills.unitPrice)}</div>
              </div>
            )}
          </div>
          {/* Total footer */}
          <div className="border-t px-4 py-4 bg-gray-50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{pricing.discountLabel || 'Discount'}</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-hpr-blue pt-1 border-t">
              <span>Total Contract</span>
              <span>{formatCurrency(totals.totalContractAmount)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Override panel */}
      {overrideWindow && (
        <WindowOverridePanel
          window={overrideWindow}
          onClose={() => setOverrideWindowId(null)}
        />
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-3 flex gap-3">
        <Btn variant="secondary" className="flex-1" onClick={() => setPhase('measuring')}>
          ← Measure
        </Btn>
        <Btn variant="gold" className="flex-2 flex-grow-[2]" onClick={() => setPhase('proposal')}>
          Generate Proposal →
        </Btn>
      </div>
    </div>
  );
}

function WindowConfigRow({
  window: w,
  listPrice,
  breakdown,
  internalView,
  onEdit,
}: {
  window: WindowEntry;
  listPrice: number | null;
  breakdown: ReturnType<typeof calcWindowCostAndSell> | null;
  internalView: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center px-4 py-3 gap-3 hover:bg-gray-50">
      <WindowStyleSVG style={w.style} size={40} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {WINDOW_STYLE_LABELS[w.style]} — {w.width}×{w.height}
        </div>
        <div className="text-xs text-gray-500">
          {w.side} · qty {w.quantity}
          {w.tempered && ' · Tempered'}
          {w.obscure !== 'None' && ` · ${w.obscure}`}
          {w.seriesOverride && ` · ${w.seriesOverride}*`}
          {w.note && ` · ${w.note}`}
        </div>
      </div>
      <div className="text-right mr-2">
        {breakdown ? (
          <>
            <div className="font-semibold text-hpr-blue">{formatCurrency(breakdown.lineTotal)}</div>
            {internalView && (
              <div className="text-xs text-gray-400">Cost: {formatCurrency(breakdown.lineCost)}</div>
            )}
          </>
        ) : (
          <span className="text-xs text-red-400">No price</span>
        )}
      </div>
      <button onClick={onEdit} className="p-2 text-gray-400 hover:text-hpr-blue shrink-0">
        <Pencil size={16} />
      </button>
    </div>
  );
}
