import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, WindowEntry, PatioDoortEntry, GlobalOptions,
  HomeownerInfo, SalesRepInfo, PricingConfig, WindowSillReplacement,
} from '../types';
import { DEFAULT_MARGIN, DEFAULT_SILL_PRICE } from '../data/pricing';

const DEFAULT_GLOBALS: GlobalOptions = {
  series: 'Panoramic',
  frameColor: 'White',
  glassPackage: 'Infinit-e',
  grids: 'None',
  frameType: 'Block',
  soundPackage: false,
  hardwareLock: 'Standard',
  hardwareFinish: 'Standard',
  screenType: 'Half',
  thermaCoat: 'None',
  argonGas: true,
};

const DEFAULT_PRICING: PricingConfig = {
  margin: DEFAULT_MARGIN,
  discountType: 'none',
  discountValue: 0,
  discountLabel: '',
  insuranceJob: false,
  depositPercent: 50,
  paymentMethod: 'Check',
  showCertificationsPage: true,
  showWindowPrices: true,
  showDoorPrices: true,
  showFinancing: true,
};

function newProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: 'New Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    homeowner: { name: '', address: '', city: '', state: 'TX', zip: '', phone: '', email: '' },
    salesRep: { name: '', phone: '214.396.7772', email: 'info@hprtexas.com' },
    windows: [],
    doors: [],
    globalOptions: { ...DEFAULT_GLOBALS },
    windowSills: { quantity: 0, unitPrice: DEFAULT_SILL_PRICE },
    pricing: { ...DEFAULT_PRICING },
    additionalDetails: '',
  };
}

export type AppPhase = 'measuring' | 'configuration' | 'proposal' | 'projects';

interface AppState {
  currentProject: Project;
  savedProjects: Project[];
  phase: AppPhase;
  internalView: boolean;

  // Phase navigation
  setPhase: (phase: AppPhase) => void;
  toggleInternalView: () => void;

  // Project management
  newProject: () => void;
  loadProject: (id: string) => void;
  saveProject: () => void;
  deleteProject: (id: string) => void;
  updateProjectName: (name: string) => void;

  // Homeowner / rep
  updateHomeowner: (info: Partial<HomeownerInfo>) => void;
  updateSalesRep: (info: Partial<SalesRepInfo>) => void;

  // Windows
  addWindow: (win: Omit<WindowEntry, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<WindowEntry>) => void;
  removeWindow: (id: string) => void;
  duplicateWindow: (id: string) => void;
  reorderWindows: (ids: string[]) => void;

  // Doors
  addDoor: (door: Omit<PatioDoortEntry, 'id'>) => void;
  updateDoor: (id: string, updates: Partial<PatioDoortEntry>) => void;
  removeDoor: (id: string) => void;

  // Global options
  updateGlobalOptions: (opts: Partial<GlobalOptions>) => void;

  // Window sills
  updateWindowSills: (sills: Partial<WindowSillReplacement>) => void;

  // Pricing
  updatePricing: (p: Partial<PricingConfig>) => void;

  // Notes
  setAdditionalDetails: (text: string) => void;
}

export const useProjectStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentProject: newProject(),
      savedProjects: [],
      phase: 'measuring',
      internalView: false,

      setPhase: (phase) => set({ phase }),
      toggleInternalView: () => set((s) => ({ internalView: !s.internalView })),

      newProject: () => set({ currentProject: newProject(), phase: 'measuring' }),

      loadProject: (id) => {
        const proj = get().savedProjects.find((p) => p.id === id);
        if (proj) set({ currentProject: { ...proj }, phase: 'measuring' });
      },

      saveProject: () => {
        const project = { ...get().currentProject, updatedAt: new Date().toISOString() };
        set((s) => {
          const existing = s.savedProjects.findIndex((p) => p.id === project.id);
          const updated = existing >= 0
            ? s.savedProjects.map((p) => p.id === project.id ? project : p)
            : [...s.savedProjects, project];
          return { savedProjects: updated, currentProject: project };
        });
      },

      deleteProject: (id) =>
        set((s) => ({ savedProjects: s.savedProjects.filter((p) => p.id !== id) })),

      updateProjectName: (name) =>
        set((s) => ({ currentProject: { ...s.currentProject, name } })),

      updateHomeowner: (info) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            homeowner: { ...s.currentProject.homeowner, ...info },
          },
        })),

      updateSalesRep: (info) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            salesRep: { ...s.currentProject.salesRep, ...info },
          },
        })),

      addWindow: (win) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            windows: [...s.currentProject.windows, { ...win, id: crypto.randomUUID() }],
          },
        })),

      updateWindow: (id, updates) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            windows: s.currentProject.windows.map((w) =>
              w.id === id ? { ...w, ...updates } : w,
            ),
          },
        })),

      removeWindow: (id) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            windows: s.currentProject.windows.filter((w) => w.id !== id),
          },
        })),

      duplicateWindow: (id) =>
        set((s) => {
          const idx = s.currentProject.windows.findIndex((w) => w.id === id);
          if (idx < 0) return s;
          const copy = { ...s.currentProject.windows[idx], id: crypto.randomUUID() };
          const wins = [...s.currentProject.windows];
          wins.splice(idx + 1, 0, copy);
          return { currentProject: { ...s.currentProject, windows: wins } };
        }),

      reorderWindows: (ids) =>
        set((s) => {
          const map = new Map(s.currentProject.windows.map((w) => [w.id, w]));
          const reordered = ids.map((id) => map.get(id)!).filter(Boolean);
          return { currentProject: { ...s.currentProject, windows: reordered } };
        }),

      addDoor: (door) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            doors: [...s.currentProject.doors, { ...door, id: crypto.randomUUID() }],
          },
        })),

      updateDoor: (id, updates) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            doors: s.currentProject.doors.map((d) =>
              d.id === id ? { ...d, ...updates } : d,
            ),
          },
        })),

      removeDoor: (id) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            doors: s.currentProject.doors.filter((d) => d.id !== id),
          },
        })),

      updateGlobalOptions: (opts) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            globalOptions: { ...s.currentProject.globalOptions, ...opts },
          },
        })),

      updateWindowSills: (sills) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            windowSills: { ...s.currentProject.windowSills, ...sills },
          },
        })),

      updatePricing: (p) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            pricing: { ...s.currentProject.pricing, ...p },
          },
        })),

      setAdditionalDetails: (text) =>
        set((s) => ({ currentProject: { ...s.currentProject, additionalDetails: text } })),
    }),
    {
      name: 'hpr-windows-storage',
      partialize: (state) => ({
        savedProjects: state.savedProjects,
        currentProject: state.currentProject,
      }),
    },
  ),
);
