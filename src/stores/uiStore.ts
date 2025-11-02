import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type ActiveTab = "analysis" | "files" | "history" | "library";
type UploadMode = "single" | "bulk";
type ResultViewMode = "summary" | "detailed";

interface UIState {
  // Tab & View State
  activeTab: ActiveTab;
  uploadMode: UploadMode;
  resultViewMode: ResultViewMode;

  // Modal & Dialog State
  showFileEditor: boolean;
  showFileManager: boolean;
  showQueryHistory: boolean;
  showResultModal: boolean;
  showChatMode: boolean;

  // Editor State
  editedFile: string;
  generatedFile: string;

  // Selection State
  expandedResults: Set<string>;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setUploadMode: (mode: UploadMode) => void;
  setResultViewMode: (mode: ResultViewMode) => void;
  toggleFileEditor: () => void;
  toggleFileManager: () => void;
  toggleQueryHistory: () => void;
  toggleResultModal: () => void;
  toggleChatMode: () => void;
  setEditedFile: (content: string) => void;
  setGeneratedFile: (content: string) => void;
  toggleExpandedResult: (id: string) => void;
  clearExpandedResults: () => void;
  resetUI: () => void;
}

const initialState = {
  activeTab: "analysis" as ActiveTab,
  uploadMode: "single" as UploadMode,
  resultViewMode: "summary" as ResultViewMode,
  showFileEditor: false,
  showFileManager: false,
  showQueryHistory: false,
  showResultModal: false,
  showChatMode: false,
  editedFile: "",
  generatedFile: "",
  expandedResults: new Set<string>(),
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      set => ({
        ...initialState,

        setActiveTab: tab => set({ activeTab: tab }),

        setUploadMode: mode => set({ uploadMode: mode }),

        setResultViewMode: mode => set({ resultViewMode: mode }),

        toggleFileEditor: () =>
          set(state => ({ showFileEditor: !state.showFileEditor })),

        toggleFileManager: () =>
          set(state => ({ showFileManager: !state.showFileManager })),

        toggleQueryHistory: () =>
          set(state => ({ showQueryHistory: !state.showQueryHistory })),

        toggleResultModal: () =>
          set(state => ({ showResultModal: !state.showResultModal })),

        toggleChatMode: () =>
          set(state => ({ showChatMode: !state.showChatMode })),

        setEditedFile: content => set({ editedFile: content }),

        setGeneratedFile: content => set({ generatedFile: content }),

        toggleExpandedResult: id =>
          set(state => {
            const newSet = new Set(state.expandedResults);
            if (newSet.has(id)) {
              newSet.delete(id);
            } else {
              newSet.add(id);
            }
            return { expandedResults: newSet };
          }),

        clearExpandedResults: () => set({ expandedResults: new Set() }),

        resetUI: () => set(initialState),
      }),
      {
        name: "ui-store",
        partialize: state => ({
          activeTab: state.activeTab,
          uploadMode: state.uploadMode,
          resultViewMode: state.resultViewMode,
        }),
      }
    ),
    { name: "UIStore" }
  )
);
