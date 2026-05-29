import { useState, useRef } from 'react';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, DoorOpen } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { NumInput, Select, Btn, Card, SectionHeader, Input, Toggle } from '../shared/UI';
import { WindowStyleSVG, WINDOW_STYLE_LABELS } from '../shared/WindowStyleSVG';
import type { HouseSide, WindowStyle, WindowEntry, SlidingDoorConfig, FrenchDoorConfig } from '../../types';

const SIDES: { value: HouseSide; label: string }[] = [
  { value: 'Front', label: 'Front' },
  { value: 'Right', label: 'Right' },
  { value: 'Back', label: 'Back' },
  { value: 'Left', label: 'Left' },
];

const WINDOW_STYLES_OPTIONS = (Object.keys(WINDOW_STYLE_LABELS) as WindowStyle[]).map((k) => ({
  value: k,
  label: WINDOW_STYLE_LABELS[k],
}));

const GEO_CATS = [
  { value: '1', label: 'Cat 1 – Triangles, Trapezoids, Rakes' },
  { value: '2', label: 'Cat 2 – ¼ & ½ Circles, Octagons' },
  { value: '3', label: 'Cat 3 – Full Circles, Custom Bends' },
];

const SLIDING_CONFIGS: { value: SlidingDoorConfig; label: string }[] = [
  { value: 'XO', label: 'XO (2-panel, left slides)' },
  { value: 'OX', label: 'OX (2-panel, right slides)' },
  { value: 'XOO', label: 'XOO (3-panel)' },
  { value: 'OOX', label: 'OOX (3-panel)' },
  { value: 'OXO', label: 'OXO (3-panel)' },
  { value: 'OXXO', label: 'OXXO (4-panel)' },
];
const FRENCH_CONFIGS: { value: FrenchDoorConfig; label: string }[] = [
  { value: 'X', label: 'X (single panel)' },
  { value: 'XO', label: 'XO (swing + fixed)' },
  { value: 'OX', label: 'OX (fixed + swing)' },
  { value: 'XX', label: 'XX (swing + swing)' },
  { value: 'OXO', label: 'OXO (fixed + swing + fixed)' },
  { value: 'OXXO', label: 'OXXO (4 panel)' },
];

const SIDE_COLORS: Record<HouseSide, string> = {
  Front: 'bg-blue-100 text-blue-800 border-blue-200',
  Right: 'bg-green-100 text-green-800 border-green-200',
  Back: 'bg-orange-100 text-orange-800 border-orange-200',
  Left: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function MeasuringScreen() {
  const { currentProject, addWindow, addDoor, removeWindow, removeDoor, duplicateWindow, setPhase } = useProjectStore();
  const { windows, doors } = currentProject;

  const [side, setSide] = useState<HouseSide>('Front');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [style, setStyle] = useState<WindowStyle>('SH');
  const [qty, setQty] = useState('1');
  const [note, setNote] = useState('');
  const [geoCat, setGeoCat] = useState<1 | 2 | 3>(1);
  const [isDoor, setIsDoor] = useState(false);
  const [doorType, setDoorType] = useState<'Sliding' | 'French'>('Sliding');
  const [slidingConfig, setSlidingConfig] = useState<SlidingDoorConfig>('XO');
  const [frenchConfig, setFrenchConfig] = useState<FrenchDoorConfig>('XO');
  const [showList, setShowList] = useState(true);
  const [quickMode, setQuickMode] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickError, setQuickError] = useState('');

  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);

  const totalItems = windows.length + doors.length;
  const totalUnits = windows.reduce((s, w) => s + w.quantity, 0) +
    doors.reduce((s, d) => s + d.quantity, 0);

  function handleAddWindow() {
    const w = parseInt(width);
    const h = parseInt(height);
    if (!w || !h || w <= 0 || h <= 0) return;
    addWindow({
      side,
      width: w,
      height: h,
      style,
      quantity: Math.max(1, parseInt(qty) || 1),
      note,
      geometricCategory: style === 'Geometric' ? geoCat : undefined,
      tempered: false,
      obscure: 'None',
      extraNotes: '',
    });
    setWidth('');
    setHeight('');
    setNote('');
    setQty('1');
    widthRef.current?.focus();
  }

  function handleAddDoor() {
    const w = parseInt(width);
    const h = parseInt(height);
    if (!w || !h) return;
    addDoor({
      side,
      doorType,
      config: doorType === 'Sliding' ? slidingConfig : frenchConfig,
      railStyle: 'Standard',
      width: w,
      height: h,
      quantity: Math.max(1, parseInt(qty) || 1),
      note,
      tempered: true,
      extraNotes: '',
    });
    setWidth('');
    setHeight('');
    setNote('');
    setQty('1');
  }

  // Quick entry: "F 36 84 SH 2"
  function handleQuickEntry(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    setQuickError('');
    const parts = quickInput.trim().toUpperCase().split(/\s+/);
    if (parts.length < 3) { setQuickError('Format: F 36 84 [SH] [qty]'); return; }
    const sideMap: Record<string, HouseSide> = { F: 'Front', R: 'Right', B: 'Back', L: 'Left' };
    const s = sideMap[parts[0]];
    if (!s) { setQuickError('Side must be F/R/B/L'); return; }
    const w = parseInt(parts[1]), h = parseInt(parts[2]);
    if (!w || !h) { setQuickError('Invalid dimensions'); return; }
    const styleMap: Record<string, WindowStyle> = {
      SH: 'SH', XO: 'XO', OX: 'OX', XOX: 'XOX', PW: 'PW',
      DH: 'DH', XX: 'XX', CASEMENT: 'Casement', AWNING: 'Awning', GEO: 'Geometric',
    };
    const st: WindowStyle = (parts[3] && styleMap[parts[3]]) || 'SH';
    const q = parseInt(parts[4]) || 1;
    addWindow({ side: s, width: w, height: h, style: st, quantity: q, note: '', tempered: false, obscure: 'None', extraNotes: '' });
    setQuickInput('');
  }

  const windowsBySide = SIDES.map((s) => ({
    side: s.value,
    items: windows.filter((w) => w.side === s.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-hpr-blue text-white px-4 pt-safe-top pb-3 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">HPR Field Measure</h1>
            <p className="text-blue-200 text-xs">{currentProject.homeowner.name || 'No homeowner set'}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{totalItems}</div>
            <div className="text-xs text-blue-200">{totalUnits} units</div>
          </div>
        </div>
        {/* Side-of-house nav */}
        <div className="flex gap-2 mt-3">
          {SIDES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSide(s.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${side === s.value ? 'bg-hpr-gold text-hpr-dark' : 'bg-blue-800 text-blue-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-2xl mx-auto space-y-4">
        {/* Mode switcher */}
        <div className="flex gap-2">
          <Btn
            variant={!isDoor ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsDoor(false)}
            className="flex-1"
          >
            Window
          </Btn>
          <Btn
            variant={isDoor ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsDoor(true)}
            className="flex-1"
          >
            <DoorOpen size={14} /> Patio Door
          </Btn>
          <Btn
            variant={quickMode ? 'gold' : 'secondary'}
            size="sm"
            onClick={() => setQuickMode(!quickMode)}
          >
            Quick
          </Btn>
        </div>

        {/* Quick mode */}
        {quickMode && (
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-2">Format: <code className="bg-gray-100 px-1 rounded">F 36 84 SH 2</code> → Side Width Height Style Qty</p>
            <Input
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={handleQuickEntry}
              placeholder="F 36 84 SH 1"
              className="font-mono"
              autoFocus
            />
            {quickError && <p className="text-red-500 text-xs mt-1">{quickError}</p>}
          </Card>
        )}

        {/* Entry form */}
        {!isDoor ? (
          <Card className="p-4 space-y-4">
            <SectionHeader title={`Add Window — ${side} Side`} />
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Width (inches)" value={width} onChange={setWidth} placeholder="36" ref={widthRef} unit="in" />
              <NumInput label="Height (inches)" value={height} onChange={setHeight} placeholder="48" ref={heightRef} unit="in"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddWindow(); }}
              />
            </div>
            <Select
              label="Window Style"
              value={style}
              onChange={(e) => setStyle(e.target.value as WindowStyle)}
              options={WINDOW_STYLES_OPTIONS}
            />
            {style === 'Geometric' && (
              <Select label="Geometric Category" value={String(geoCat)}
                onChange={(e) => setGeoCat(parseInt(e.target.value) as 1 | 2 | 3)}
                options={GEO_CATS}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Quantity" value={qty} onChange={setQty} min={1} />
              <div className="flex items-end">
                {/* preview */}
                <div className="flex items-center gap-2">
                  <WindowStyleSVG style={style} size={48} />
                  {width && height && (
                    <span className="text-xs text-gray-500">{width}×{height}<br />UI={parseInt(width||'0')+parseInt(height||'0')}</span>
                  )}
                </div>
              </div>
            </div>
            <Input
              label="Location Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., master bedroom, bathroom"
            />
            <Btn
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleAddWindow}
              disabled={!width || !height}
            >
              <Plus size={20} /> Add Window
            </Btn>
          </Card>
        ) : (
          <Card className="p-4 space-y-4">
            <SectionHeader title={`Add Patio Door — ${side} Side`} />
            <div className="grid grid-cols-2 gap-3">
              <Btn variant={doorType === 'Sliding' ? 'primary' : 'secondary'} onClick={() => setDoorType('Sliding')}>Sliding</Btn>
              <Btn variant={doorType === 'French' ? 'primary' : 'secondary'} onClick={() => setDoorType('French')}>French Swing</Btn>
            </div>
            <Select
              label="Configuration"
              value={doorType === 'Sliding' ? slidingConfig : frenchConfig}
              onChange={(e) => {
                if (doorType === 'Sliding') setSlidingConfig(e.target.value as SlidingDoorConfig);
                else setFrenchConfig(e.target.value as FrenchDoorConfig);
              }}
              options={doorType === 'Sliding' ? SLIDING_CONFIGS : FRENCH_CONFIGS}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Width (inches)" value={width} onChange={setWidth} unit="in" />
              <NumInput label="Height (inches)" value={height} onChange={setHeight} unit="in" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Quantity" value={qty} onChange={setQty} min={1} />
              <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="location..." />
            </div>
            <Btn variant="gold" size="lg" className="w-full" onClick={handleAddDoor} disabled={!width || !height}>
              <Plus size={20} /> Add Door
            </Btn>
          </Card>
        )}

        {/* Window list */}
        {totalItems > 0 && (
          <Card>
            <button
              className="flex w-full items-center justify-between px-4 py-3"
              onClick={() => setShowList(!showList)}
            >
              <span className="font-semibold text-hpr-dark">{totalItems} items added</span>
              {showList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showList && (
              <div className="border-t divide-y">
                {windowsBySide.map((group) => (
                  <div key={group.side}>
                    <div className={`px-4 py-2 text-xs font-semibold border-b ${SIDE_COLORS[group.side as HouseSide]}`}>
                      {group.side} ({group.items.length} windows)
                    </div>
                    {group.items.map((w, idx) => (
                      <WindowRow
                        key={w.id}
                        window={w}
                        index={idx}
                        onRemove={() => removeWindow(w.id)}
                        onDuplicate={() => duplicateWindow(w.id)}
                      />
                    ))}
                  </div>
                ))}
                {doors.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold border-b bg-amber-50 text-amber-800 border-amber-200">
                      Patio Doors ({doors.length})
                    </div>
                    {doors.map((d) => (
                      <div key={d.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <span className="font-medium text-sm">{d.doorType} Door – {d.config}</span>
                          <span className="text-gray-400 text-xs ml-2">{d.width}×{d.height} | {d.side} | qty {d.quantity}</span>
                          {d.note && <p className="text-xs text-gray-400">{d.note}</p>}
                        </div>
                        <button onClick={() => removeDoor(d.id)} className="p-2 text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-3 flex gap-3">
        <Btn variant="secondary" className="flex-1" onClick={() => setPhase('projects')}>
          Projects
        </Btn>
        <Btn
          variant="primary"
          className="flex-2 flex-grow-[2]"
          onClick={() => setPhase('configuration')}
          disabled={windows.length === 0 && doors.length === 0}
        >
          Options & Pricing →
        </Btn>
      </div>
    </div>
  );
}

function WindowRow({
  window: w,
  onRemove,
  onDuplicate,
}: {
  window: WindowEntry;
  index: number;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="flex items-center px-4 py-3 hover:bg-gray-50">
      <WindowStyleSVG style={w.style} size={36} className="shrink-0 mr-3" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">
          {WINDOW_STYLE_LABELS[w.style]} — {w.width}×{w.height}
          <span className="text-gray-400 ml-1">UI={w.width + w.height}</span>
        </div>
        <div className="text-xs text-gray-500">
          Qty: {w.quantity}
          {w.note && ` · ${w.note}`}
          {w.tempered && ' · Tempered'}
        </div>
      </div>
      <div className="flex gap-1 ml-2">
        <button onClick={onDuplicate} className="p-2 text-blue-400 hover:text-blue-600">
          <Copy size={15} />
        </button>
        <button onClick={onRemove} className="p-2 text-red-400 hover:text-red-600">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
