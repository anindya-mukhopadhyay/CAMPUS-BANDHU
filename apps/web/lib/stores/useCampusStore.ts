import { create } from "zustand";

type CampusState = {
  selectedInterests: string[];
  campusMode: "student" | "recruiter" | "organizer";
  setSelectedInterests: (value: string[]) => void;
  toggleInterest: (value: string) => void;
  setCampusMode: (mode: CampusState["campusMode"]) => void;
};

export const useCampusStore = create<CampusState>((set) => ({
  selectedInterests: ["ai", "networking", "hackathon"],
  campusMode: "student",
  setSelectedInterests: (value) => set({ selectedInterests: value }),
  toggleInterest: (value) =>
    set((state) => ({
      selectedInterests: state.selectedInterests.includes(value)
        ? state.selectedInterests.filter((item) => item !== value)
        : [...state.selectedInterests, value]
    })),
  setCampusMode: (mode) => set({ campusMode: mode })
}));
