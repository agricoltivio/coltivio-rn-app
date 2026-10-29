import {
  ParasiteCheck,
  ParasiteResultGrade,
  ParasiteType,
} from "@/api/parasite-checks.api";
import { create } from "zustand";

// A result is entered either as a count or as a grade (+/++/+++)
export type ParasiteResultDraft = {
  key: string;
  parasiteType: ParasiteType;
  useGrade: boolean;
  countPerGram: string;
  grade: ParasiteResultGrade | null;
};

// Labs usually report these only as + / ++ / +++ (or tapeworm eggs detected)
const GRADED_BY_DEFAULT: ParasiteType[] = ["coccidia", "lungworm", "moniezia"];

export function newResultDraft(
  parasiteType: ParasiteType,
): ParasiteResultDraft {
  return {
    key: nextResultKey(),
    parasiteType,
    useGrade: GRADED_BY_DEFAULT.includes(parasiteType),
    countPerGram: "",
    // A graded row always has a value; "–" (negative) until something is found
    grade: "negative",
  };
}

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
          useGrade: result.grade !== null,
          countPerGram:
            result.countPerGram !== null ? String(result.countPerGram) : "",
          grade: result.grade,
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

// Rows with a valid entered value only (a grade, or a count; "." is not a number)
type FilledResult = {
  parasiteType: ParasiteType;
  countPerGram?: number;
  grade?: ParasiteResultGrade;
};

export function filledResults(
  results: ParasiteResultDraft[] | undefined,
): FilledResult[] {
  return (results ?? []).flatMap((result): FilledResult[] => {
    if (result.useGrade) {
      return result.grade
        ? [{ parasiteType: result.parasiteType, grade: result.grade }]
        : [];
    }
    const countPerGram = parseFloat(result.countPerGram);
    return Number.isFinite(countPerGram)
      ? [{ parasiteType: result.parasiteType, countPerGram }]
      : [];
  });
}

export function hasDuplicateParasiteType(
  results: ParasiteResultDraft[] | undefined,
) {
  const types = (results ?? []).map((result) => result.parasiteType);
  return new Set(types).size !== types.length;
}
