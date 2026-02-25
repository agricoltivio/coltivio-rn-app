import { create } from "zustand";
import { PlotCropRotation } from "@/api/crop-rotations.api";

export type RecurrenceRule = {
  interval: number; // every N years
  until?: Date;
};

export type RotationEntry = {
  entryId: string;
  rotationId?: string; // present if editing existing rotation
  cropId: string;
  fromDate: Date;
  toDate: Date;
  recurrence?: RecurrenceRule;
};

export type PlotRotationPlan = {
  plotId: string;
  rotations: RotationEntry[];
};

type PlanCropRotationsStore = {
  plotPlans: PlotRotationPlan[];
  setPlotIds: (plotIds: string[]) => void;
  initializeFromExisting: (plotIds: string[], existingRotations: PlotCropRotation[]) => void;
  addRotation: (plotId: string, rotation: RotationEntry) => void;
  updateRotation: (plotId: string, entryId: string, updates: Partial<RotationEntry>) => void;
  removeRotation: (plotId: string, entryId: string) => void;
  getPlotPlan: (plotId: string) => PlotRotationPlan | undefined;
  reset: () => void;
};

export const usePlanCropRotationsStore = create<PlanCropRotationsStore>((set, get) => ({
  plotPlans: [],

  setPlotIds: (plotIds: string[]) => {
    // Only add empty rotation for plots without any rotations yet
    const existingPlotIds = new Set(get().plotPlans.map(p => p.plotId));
    const newPlotPlans = plotIds
      .filter(id => !existingPlotIds.has(id))
      .map(plotId => ({
        plotId,
        rotations: [] as RotationEntry[],
      }));

    set(state => ({
      plotPlans: [
        ...state.plotPlans.filter(p => plotIds.includes(p.plotId)),
        ...newPlotPlans,
      ],
    }));
  },

  initializeFromExisting: (plotIds: string[], existingRotations: PlotCropRotation[]) => {
    const plotPlans: PlotRotationPlan[] = plotIds.map(plotId => {
      const plotRotations = existingRotations.filter(r => r.plotId === plotId);
      const rotations: RotationEntry[] = plotRotations.map(r => {
        // Extract recurrence if present (API returns it when includeRecurrence=true)
        const apiRecurrence = (r as PlotCropRotation & { recurrence?: { interval: number; until?: string } }).recurrence;
        return {
          entryId: `existing-${r.id}`,
          rotationId: r.id,
          cropId: r.cropId,
          fromDate: new Date(r.fromDate),
          toDate: new Date(r.toDate),
          recurrence: apiRecurrence ? {
            interval: apiRecurrence.interval,
            until: apiRecurrence.until ? new Date(apiRecurrence.until) : undefined,
          } : undefined,
        };
      });
      return { plotId, rotations };
    });
    set({ plotPlans });
  },

  addRotation: (plotId: string, rotation: RotationEntry) => {
    set(state => ({
      plotPlans: state.plotPlans.map(plan =>
        plan.plotId === plotId
          ? { ...plan, rotations: [...plan.rotations, rotation] }
          : plan
      ),
    }));
  },

  updateRotation: (plotId: string, entryId: string, updates: Partial<RotationEntry>) => {
    set(state => ({
      plotPlans: state.plotPlans.map(plan =>
        plan.plotId === plotId
          ? {
              ...plan,
              rotations: plan.rotations.map(r =>
                r.entryId === entryId ? { ...r, ...updates } : r
              ),
            }
          : plan
      ),
    }));
  },

  removeRotation: (plotId: string, entryId: string) => {
    set(state => ({
      plotPlans: state.plotPlans.map(plan =>
        plan.plotId === plotId
          ? {
              ...plan,
              rotations: plan.rotations.filter(r => r.entryId !== entryId),
            }
          : plan
      ),
    }));
  },

  getPlotPlan: (plotId: string) => {
    return get().plotPlans.find(p => p.plotId === plotId);
  },

  reset: () => {
    set({ plotPlans: [] });
  },
}));
