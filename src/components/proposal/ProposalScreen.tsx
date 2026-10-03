import { useRef, useState } from 'react';
import { Printer, Download, Save, ChevronLeft, Edit3 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { Btn, Input, Select, Toggle } from '../shared/UI';
import { calcQuoteTotals, formatCurrency, formatCurrencyDecimal, calcFinancing, doorDisplayName, effectiveGridStyle, doorEffectiveGridStyle, doorThermaCoatActive } from '../../utils/calculations';
import { WindowStyleSVG, WINDOW_STYLE_LABELS } from '../shared/WindowStyleSVG';
import { FINANCING, PET_DOOR_OPTIONS } from '../../data/pricing';
import { PRECAUTIONARY_LETTER, TERMS_AND_CONDITIONS } from '../../data/contractDocs';
import { LTD_SLIDER_JOB_DESCRIPTION, ANLIN_SCOPE_OF_WORK, ARCH_FINISH_LABELS } from '../../data/pricing';
import { downloadProposalPdf } from '../../utils/domPdf';
import type { WindowEntry, PatioDoortEntry, Adder } from '../../types';

const OBSCURE_LABELS: Record<string, string> = {
  None: 'Clear',
  P516: 'Standard Obscure',
  EtchMatte: 'Etch Matte',
  GlueChip: 'Glue Chip',
  Rain: 'Rain',
  DeltaFrost: 'Delta Frost',
  Reed: 'Reed',
  Flemish: 'Flemish',
};

const GRID_LABELS: Record<string, string> = {
  None: 'No Grids',
  FlatColonial: '5/8" Flat Colonial',
  SculpturedColonial: '5/8" Sculptured',
  SculpturedInch: '1" Sculptured',
};

const THERMA_LABELS: Record<string, string> = {
  None: 'Not Included',
  ArchitecturalBlack: 'Architectural Black',
  ArchitecturalBronze: 'Architectural Bronze',
  ArchitecturalSilver: 'Architectural Silver',
  ClassicGray: 'Classic Gray',
  Espresso: 'Espresso',
  Taupe: 'Taupe',
  RedPepper: 'Red Pepper',
  RoseWood: 'Rose Wood',
  DesertTan: 'Desert Tan',
  Sandstone: 'Sandstone',
  DivineWine: 'Divine Wine',
  ForestGreen: 'Forest Green',
};

export default function ProposalScreen() {
  const {
    currentProject, updateHomeowner, updateSalesRep,
    updatePricing, setAdditionalDetails, saveProject, setPhase,
  } = useProjectStore();

  const { homeowner, salesRep, globalOptions, windowSills, pricing, additionalDetails } = currentProject;
  const [generating, setGenerating] = useState(false);
  const [editingHomeowner, setEditingHomeowner] = useState(!homeowner.name);
  const proposalRef = useRef<HTMLDivElement>(null);

  // Excluded entries are omitted from the proposal (and PDF) entirely: everything below uses the included lists.
  const { includedWindows: windows, includedDoors: doors, breakdowns, totals } =
    calcQuoteTotals(currentProject.windows, currentProject.doors, globalOptions, pricing, windowSills);

  const anlinDoors = doors.filter((d) => d.brand !== 'LoveThatDoor');
  const ltdDoors = doors.filter((d) => d.brand === 'LoveThatDoor');
  const hasLtdSlider = ltdDoors.some((d) => d.ltdLine === 'PatioSlider');
  const showWindowSchedule = windows.length > 0 || windowSills.quantity > 0;
  const showWindowPrices = pricing.showWindowPrices !== false;
  const showDoorPrices = pricing.showDoorPrices !== false;
  const showFinancing = pricing.showFinancing !== false && totals.totalContractAmount > 0;
  const financing = calcFinancing(totals.totalContractAmount);
  const lineTotalOf = (id: string) => breakdowns.find((b) => b.windowId === id)?.lineTotal ?? 0;
  const windowScheduleTotal = windows.reduce((sum, w) => sum + lineTotalOf(w.id), 0) + windowSills.quantity * windowSills.unitPrice;
  const doorScheduleTotal = doors.reduce((sum, d) => sum + lineTotalOf(d.id), 0);
  const ltdSubtotal = ltdDoors.reduce((sum, d) => sum + (breakdowns.find((b) => b.windowId === d.id)?.lineTotal ?? 0), 0);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  async function handleGeneratePDF() {
    setGenerating(true);
    try {
      if (proposalRef.current) {
        const name = (homeowner.name || 'Proposal').replace(/[^\w -]+/g, '').trim() || 'Proposal';
        await downloadProposalPdf(proposalRef.current, `${name} - Proposal.pdf`);
      }
    } finally {
      setGenerating(false);
    }
  }

  // Custom adders (extra construction) listed under an item by description only; the adder price is never shown.
  function renderAdders(adders: Adder[] | undefined) {
    return (adders ?? []).filter((a) => a.description.trim() || a.price > 0).map((a) => (
      <span key={a.id} className="col-span-full">
        Adder: <strong>{a.description.trim() || 'Additional construction'}</strong>
      </span>
    ));
  }

  function effectiveOpt<T>(perWindow: T | undefined, global: T): T {
    return perWindow !== undefined ? perWindow : global;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-hpr-blue text-white px-4 pt-safe-top pb-3 sticky top-0 z-30 shadow-lg no-print">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setPhase('configuration')} className="p-2 -ml-2 hover:bg-blue-700 rounded-full">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">Proposal Preview</h1>
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" onClick={() => { saveProject(); }}>
              <Save size={16} /> Save
            </Btn>
            <Btn variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer size={16} />
            </Btn>
            <Btn variant="gold" size="sm" onClick={handleGeneratePDF} disabled={generating}>
              <Download size={16} /> {generating ? 'Building...' : 'PDF'}
            </Btn>
          </div>
        </div>
      </div>

      {/* Homeowner editor (above preview) */}
      <div className="max-w-4xl mx-auto px-4 pt-4 no-print space-y-3">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-hpr-dark">Homeowner & Rep Info</h3>
            <button onClick={() => setEditingHomeowner(!editingHomeowner)} className="text-hpr-blue text-sm flex items-center gap-1">
              <Edit3 size={14} /> {editingHomeowner ? 'Done' : 'Edit'}
            </button>
          </div>
          {editingHomeowner ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Homeowner Name" value={homeowner.name} onChange={(e) => updateHomeowner({ name: e.target.value })} />
              <Input label="Address" value={homeowner.address} onChange={(e) => updateHomeowner({ address: e.target.value })} />
              <Input label="City" value={homeowner.city} onChange={(e) => updateHomeowner({ city: e.target.value })} />
              <Input label="Zip" value={homeowner.zip} onChange={(e) => updateHomeowner({ zip: e.target.value })} />
              <Input label="Phone" value={homeowner.phone} onChange={(e) => updateHomeowner({ phone: e.target.value })} />
              <Input label="Email" value={homeowner.email} onChange={(e) => updateHomeowner({ email: e.target.value })} />
              <Input label="Sales Rep Name" value={salesRep.name} onChange={(e) => updateSalesRep({ name: e.target.value })} />
              <div className="flex items-center gap-3">
                <Toggle label="Show Certifications Page" checked={pricing.showCertificationsPage}
                  onChange={(v) => updatePricing({ showCertificationsPage: v })} />
              </div>
              <Toggle label="Show Window Schedule Pricing" checked={showWindowPrices}
                onChange={(v) => updatePricing({ showWindowPrices: v })} />
              <Toggle label="Show Door Schedule Pricing" checked={showDoorPrices}
                onChange={(v) => updatePricing({ showDoorPrices: v })} />
              <Toggle label="Show Financing Options" checked={pricing.showFinancing !== false}
                onChange={(v) => updatePricing({ showFinancing: v })} />
              <Toggle label="Insurance Job" checked={pricing.insuranceJob}
                onChange={(v) => updatePricing({ insuranceJob: v })} />
            </div>
          ) : (
            <div className="text-sm text-gray-600 space-y-0.5">
              <p><strong>{homeowner.name || '(No name)'}</strong> · {homeowner.address} {homeowner.city}, {homeowner.state} {homeowner.zip}</p>
              <p>{homeowner.phone} · {homeowner.email}</p>
              <p>Rep: {salesRep.name || '(No rep name)'}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Additional Details / Notes</label>
          <textarea
            rows={3}
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-hpr-blue"
            placeholder="Special instructions, HOA approval notes, etc."
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PROPOSAL DOCUMENT (print target)
      ════════════════════════════════════════════════════════ */}
      <div ref={proposalRef} id="proposal-document" className="max-w-4xl mx-auto px-4 pt-6 pb-12 space-y-0 print:px-0 print:pt-0">

        {/* ── PAGE 1: QUOTE COVER ── */}
        <div data-pdf-block className="mb-6 overflow-hidden rounded-xl shadow-md print:rounded-none print:shadow-none">
          <img src="/quote-cover.jpg" alt="Windows &amp; Doors — Your Personalized Quote" className="w-full h-auto block" />
        </div>

        {/* ── PAGE 2: HPR COVER ── */}
        <div data-pdf-block data-pdf-break-before style={{ breakBefore: 'page' }} className="bg-white shadow-md rounded-xl print:rounded-none print:shadow-none mb-6 overflow-hidden">
          {/* Blue header band */}
          <div className="bg-hpr-blue px-8 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <HPRLogo size={64} />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">HIGH PERFORMANCE WINDOWS & DOORS</h1>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm">
                <p>9061 3rd St · Frisco, TX 75034</p>
                <p>214.396.7772</p>
                <p>info@hprtexas.com</p>
                <p className="text-blue-200">hprtexas.com</p>
              </div>
            </div>
          </div>

          {/* Gold accent bar */}
          <div className="h-2 bg-hpr-gold" />

          {/* Proposal title section */}
          <div className="px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black text-hpr-blue uppercase tracking-tight">Window Replacement</h2>
                <h2 className="text-3xl font-black text-hpr-dark uppercase tracking-tight">Proposal</h2>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p><strong>Date:</strong> {today}</p>
                  <p><strong>Sales Representative:</strong> {salesRep.name || 'HPR Sales'}</p>
                  {pricing.insuranceJob && (
                    <span className="inline-block bg-hpr-gold text-hpr-dark text-xs font-bold px-3 py-1 rounded-full mt-1">INSURANCE JOB</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="bg-hpr-blue text-white px-4 py-3 rounded-xl">
                  <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Prepared For</p>
                  <p className="text-lg font-bold">{homeowner.name || 'Homeowner'}</p>
                  <p className="text-sm text-blue-200">{homeowner.address}</p>
                  {homeowner.city && <p className="text-sm text-blue-200">{homeowner.city}, {homeowner.state} {homeowner.zip}</p>}
                  {homeowner.phone && <p className="text-sm text-blue-200 mt-1">{homeowner.phone}</p>}
                  {homeowner.email && <p className="text-sm text-blue-200">{homeowner.email}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 2: CERTIFICATIONS (optional) ── */}
        {pricing.showCertificationsPage && (
          <div data-pdf-block className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
            <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
              <h3 className="text-white font-bold text-sm tracking-wide uppercase">Certifications & Recognition</h3>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {([
                  { icon: '🏆', title: 'BBB A+ Rating', sub: 'Accredited Business' },
                  { icon: '⭐', title: 'Google Reviews', sub: '5-Star Rated' },
                  { icon: '👩‍💼', title: 'WBENC Certified', sub: "Women's Business Enterprise" },
                  { icon: '🏠', title: 'Anlin Authorized', sub: 'Certified Dealer' },
                ] as { icon: string; image?: string; title: string; sub: string }[]).map((badge) => (
                  <div key={badge.title} className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl">
                    {'image' in badge && badge.image
                      ? <img src={badge.image} alt={badge.title} className="h-14 w-14 object-contain -my-2" />
                      : <div className="text-3xl">{badge.icon}</div>}
                    <div className="font-bold text-sm text-hpr-dark">{badge.title}</div>
                    <div className="text-xs text-gray-500">{badge.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE 3+: SCOPE OF WORK ── */}
        {showWindowSchedule && (
        <div className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">Scope of Work — Window Schedule</h3>
          </div>

          {/* Global specs */}
          <div data-pdf-keep-next className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-500">Series:</span> <strong>{globalOptions.series}</strong></div>
              <div><span className="text-gray-500">Frame Color:</span> <strong>{globalOptions.frameColor}</strong></div>
              <div><span className="text-gray-500">Glass:</span> <strong>{globalOptions.glassPackage}</strong></div>
              <div><span className="text-gray-500">Frame Type:</span> <strong>{globalOptions.frameType === 'Block' ? 'Block/Nail Fin' : globalOptions.frameType}</strong></div>
              <div><span className="text-gray-500">Argon Gas:</span> <strong>Included</strong></div>
              {globalOptions.hardwareLock === 'ArchFinish' && globalOptions.hardwareFinish !== 'Standard' && <div><span className="text-gray-500">Lock Finish:</span> <strong>{ARCH_FINISH_LABELS[globalOptions.hardwareFinish]}</strong></div>}
              {globalOptions.soundPackage && <div><span className="text-gray-500">Sound Package:</span> <strong>Included</strong></div>}
            </div>
          </div>

          {/* Window rows */}
          <div data-pdf-list className="divide-y">
            {windows.map((w, idx) => {
              const breakdown = breakdowns.find((b) => b.windowId === w.id);
              const grids = effectiveGridStyle(w, globalOptions);
              const isDesignerBlack = effectiveOpt(w.frameColorOverride, globalOptions.frameColor) === 'Designer Black';
              const therma = isDesignerBlack ? 'None' : effectiveOpt(w.thermaCoatOverride, globalOptions.thermaCoat);
              // Picture windows and geometrics don't open, so they never get a screen.
              const screen = w.style === 'PW' || w.style === 'Geometric'
                ? 'Not Included'
                : effectiveOpt(w.screenOverride, globalOptions.screenType);
              const glass = effectiveOpt(w.glassOverride, globalOptions.glassPackage);
              return (
                <div data-pdf-block key={w.id} className="px-6 py-4 flex gap-4">
                  <div className="shrink-0">
                    <WindowStyleSVG style={w.style} size={52} />
                    <div className="text-center text-xs text-hpr-blue font-semibold mt-1">#{idx + 1}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-hpr-dark text-sm">
                          {WINDOW_STYLE_LABELS[w.style]} — Anlin {effectiveOpt(w.seriesOverride, globalOptions.series)}
                        </h4>
                        <p className="text-xs text-gray-500">{w.side} Side{w.note ? ` · ${w.note}` : ''}</p>
                      </div>
                      <div className="text-right">
                        {showWindowPrices && (
                          <div className="text-sm font-bold text-hpr-blue">
                            {breakdown ? formatCurrency(breakdown.lineTotal) : '—'}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">qty {w.quantity}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs text-gray-600">
                      <span>Size: <strong>{w.width}" × {w.height}"</strong></span>
                      <span>Glass: <strong>{glass}</strong></span>
                      <span>Grids: <strong>{GRID_LABELS[grids] ?? grids}</strong></span>
                      <span>Screen: <strong>{screen}</strong></span>
                      <span>Tempered: <strong>{w.tempered ? 'Yes' : 'No'}</strong></span>
                      {effectiveOpt(w.soundPackageOverride, globalOptions.soundPackage) && <span>Sound Package: <strong>Included</strong></span>}
                      {w.obscure !== 'None' && <span>Obscure: <strong>{OBSCURE_LABELS[w.obscure]}</strong></span>}
                      {therma !== 'None' && <span>ThermaCoat: <strong>{THERMA_LABELS[therma] ?? therma}</strong></span>}
                      {renderAdders(w.adders)}
                      {w.extraNotes && <span className="col-span-full text-gray-400 italic">Note: {w.extraNotes}</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Window sills */}
            {windowSills.quantity > 0 && (
              <div data-pdf-block className="px-6 py-3 flex items-center justify-between bg-gray-50">
                <div>
                  <span className="font-medium text-sm">Window Sill Replacement</span>
                  <span className="text-xs text-gray-500 ml-2">×{windowSills.quantity}</span>
                </div>
                {showWindowPrices && <span className="font-semibold text-sm">{formatCurrency(windowSills.quantity * windowSills.unitPrice)}</span>}
              </div>
            )}
          </div>

          <div data-pdf-keep-prev className="px-6 py-3 flex items-center justify-between bg-gray-50 border-t">
            <span className="font-bold text-sm text-hpr-dark">Window Schedule Total</span>
            <span className="font-bold text-sm text-hpr-blue">{formatCurrency(windowScheduleTotal)}</span>
          </div>

          {/* Standard scope text */}
          <div data-pdf-block className="px-6 py-4 border-t bg-gray-50">
            <h4 className="font-semibold text-sm text-hpr-dark mb-2">{ANLIN_SCOPE_OF_WORK.heading}</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              {ANLIN_SCOPE_OF_WORK.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        )}

        {/* ── SCOPE OF WORK: DOOR SCHEDULE (Anlin + Love That Door) ── */}
        {doors.length > 0 && (
          <div className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
            <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
              <h3 className="text-white font-bold text-sm tracking-wide uppercase">Scope of Work — Door Schedule</h3>
            </div>
            <div data-pdf-list className="divide-y">
            {/* Anlin patio doors */}
            {anlinDoors.map((d, idx) => {
              const breakdown = breakdowns.find((b) => b.windowId === d.id);
              return (
                <div data-pdf-block key={d.id} className="px-6 py-4 flex gap-4">
                  <div className="shrink-0 w-[52px] flex flex-col items-center">
                    <span className="text-3xl">🚪</span>
                    <div className="text-center text-xs text-hpr-blue font-semibold mt-1">D{idx + 1}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-hpr-dark text-sm">
                          {doorDisplayName(d)}
                        </h4>
                        <p className="text-xs text-gray-500">{d.side} Side{d.note ? ` · ${d.note}` : ''}</p>
                      </div>
                      <div className="text-right">
                        {showDoorPrices && <div className="text-sm font-bold text-hpr-blue">{breakdown ? formatCurrency(breakdown.lineTotal) : '—'}</div>}
                        <div className="text-xs text-gray-400">qty {d.quantity}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs text-gray-600">
                      <span>Size: <strong>{d.width}" × {d.height}"</strong></span>
                      <span>Rail: <strong>{d.railStyle === 'Standard' ? '2¾" Standard' : '4½" French'}</strong></span>
                      <span>Frame Color: <strong>{effectiveOpt(d.frameColorOverride, globalOptions.frameColor)}</strong></span>
                      <span>Glass: <strong>{effectiveOpt(d.glassOverride, globalOptions.glassPackage)}</strong></span>
                      <span>Grids: <strong>{GRID_LABELS[doorEffectiveGridStyle(d, globalOptions)]}</strong></span>
                      <span>Argon Gas: <strong>Included</strong></span>
                      {doorThermaCoatActive(d, globalOptions) && <span>ThermaCoat: <strong>{THERMA_LABELS[d.thermaCoatOverride!]}</strong></span>}
                      <span>Handle Style: <strong>{d.handleDesign ?? 'Traditional'}</strong></span>
                      {(d.doorType === 'Sliding' ? (d.slidingHandleStyle ?? 'Standard') !== 'Standard' : d.archFinish) && (
                        <span>Handle: <strong>
                          {ARCH_FINISH_LABELS[d.handleFinish && d.handleFinish !== 'Standard' ? d.handleFinish : 'SatinBlack']}
                          {d.doorType === 'Sliding' && (d.slidingHandleStyle === 'Interior' ? ' (interior)' : ' (interior & exterior)')}
                        </strong></span>
                      )}
                      {d.quadLock && <span>Quad Lock: <strong>Included</strong></span>}
                      {d.keyedCylinder && !d.quadLock && <span>Keyed Lock: <strong>{d.extPullHandle ? 'With exterior pull' : 'Included'}</strong></span>}
                      {d.deadBolt && <span>Dead Bolt: <strong>Included</strong></span>}
                      {d.stainlessRollers && <span>Stainless Rollers: <strong>Included</strong></span>}
                      {d.petDoor && d.petDoor !== 'None' && <span>Doggie Door: <strong>{PET_DOOR_OPTIONS[d.petDoor].name}</strong></span>}
                      {renderAdders(d.adders)}
                      {d.extraNotes && <span className="col-span-full text-gray-400 italic">Note: {d.extraNotes}</span>}
                    </div>
                  </div>
                </div>
              );
            })}

              {ltdDoors.map((d, idx) => {
                const breakdown = breakdowns.find((b) => b.windowId === d.id);
                return (
                  <div data-pdf-block key={d.id} className="px-6 py-4 flex gap-4">
                    <div className={`shrink-0 flex flex-col items-center ${d.ltdLine === 'PatioSlider' ? 'w-28' : 'w-[52px]'}`}>
                      {d.ltdLine === 'PatioSlider' ? (
                        <img src="/3-panel-slider.jpeg" alt="Love That Door Euro Slider" className="w-28 h-20 object-cover rounded-md border" />
                      ) : (
                        <span className="text-3xl">🚪</span>
                      )}
                      <div className="text-center text-xs text-hpr-blue font-semibold mt-1">LTD{idx + 1}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-hpr-dark text-sm">{doorDisplayName(d)}</h4>
                          <p className="text-xs text-gray-500">{d.side} Side{d.note ? ` · ${d.note}` : ''}</p>
                        </div>
                        <div className="text-right">
                          {showDoorPrices && <div className="text-sm font-bold text-hpr-blue">{breakdown ? formatCurrency(breakdown.lineTotal) : '—'}</div>}
                          <div className="text-xs text-gray-400">qty {d.quantity}</div>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs text-gray-600">
                        <span>Size: <strong>{d.width}" × {d.height}"</strong></span>
                        {d.ltdColor && <span>Color: <strong>{d.ltdColor}</strong></span>}
                        {d.ltdGlassOption && <span>Glass: <strong>{d.ltdGlassOption}</strong></span>}
                        {d.ltdThermallyBroken && <span>Thermally Broken: <strong>Yes</strong></span>}
                        {d.ltdPivotUpgrade && <span>Pivot System: <strong>Yes</strong></span>}
                        {d.ltdElectricGlass && <span>Electric Glass: <strong>Yes</strong></span>}
                        {d.ltdLongPulls && <span>Long Pulls: <strong>Yes</strong></span>}
                        {d.ltdBiometricLock && d.ltdBiometricLock !== 'none' && (
                          <span>Biometric Lock: <strong>{d.ltdBiometricLock === 'wifi' ? 'Wi-Fi' : 'Standard'}</strong></span>
                        )}
                        {renderAdders(d.adders)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasLtdSlider && (
              <div data-pdf-block className="px-6 py-4 border-t">
                <h4 className="font-semibold text-sm text-hpr-dark mb-2">Job Description — Euro Slider</h4>
                <p className="text-xs text-gray-600 mb-2">{LTD_SLIDER_JOB_DESCRIPTION.intro}</p>
                <p className="text-xs font-semibold text-gray-700 mb-1">{LTD_SLIDER_JOB_DESCRIPTION.scopeHeading}</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside mb-2">
                  {LTD_SLIDER_JOB_DESCRIPTION.scope.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className="text-xs text-gray-500 italic">{LTD_SLIDER_JOB_DESCRIPTION.note}</p>
              </div>
            )}
            {ltdDoors.length > 0 && showDoorPrices && (
              <div data-pdf-keep-prev className="px-6 py-3 flex items-center justify-between bg-gray-50 border-t">
                <span className="font-medium text-sm">Love That Door Subtotal</span>
                <span className="font-semibold text-sm">{formatCurrency(ltdSubtotal)}</span>
              </div>
            )}
            <div data-pdf-keep-prev className="px-6 py-3 flex items-center justify-between bg-gray-50 border-t">
              <span className="font-bold text-sm text-hpr-dark">Door Schedule Total</span>
              <span className="font-bold text-sm text-hpr-blue">{formatCurrency(doorScheduleTotal)}</span>
            </div>
          </div>
        )}

        {/* ── PRICING SUMMARY ── */}
        <div data-pdf-block className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">Pricing Summary</h3>
          </div>
          <div className="px-8 py-6 space-y-3">
            <div className="flex justify-between text-sm border-b pb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 border-b pb-3">
                <span>{pricing.discountLabel || 'Discount'}</span>
                <span className="font-medium">-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-hpr-blue">
              <span>Total Contract Amount</span>
              <span>{formatCurrency(totals.totalContractAmount)}</span>
            </div>
            <div className="h-1 bg-hpr-gold rounded" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Deposit Due</p>
                <p className="text-2xl font-black text-hpr-blue mt-1">{formatCurrency(totals.depositAmount)}</p>
                <p className="text-xs text-gray-400">({pricing.depositPercent}% of total)</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Balance Due</p>
                <p className="text-2xl font-black text-hpr-dark mt-1">{formatCurrency(totals.totalContractAmount - totals.depositAmount)}</p>
                <p className="text-xs text-gray-400">Upon completion</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">Form of Payment</p>
              <div className="flex gap-2">
                {(['Check', 'ACH', 'CreditCard'] as const).map((m) => (
                  <div key={m} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${pricing.paymentMethod === m ? 'bg-hpr-blue text-white border-hpr-blue' : 'text-gray-500 border-gray-200'}`}>
                    {m === 'CreditCard' ? 'Credit Card (+3%)' : m}
                  </div>
                ))}
              </div>
            </div>
            {showFinancing && (
              <div data-pdf-block className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Financing Options</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-hpr-gold bg-amber-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-hpr-dark">Special Promo Financing</p>
                    <p className="text-2xl font-black text-hpr-blue mt-1">{FINANCING.promoMonths} Months</p>
                    <p className="text-sm font-semibold text-hpr-dark">Zero Interest</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-hpr-dark">Low Monthly Payment</p>
                    <p className="text-2xl font-black text-hpr-blue mt-1">
                      {formatCurrencyDecimal(financing.monthly)}<span className="text-xs font-medium text-gray-500"> / month</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(financing.financed)} financed · {(FINANCING.monthlyApr * 100).toFixed(1)}% · {FINANCING.monthlyTermYears} years
                    </p>
                    {financing.deposit > 0 && (
                      <p className="text-xs text-gray-700 mt-1">
                        <strong>Deposit: {formatCurrency(financing.deposit)}</strong> (balance over {formatCurrency(FINANCING.monthlyMaxFinanced)})
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Secured financing options are also available, with loans up to {formatCurrency(FINANCING.securedMaxLoan)}.
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Estimated payment. Subject to credit approval.</p>
              </div>
            )}
            {additionalDetails && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Additional Details</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{additionalDetails}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── PAYMENT TERMS & SIGNATURE ── */}
        <div data-pdf-block className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">Payment Terms & Signature</h3>
          </div>
          <div className="px-8 py-6 space-y-4">
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>All payments made out to High Performance Restoration or HPR.</li>
              <li>An option to pay online through ACH transfer or credit card may be requested. Credit card payments include a 3% convenience fee.</li>
              <li>Please note progress invoices may be sent as trades are completed.</li>
              <li>Insurance payments due upon receipt.</li>
            </ul>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <SignatureLine label="HPR Representative" />
              <SignatureLine label="Homeowner" />
            </div>
          </div>
        </div>

        {/* ── PRECAUTIONARY LETTER (starts a new page) ── */}
        <div data-pdf-break-before style={{ breakBefore: 'page' }} className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">{PRECAUTIONARY_LETTER.title}</h3>
          </div>
          <div className="px-8 py-6 space-y-4">
            <p className="text-sm text-gray-700">Dear {homeowner.name || '________________'},</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-hpr-dark text-xs uppercase tracking-wide mb-1">{PRECAUTIONARY_LETTER.preparingHeading}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{PRECAUTIONARY_LETTER.preparing}</p>
              </div>
              <div>
                <h4 className="font-bold text-hpr-dark text-xs uppercase tracking-wide mb-1">{PRECAUTIONARY_LETTER.processHeading}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{PRECAUTIONARY_LETTER.process}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-hpr-dark text-xs uppercase tracking-wide mb-2">{PRECAUTIONARY_LETTER.stepsHeading}</h4>
              <div className="space-y-2">
                {PRECAUTIONARY_LETTER.steps.map((step, i) => (
                  <p key={step.title} className="text-xs text-gray-600 leading-relaxed">
                    <strong className="text-gray-800">{i + 1}. {step.title}:</strong> {step.text}
                  </p>
                ))}
              </div>
            </div>
            <div data-pdf-block className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-8">
                <SignatureLine label="Client Signature" />
                <SignatureLine label="Date" />
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-4">{PRECAUTIONARY_LETTER.footer}</p>
            </div>
          </div>
        </div>

        {/* ── TERMS & CONDITIONS (starts a new page) ── */}
        <div data-pdf-break-before style={{ breakBefore: 'page' }} className="bg-white shadow-md rounded-xl print:rounded-none overflow-hidden">
          <div data-pdf-keep-next className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">{TERMS_AND_CONDITIONS.title}</h3>
          </div>
          <div className="px-8 py-6 space-y-3">
            <h4 className="font-bold text-hpr-dark text-xs uppercase tracking-wide pt-1">{TERMS_AND_CONDITIONS.provisionsHeading}</h4>
            {TERMS_AND_CONDITIONS.provisions.map((p, i) => (
              <div key={p.title} className="text-[11px] text-gray-600 leading-snug">
                <p><strong className="text-gray-800">{i + 1}. {p.title}.</strong> {p.text}</p>
                {'notes' in p && p.notes && (
                  <div className="mt-1 ml-4 space-y-0.5">
                    <p className="font-semibold text-gray-700">Notes:</p>
                    {p.notes.map((note) => <p key={note}>{note}</p>)}
                  </div>
                )}
              </div>
            ))}
            <div data-pdf-block className="border border-gray-300 rounded-lg p-3 space-y-2">
              <p className="text-[11px] text-gray-600 leading-snug font-semibold">{TERMS_AND_CONDITIONS.arbitrationNotice}</p>
              <p className="text-[11px] text-gray-600 leading-snug">{TERMS_AND_CONDITIONS.arbitrationAgreement}</p>
              <div className="flex gap-6 pt-1">
                <div className="w-32"><SignatureLine label="Owner's initials" /></div>
                <div className="w-32"><SignatureLine label="Owner's initials" /></div>
              </div>
            </div>
            <div data-pdf-block className="pt-3 border-t">
              <p className="text-[11px] text-gray-600 leading-snug mb-2">{TERMS_AND_CONDITIONS.acknowledgment}</p>
              <div className="grid grid-cols-2 gap-8">
                <SignatureLine label="Homeowner Signature" />
                <SignatureLine label="Date" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #proposal-document { max-width: 100%; padding: 0; }
        }
      `}</style>
    </div>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <div className="border-b-2 border-gray-300 h-12 mb-1" />
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function HPRLogo({ size = 40 }: { size?: number }) {
  return (
    <div className="bg-white rounded-lg p-1.5 shrink-0">
      <img src="/HP-Windows-LOGO-SM.png" alt="High Performance Windows" style={{ height: size, width: 'auto' }} />
    </div>
  );
}
