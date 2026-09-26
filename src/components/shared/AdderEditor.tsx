import { Plus, Trash2 } from 'lucide-react';
import type { Adder } from '../../types';

interface Props {
  adders: Adder[] | undefined;
  onChange: (adders: Adder[]) => void;
  quantity: number;
}

function MoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex-1 min-w-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          placeholder="0"
          className="h-11 w-full pl-6 pr-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-hpr-blue"
        />
      </div>
    </label>
  );
}

// Editable list of custom line-item adders (extra construction such as widening an
// opening or adding a header). Price and cost are per unit and multiplied by the item quantity.
export default function AdderEditor({ adders = [], onChange, quantity }: Props) {
  const update = (id: string, patch: Partial<Adder>) =>
    onChange(adders.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Adders (extra construction)</label>
        <button
          type="button"
          onClick={() => onChange([...adders, { id: crypto.randomUUID(), description: '', price: 0, cost: 0 }])}
          className="flex items-center gap-1 text-sm font-medium text-hpr-blue hover:underline"
        >
          <Plus size={14} /> Add adder
        </button>
      </div>
      {adders.length === 0 && (
        <p className="text-xs text-gray-400">e.g., increase opening, add header</p>
      )}
      {adders.map((a) => (
        <div key={a.id} className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={a.description}
              onChange={(e) => update(a.id, { description: e.target.value })}
              placeholder="Description (e.g., Add header)"
              className="h-11 flex-1 min-w-0 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hpr-blue"
            />
            <button
              type="button"
              onClick={() => onChange(adders.filter((x) => x.id !== a.id))}
              className="p-2 text-gray-400 hover:text-red-500 shrink-0"
              aria-label="Remove adder"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <MoneyInput label="Price (to customer)" value={a.price} onChange={(price) => update(a.id, { price })} />
            <MoneyInput label="Cost (HPR, internal)" value={a.cost ?? 0} onChange={(cost) => update(a.id, { cost })} />
          </div>
        </div>
      ))}
      {adders.length > 0 && quantity > 1 && (
        <p className="text-xs text-gray-400">Price and cost are per unit and are multiplied by the quantity ({quantity}).</p>
      )}
    </div>
  );
}
