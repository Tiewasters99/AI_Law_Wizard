import { useState, useCallback } from "react";

export interface UserData {
  type: string;
  label: string;
  interactive: boolean;
}

export interface ContentModalState {
  selectedContent: UserData | null;
}

export interface ContentModalActions {
  openModal: (content: UserData) => void;
  closeModal: () => void;
}

export function useContentModal() {
  const [selectedContent, setSelectedContent] = useState<UserData | null>(null);

  const openModal = useCallback((content: UserData) => {
    setSelectedContent(content);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedContent(null);
  }, []);

  return {
    selectedContent,
    openModal,
    closeModal,
  };
}
