import { FolderOpen, Plus, Trash2, ChevronRight, Save } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { Btn, Card } from '../shared/UI';
import { formatCurrency } from '../../utils/calculations';
import { calcAllBreakdowns, calcProjectTotals } from '../../utils/calculations';

export default function ProjectsScreen() {
  const { savedProjects, currentProject, newProject, loadProject, deleteProject, saveProject, setPhase } = useProjectStore();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getProjectTotal(p: typeof currentProject) {
    const bd = calcAllBreakdowns(p.windows, p.doors, p.globalOptions, p.pricing.margin);
    const t = calcProjectTotals(bd, p.windowSills.quantity, p.windowSills.unitPrice, p.pricing, p.windows.length + p.doors.length);
    return t.totalContractAmount;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-hpr-blue text-white px-4 pt-safe-top pb-3 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Projects</h1>
          <Btn variant="gold" size="sm" onClick={() => { setPhase('measuring'); }}>
            Current Job
          </Btn>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-2xl mx-auto space-y-4">
        {/* Current project */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-hpr-dark">Current Project</div>
              <div className="text-sm text-gray-500">{currentProject.homeowner.name || '(No homeowner)'}</div>
            </div>
            <Btn variant="secondary" size="sm" onClick={saveProject}>
              <Save size={14} /> Save
            </Btn>
          </div>
          <div className="text-xs text-gray-400">
            {currentProject.windows.length} windows · {currentProject.doors.length} doors · {formatCurrency(getProjectTotal(currentProject))}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">Saved Projects ({savedProjects.length})</h2>
          <Btn variant="primary" size="sm" onClick={newProject}>
            <Plus size={14} /> New Project
          </Btn>
        </div>

        {savedProjects.length === 0 && (
          <Card className="p-8 text-center">
            <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No saved projects yet</p>
            <p className="text-gray-400 text-xs mt-1">Complete a job and tap Save</p>
          </Card>
        )}

        {savedProjects.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <button
              className="flex items-center w-full px-4 py-4 hover:bg-gray-50 text-left"
              onClick={() => { loadProject(p.id); setPhase('measuring'); }}
            >
              <div className="flex-1">
                <div className="font-semibold text-hpr-dark">{p.homeowner.name || '(No name)'}</div>
                <div className="text-sm text-gray-500">
                  {p.homeowner.address ? `${p.homeowner.address}, ${p.homeowner.city}` : 'No address'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {p.windows.length} windows · {p.doors.length} doors · Saved {formatDate(p.updatedAt)}
                </div>
              </div>
              <div className="text-right mr-3">
                <div className="text-lg font-bold text-hpr-blue">{formatCurrency(getProjectTotal(p))}</div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <div className="border-t px-4 py-2 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Delete ${p.homeowner.name || 'this project'}?`)) deleteProject(p.id);
                }}
                className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
