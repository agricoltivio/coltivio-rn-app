import { ParasiteCheck, ParasiteType } from "@/api/parasite-checks.api";
import { create } from "zustand";

export type ParasiteResultDraft = {
  key: string;
  parasiteType: ParasiteType;
  countPerGram: string;
};

// A check holds either one pooled sample for all animals or one sample per animal
export type ParasiteSampleMode = "pooled" | "individual";

type ParasiteSampleDraftState = {
  mode: ParasiteSampleMode;
  labName: string;
  pooledLabel: string;
  pooledResults: ParasiteResultDraft[];
  // Keyed by animal id, so an animal can only have one sample
  individualResults: Record<string, ParasiteResultDraft[]>;
  setMode: (mode: ParasiteSampleMode) => void;
  setLabName: (labName: string) => void;
  setPooledLabel: (pooledLabel: string) => void;
  setPooledResults: (results: ParasiteResultDraft[]) => void;
  setAnimalResults: (animalId: string, results: ParasiteResultDraft[]) => void;
  reset: () => void;
  initFromCheck: (check: ParasiteCheck) => void;
};

let resultKeyCounter = 0;
export function nextResultKey() {
  resultKeyCounter += 1;
  return `result-${resultKeyCounter}`;
}

const emptyDraft: Pick<
  ParasiteSampleDraftState,
  "mode" | "labName" | "pooledLabel" | "pooledResults" | "individualResults"
> = {
  mode: "pooled",
  labName: "",
  pooledLabel: "",
  pooledResults: [],
  individualResults: {},
};

export const useParasiteSampleDraftStore = create<ParasiteSampleDraftState>(
  (set) => ({
    ...emptyDraft,
    setMode: (mode) => set({ mode }),
    setLabName: (labName) => set({ labName }),
    setPooledLabel: (pooledLabel) => set({ pooledLabel }),
    setPooledResults: (pooledResults) => set({ pooledResults }),
    setAnimalResults: (animalId, results) =>
      set((state) => ({
        individualResults: { ...state.individualResults, [animalId]: results },
      })),
    reset: () => set(emptyDraft),
    initFromCheck: (check) => {
      const toDrafts = (
        results: ParasiteCheck["fecSamples"][number]["results"],
      ) =>
        results.map((result) => ({
          key: nextResultKey(),
          parasiteType: result.parasiteType,
          countPerGram: String(result.countPerGram),
        }));
      const pooledSample = check.fecSamples.find((sample) => sample.pooled);
      if (pooledSample) {
        set({
          ...emptyDraft,
          labName: check.labName ?? "",
          pooledLabel: pooledSample.label ?? "",
          pooledResults: toDrafts(pooledSample.results),
        });
        return;
      }
      set({
        ...emptyDraft,
        mode: check.fecSamples.length > 0 ? "individual" : "pooled",
        labName: check.labName ?? "",
        individualResults: Object.fromEntries(
          check.fecSamples.map((sample) => [
            sample.animalIds[0],
            toDrafts(sample.results),
          ]),
        ),
      });
    },
  }),
);

// Rows with an entered value only
export function filledResults(results: ParasiteResultDraft[] | undefined) {
  return (results ?? [])
    .filter((result) => result.countPerGram !== "")
    .map((result) => ({
      parasiteType: result.parasiteType,
      countPerGram: parseFloat(result.countPerGram),
    }));
}

export function hasDuplicateParasiteType(
  results: ParasiteResultDraft[] | undefined,
) {
  const types = (results ?? []).map((result) => result.parasiteType);
  return new Set(types).size !== types.length;
}
