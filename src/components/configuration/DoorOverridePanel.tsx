import { useProjectStore } from '../../store/projectStore';
import { Modal, Select, Toggle } from '../shared/UI';
import AdderEditor from '../shared/AdderEditor';
import { doorDisplayName, doorThermaCoatActive } from '../../utils/calculations';
import { ARCH_FINISH_LABELS, FLAT_OPTIONS } from '../../data/pricing';
import type {
  PatioDoortEntry, FrameColor, GlassPackage, GridStyle, ThermaCoatColor,
  ArchFinishColor, SlidingHandleStyle, HandleDesign,
} from '../../types';

const THERMA_COAT_OPTS: { value: ThermaCoatColor; label: string }[] = [
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

const HANDLE_COLOR_OPTS = Object.entries(ARCH_FINISH_LABELS).map(([value, label]) => ({ value, label }));

interface Props {
  door: PatioDoortEntry;
  onClose: () => void;
}

export default function DoorOverridePanel({ door: d, onClose }: Props) {
  const { updateDoor, currentProject } = useProjectStore();
  const globals = currentProject.globalOptions;

  const frameColor = d.frameColorOverride ?? globals.frameColor;
  const designerBlack = frameColor === 'Designer Black';
  const thermaActive = doorThermaCoatActive(d, globals);
  const isSliding = d.doorType === 'Sliding';
  const hasFinishedHandle = isSliding ? (d.slidingHandleStyle ?? 'Standard') !== 'Standard' : !!d.archFinish;
  const frenchNeedsArchFinish = !isSliding && (frameColor === 'Tan' || frameColor === 'Adobe') && !d.archFinish;

  function upd(updates: Partial<PatioDoortEntry>) {
    updateDoor(d.id, updates);
  }

  function setHandleStyle(value: string) {
    if (isSliding) {
      const slidingHandleStyle = value as SlidingHandleStyle;
      upd(slidingHandleStyle === 'Standard'
        ? { slidingHandleStyle }
        : { slidingHandleStyle, handleFinish: d.handleFinish && d.handleFinish !== 'Standard' ? d.handleFinish : 'SatinBlack' });
    } else {
      const archFinish = value === 'ArchFinish';
      upd(archFinish
        ? { archFinish, handleFinish: d.handleFinish && d.handleFinish !== 'Standard' ? d.handleFinish : 'SatinBlack' }
        : { archFinish });
    }
  }

  return (
    <Modal open title={`Edit Door: ${doorDisplayName(d)} ${d.width}×${d.height}`} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-600">
          {d.side} · {d.width}×{d.height} · qty {d.quantity}
        </div>

        <Select
          label="Frame Color"
          value={d.frameColorOverride ?? ''}
          onChange={(e) => upd(e.target.value === 'Designer Black'
            ? { frameColorOverride: 'Designer Black', thermaCoatOverride: 'None' }
            : { frameColorOverride: e.target.value ? e.target.value as FrameColor : undefined })}
          options={[
            { value: '', label: `(Use global default: ${globals.frameColor})` },
            { value: 'White', label: 'White' },
            { value: 'Adobe', label: 'Adobe' },
            { value: 'Tan', label: 'Tan' },
            { value: 'Designer Black', label: 'Designer Black (no ThermaCoat)' },
          ]}
        />

        <Select
          label={designerBlack ? 'ThermaCoat (not available with Designer Black)' : 'ThermaCoat'}
          disabled={designerBlack}
          value={d.thermaCoatOverride ?? 'None'}
          onChange={(e) => {
            const thermaCoatOverride = e.target.value as ThermaCoatColor;
            const grid = d.gridOverride ?? globals.grids;
            const flatOnly = thermaCoatOverride !== 'None' && (grid === 'SculpturedColonial' || grid === 'SculpturedInch');
            upd(flatOnly ? { thermaCoatOverride, gridOverride: 'FlatColonial' } : { thermaCoatOverride });
          }}
          options={THERMA_COAT_OPTS}
        />

        <Select
          label="Glass"
          value={d.glassOverride ?? ''}
          onChange={(e) => upd({ glassOverride: e.target.value ? e.target.value as GlassPackage : undefined })}
          options={[
            { value: '', label: `(Use global default: ${globals.glassPackage})` },
            { value: 'Infinit-e', label: 'Infinit-e' },
            { value: 'SunMatrix', label: 'SunMatrix' },
            { value: 'SunShield', label: 'SunShield' },
            { value: 'Standard', label: 'Standard' },
          ]}
        />

        <Select
          label={thermaActive ? 'Grids (Flat Colonial only with ThermaCoat)' : 'Grids'}
          value={d.gridOverride ?? ''}
          onChange={(e) => upd({ gridOverride: e.target.value ? e.target.value as GridStyle : undefined })}
          options={[
            { value: '', label: `(Use global default: ${globals.grids})` },
            { value: 'None', label: 'No Grids' },
            { value: 'FlatColonial', label: '5/8" Flat Colonial' },
            ...(thermaActive ? [] : [
              { value: 'SculpturedColonial', label: '5/8" Sculptured' },
              { value: 'SculpturedInch', label: '1" Sculptured' },
            ]),
          ]}
        />

        <div className="border-t pt-4 space-y-4">
          <Select
            label="Handle Style"
            value={d.handleDesign ?? 'Traditional'}
            onChange={(e) => upd({ handleDesign: e.target.value as HandleDesign })}
            options={[
              { value: 'Traditional', label: 'Traditional' },
              { value: 'Contemporary', label: 'Contemporary' },
            ]}
          />
          <Select
            label="Handle Finish"
            value={isSliding ? (d.slidingHandleStyle ?? 'Standard') : (d.archFinish ? 'ArchFinish' : 'Standard')}
            onChange={(e) => setHandleStyle(e.target.value)}
            options={isSliding ? [
              { value: 'Standard', label: 'Standard handle (white / tan / adobe)' },
              { value: 'Interior', label: `Finished handle, interior only (+$${FLAT_OPTIONS.HandleFinishIntOnly})` },
              { value: 'InteriorExterior', label: `Finished handle, interior & exterior (+$${FLAT_OPTIONS.HandleFinishIntExt})` },
            ] : [
              { value: 'Standard', label: 'Standard hardware' },
              { value: 'ArchFinish', label: `Architectural finish (+$${FLAT_OPTIONS.FrenchArchFinishX} per X panel)` },
            ]}
          />
          {frenchNeedsArchFinish && (
            <p className="text-xs text-amber-600 -mt-2">Tan and Adobe swing doors must select an architectural finish hardware.</p>
          )}
          {hasFinishedHandle && (
            <Select
              label="Handle Color"
              value={d.handleFinish && d.handleFinish !== 'Standard' ? d.handleFinish : 'SatinBlack'}
              onChange={(e) => upd({ handleFinish: e.target.value as ArchFinishColor })}
              options={HANDLE_COLOR_OPTS}
            />
          )}

          {isSliding && (
            <div className="space-y-3">
              <Toggle
                label={`Quad Lock (+$${FLAT_OPTIONS.QuadLock})`}
                checked={!!d.quadLock}
                onChange={(v) => upd(v ? { quadLock: true, keyedCylinder: false, extPullHandle: false } : { quadLock: false })}
              />
              <Toggle
                label={`Keyed Lock Cylinder (+$${FLAT_OPTIONS.KeyedLockCylinder})`}
                description={d.quadLock ? 'Not available with Quad Lock' : undefined}
                checked={!!d.keyedCylinder}
                onChange={(v) => upd(v ? { keyedCylinder: true } : { keyedCylinder: false, extPullHandle: false })}
              />
              {d.keyedCylinder && !d.quadLock && (
                <Toggle
                  label={`Exterior Pull Handle for Keyed Cylinder (+$${FLAT_OPTIONS.ExtPullHandle})`}
                  checked={!!d.extPullHandle}
                  onChange={(v) => upd({ extPullHandle: v })}
                />
              )}
              <Toggle
                label={`Dead Bolt, Upper Vent (+$${FLAT_OPTIONS.DeadBoltUpperVent})`}
                checked={!!d.deadBolt}
                onChange={(v) => upd({ deadBolt: v })}
              />
              <Toggle
                label={`Stainless Vent & Screen Rollers (+$${FLAT_OPTIONS.StainlessRollers})`}
                checked={!!d.stainlessRollers}
                onChange={(v) => upd({ stainlessRollers: v })}
              />
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <AdderEditor adders={d.adders} onChange={(adders) => updateDoor(d.id, { adders })} quantity={d.quantity} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Extra Notes</label>
          <textarea
            value={d.extraNotes ?? ''}
            onChange={(e) => upd({ extraNotes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-hpr-blue"
          />
        </div>
      </div>
    </Modal>
  );
}
