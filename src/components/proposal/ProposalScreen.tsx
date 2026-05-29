import { useRef, useState } from 'react';
import { Printer, Download, Save, ChevronLeft, Edit3 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { Btn, Input, Select, Toggle } from '../shared/UI';
import { calcAllBreakdowns, calcProjectTotals, formatCurrency, formatCurrencyDecimal } from '../../utils/calculations';
import { WindowStyleSVG, WINDOW_STYLE_LABELS } from '../shared/WindowStyleSVG';
import { generatePDF } from '../../utils/pdf';
import type { WindowEntry, PatioDoortEntry } from '../../types';

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

  const { homeowner, salesRep, windows, doors, globalOptions, windowSills, pricing, additionalDetails } = currentProject;
  const [generating, setGenerating] = useState(false);
  const [editingHomeowner, setEditingHomeowner] = useState(!homeowner.name);
  const proposalRef = useRef<HTMLDivElement>(null);

  const breakdowns = calcAllBreakdowns(windows, doors, globalOptions, pricing.margin);
  const totals = calcProjectTotals(breakdowns, windowSills.quantity, windowSills.unitPrice, pricing, windows.length + doors.length);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  async function handleGeneratePDF() {
    setGenerating(true);
    try {
      await generatePDF(currentProject, breakdowns, totals);
    } finally {
      setGenerating(false);
    }
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

        {/* ── PAGE 1: COVER ── */}
        <div className="bg-white shadow-md rounded-xl print:rounded-none print:shadow-none mb-6 overflow-hidden">
          {/* Blue header band */}
          <div className="bg-hpr-blue px-8 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <HPRLogo size={48} />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">HIGH PERFORMANCE RESTORATION</h1>
                    <p className="text-hpr-gold text-xs font-semibold tracking-widest">ROOFING + SOLAR + WINDOWS</p>
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
          <div className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
            <div className="bg-hpr-blue px-6 py-3">
              <h3 className="text-white font-bold text-sm tracking-wide uppercase">Certifications & Recognition</h3>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {[
                  { icon: '🏆', title: 'BBB A+ Rating', sub: 'Accredited Business' },
                  { icon: '⭐', title: 'Google Reviews', sub: '5-Star Rated' },
                  { icon: '👩‍💼', title: 'WBENC Certified', sub: "Women's Business Enterprise" },
                  { icon: '🏠', title: 'Anlin Authorized', sub: 'Certified Dealer' },
                ].map((badge) => (
                  <div key={badge.title} className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="font-bold text-sm text-hpr-dark">{badge.title}</div>
                    <div className="text-xs text-gray-500">{badge.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE 3+: SCOPE OF WORK ── */}
        <div className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">Scope of Work — Window Schedule</h3>
          </div>

          {/* Global specs */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-500">Series:</span> <strong>{globalOptions.series}</strong></div>
              <div><span className="text-gray-500">Frame Color:</span> <strong>{globalOptions.frameColor}</strong></div>
              <div><span className="text-gray-500">Glass:</span> <strong>{globalOptions.glassPackage}</strong></div>
              <div><span className="text-gray-500">Frame Type:</span> <strong>{globalOptions.frameType === 'Block' ? 'Block/Nail Fin' : globalOptions.frameType}</strong></div>
            </div>
          </div>

          {/* Window rows */}
          <div className="divide-y">
            {windows.map((w, idx) => {
              const breakdown = breakdowns.find((b) => b.windowId === w.id);
              const grids = effectiveOpt(w.gridOverride, globalOptions.grids);
              const therma = effectiveOpt(w.thermaCoatOverride, globalOptions.thermaCoat);
              const screen = effectiveOpt(w.screenOverride, globalOptions.screenType);
              const glass = effectiveOpt(w.glassOverride, globalOptions.glassPackage);
              return (
                <div key={w.id} className="px-6 py-4 flex gap-4">
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
                        <div className="text-sm font-bold text-hpr-blue">
                          {breakdown ? formatCurrency(breakdown.lineTotal) : '—'}
                        </div>
                        <div className="text-xs text-gray-400">qty {w.quantity}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs text-gray-600">
                      <span>Size: <strong>{w.width}" × {w.height}"</strong></span>
                      <span>Glass: <strong>{glass}</strong></span>
                      <span>Grids: <strong>{GRID_LABELS[grids] ?? grids}</strong></span>
                      <span>Screen: <strong>{screen}</strong></span>
                      <span>Tempered: <strong>{w.tempered ? 'Yes' : 'No'}</strong></span>
                      {w.obscure !== 'None' && <span>Obscure: <strong>{OBSCURE_LABELS[w.obscure]}</strong></span>}
                      {therma !== 'None' && <span>ThermaCoat: <strong>{THERMA_LABELS[therma] ?? therma}</strong></span>}
                      {w.extraNotes && <span className="col-span-full text-gray-400 italic">Note: {w.extraNotes}</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Patio doors */}
            {doors.map((d, idx) => {
              const breakdown = breakdowns.find((b) => b.windowId === d.id);
              return (
                <div key={d.id} className="px-6 py-4 flex gap-4">
                  <div className="shrink-0 w-[52px] flex flex-col items-center">
                    <span className="text-3xl">🚪</span>
                    <div className="text-center text-xs text-hpr-blue font-semibold mt-1">D{idx + 1}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-hpr-dark text-sm">
                          {d.doorType === 'Sliding' ? 'Sliding Patio Door' : 'French Swinging Door'} — {d.config}
                        </h4>
                        <p className="text-xs text-gray-500">{d.side} Side{d.note ? ` · ${d.note}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-hpr-blue">{breakdown ? formatCurrency(breakdown.lineTotal) : '—'}</div>
                        <div className="text-xs text-gray-400">qty {d.quantity}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-xs text-gray-600">
                      <span>Size: <strong>{d.width}" × {d.height}"</strong></span>
                      <span>Rail: <strong>{d.railStyle === 'Standard' ? '2¾" Standard' : '4½" French'}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Window sills */}
            {windowSills.quantity > 0 && (
              <div className="px-6 py-3 flex items-center justify-between bg-gray-50">
                <div>
                  <span className="font-medium text-sm">Window Sill Replacement</span>
                  <span className="text-xs text-gray-500 ml-2">×{windowSills.quantity}</span>
                </div>
                <span className="font-semibold text-sm">{formatCurrency(windowSills.quantity * windowSills.unitPrice)}</span>
              </div>
            )}
          </div>

          {/* Standard scope text */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <h4 className="font-semibold text-sm text-hpr-dark mb-2">Standard Scope of Work</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>We will remove the existing windows and inspect the sheathing for rotten or bad wood.</li>
              <li>Windows will be installed using the manufacturer's specifications.</li>
              <li>We will perform an in-depth inspection of the property to make sure everything is cleaned properly and all debris is picked up.</li>
            </ul>
          </div>
        </div>

        {/* ── PRICING SUMMARY ── */}
        <div className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div className="bg-hpr-blue px-6 py-3">
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
            {additionalDetails && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Additional Details</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{additionalDetails}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── PAYMENT TERMS & SIGNATURE ── */}
        <div className="bg-white shadow-md rounded-xl print:rounded-none mb-6 overflow-hidden">
          <div className="bg-hpr-blue px-6 py-3">
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

        {/* ── PREPARING FOR YOUR PROJECT ── */}
        <div className="bg-white shadow-md rounded-xl print:rounded-none overflow-hidden">
          <div className="bg-hpr-blue px-6 py-3">
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">Preparing For Your Project</h3>
          </div>
          <div className="px-8 py-6">
            <h4 className="font-bold text-hpr-dark mb-3">Installation: The Next Steps</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Clear landscaping around window areas',
                'Remove window coverings (blinds, curtains)',
                'Move furniture away from windows',
                'Notify alarm company of installation date',
                'Secure or relocate pets',
                'Protect flooring near work areas',
                'Clear walls of artwork and decorations',
                'Note: trim/painting may be needed after install',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-hpr-gold font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
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

  function effectiveOpt<T>(perWindow: T | undefined, global: T): T {
    return perWindow !== undefined ? perWindow : global;
  }
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
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#FFD100" />
      <text x="24" y="32" textAnchor="middle" fontSize="20" fontWeight="900" fill="#003DA5" fontFamily="Arial, sans-serif">HPR</text>
    </svg>
  );
}
