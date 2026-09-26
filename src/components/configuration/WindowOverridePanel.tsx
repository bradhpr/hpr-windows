import { useProjectStore } from '../../store/projectStore';
import { Modal, Select, Toggle } from '../shared/UI';
import AdderEditor from '../shared/AdderEditor';
import { WINDOW_STYLE_LABELS, WindowStyleSVG } from '../shared/WindowStyleSVG';
import { thermaCoatActive } from '../../utils/calculations';
import type { WindowEntry, WindowStyle, ObscureGlass, ScreenType, GridStyle, FrameType, FrameColor, GlassPackage, ThermaCoatColor, WindowSeries } from '../../types';

const OBSCURE_OPTS: { value: ObscureGlass; label: string }[] = [
  { value: 'None', label: 'None' },
  { value: 'P516', label: 'Standard Obscure (P516)' },
  { value: 'EtchMatte', label: 'Etch Matte' },
  { value: 'GlueChip', label: 'Glue Chip' },
  { value: 'Rain', label: 'Rain' },
  { value: 'DeltaFrost', label: 'Delta Frost' },
  { value: 'Reed', label: 'Reed' },
  { value: 'Flemish', label: 'Flemish' },
];

const STYLE_OPTS = (Object.keys(WINDOW_STYLE_LABELS) as WindowStyle[]).map((k) => ({
  value: k,
  label: WINDOW_STYLE_LABELS[k],
}));

interface Props {
  window: WindowEntry;
  onClose: () => void;
}

export default function WindowOverridePanel({ window: w, onClose }: Props) {
  const { updateWindow, currentProject } = useProjectStore();
  const thermaActive = thermaCoatActive(w, currentProject.globalOptions);
  const designerBlack = (w.frameColorOverride ?? currentProject.globalOptions.frameColor) === 'Designer Black';

  function upd(updates: Partial<WindowEntry>) {
    updateWindow(w.id, updates);
  }

  return (
    <Modal open title={`Override: ${WINDOW_STYLE_LABELS[w.style]} ${w.width}×${w.height}`} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <WindowStyleSVG style={w.style} size={48} />
          <div>
            <div className="font-semibold">{WINDOW_STYLE_LABELS[w.style]}</div>
            <div className="text-sm text-gray-500">{w.width}×{w.height} | {w.side} | qty {w.quantity}</div>
          </div>
        </div>

        <Select
          label="Style Override"
          value={w.style}
          onChange={(e) => upd({ style: e.target.value as WindowStyle })}
          options={STYLE_OPTS}
        />

        <Select
          label="Series Override"
          value={w.seriesOverride ?? ''}
          onChange={(e) => upd({ seriesOverride: e.target.value ? e.target.value as WindowSeries : undefined })}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'Panoramic', label: 'Panoramic' },
            { value: 'Catalina', label: 'Catalina' },
            { value: 'Coronado', label: 'Coronado' },
          ]}
        />

        <Select
          label="Frame Color Override"
          value={w.frameColorOverride ?? ''}
          onChange={(e) => upd(e.target.value === 'Designer Black' ? { frameColorOverride: 'Designer Black', thermaCoatOverride: 'None' } : { frameColorOverride: e.target.value ? e.target.value as FrameColor : undefined })}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'White', label: 'White' },
            { value: 'Adobe', label: 'Adobe' },
            { value: 'Tan', label: 'Tan' },
            { value: 'Designer Black', label: 'Designer Black (no ThermaCoat)' },
          ]}
        />

        <Select
          label="Glass Override"
          value={w.glassOverride ?? ''}
          onChange={(e) => upd({ glassOverride: e.target.value ? e.target.value as GlassPackage : undefined })}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'Infinit-e', label: 'Infinit-e' },
            { value: 'SunMatrix', label: 'SunMatrix' },
            { value: 'SunShield', label: 'SunShield' },
            { value: 'Standard', label: 'Standard' },
          ]}
        />

        <Select
          label={thermaActive ? 'Grid Override (Flat Colonial only with ThermaCoat)' : 'Grid Override'}
          value={w.gridOverride ?? ''}
          onChange={(e) => upd({ gridOverride: e.target.value ? e.target.value as GridStyle : undefined })}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'None', label: 'No Grids' },
            { value: 'FlatColonial', label: '5/8" Flat Colonial' },
            ...(thermaActive ? [] : [
              { value: 'SculpturedColonial', label: '5/8" Sculptured' },
              { value: 'SculpturedInch', label: '1" Sculptured' },
            ]),
          ]}
        />

        <Select
          label="Frame Type Override"
          value={w.frameTypeOverride ?? ''}
          onChange={(e) => upd({ frameTypeOverride: e.target.value ? e.target.value as FrameType : undefined })}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'Block', label: 'Block / Nail Fin' },
            { value: 'RetroFin', label: 'Retro-Fin' },
            { value: 'BrickMould', label: 'Brick Mould' },
          ]}
        />

        <Select
          label="Screen Override"
          value={w.screenOverride ?? ''}
          onChange={(e) => upd({ screenOverride: e.target.value ? e.target.value as ScreenType : undefined })}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'Half', label: 'Half Screen' },
            { value: 'Full', label: 'Full Screen' },
            { value: 'None', label: 'No Screen' },
          ]}
        />

        <Select
          label="Obscure Glass"
          value={w.obscure}
          onChange={(e) => upd({ obscure: e.target.value as ObscureGlass })}
          options={OBSCURE_OPTS}
        />

        <Select
          label={designerBlack ? 'ThermaCoat Override (not available with Designer Black)' : 'ThermaCoat Override'}
          disabled={designerBlack}
          value={w.thermaCoatOverride ?? ''}
          onChange={(e) => {
            const thermaCoatOverride = e.target.value ? e.target.value as ThermaCoatColor : undefined;
            const grid = w.gridOverride;
            const flatOnly = thermaCoatOverride && thermaCoatOverride !== 'None' && (grid === 'SculpturedColonial' || grid === 'SculpturedInch');
            upd(flatOnly ? { thermaCoatOverride, gridOverride: 'FlatColonial' } : { thermaCoatOverride });
          }}
          options={[
            { value: '', label: '(Use global default)' },
            { value: 'None', label: 'Not Included' },
            { value: 'ArchitecturalBlack', label: 'Architectural Black' },
            { value: 'ArchitecturalBronze', label: 'Architectural Bronze' },
            { value: 'ClassicGray', label: 'Classic Gray' },
            { value: 'Espresso', label: 'Espresso' },
            { value: 'Taupe', label: 'Taupe' },
            { value: 'RedPepper', label: 'Red Pepper' },
            { value: 'RoseWood', label: 'Rose Wood' },
            { value: 'DesertTan', label: 'Desert Tan' },
            { value: 'Sandstone', label: 'Sandstone' },
            { value: 'DivineWine', label: 'Divine Wine' },
            { value: 'ForestGreen', label: 'Forest Green' },
          ]}
        />

        <div className="space-y-3 pt-2">
          <Toggle
            label="Tempered Glass"
            checked={w.tempered}
            onChange={(v) => upd({ tempered: v })}
            description="Required for bathrooms, near doors, and low sills"
          />
          <Toggle
            label="Sound Package (SST)"
            checked={w.soundPackageOverride ?? false}
            onChange={(v) => upd({ soundPackageOverride: v })}
          />
          <Toggle
            label="True Action Lock"
            checked={w.hardwareLockOverride === 'TrueAction'}
            onChange={(v) => upd({ hardwareLockOverride: v ? 'TrueAction' : undefined })}
          />
          <Toggle
            label="Custom Vent Size (Oriel)"
            checked={w.customVentSize ?? false}
            onChange={(v) => upd({ customVentSize: v })}
          />
          <Toggle
            label="Window Limiting Device"
            checked={w.windowLimitingDevice ?? false}
            onChange={(v) => upd({ windowLimitingDevice: v })}
          />
        </div>

        <div className="border-t pt-4">
          <AdderEditor adders={w.adders} onChange={(adders) => upd({ adders })} quantity={w.quantity} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Extra Notes</label>
          <textarea
            value={w.extraNotes}
            onChange={(e) => upd({ extraNotes: e.target.value })}
            rows={2}
            placeholder="e.g., mulled pair, Contemporary Dark Bronze handle"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-hpr-blue"
          />
        </div>
      </div>
    </Modal>
  );
}
