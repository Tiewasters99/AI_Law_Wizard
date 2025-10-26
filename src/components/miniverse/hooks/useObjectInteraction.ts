import { useState, useCallback } from "react";
import { UserData } from "./useContentModal";

export interface ObjectInteractionState {
  lampsOn: boolean;
}

export interface ObjectInteractionActions {
  handleObjectClick: (userData: UserData) => void;
  setLampsOn: (on: boolean) => void;
}

export function useObjectInteraction(
  onContentClick: (content: UserData) => void
) {
  const [lampsOn, setLampsOn] = useState(true);

  const handleObjectClick = useCallback(
    (userData: UserData) => {
      if (userData.type === "lamp") {
        setLampsOn(prev => !prev);
      } else {
        onContentClick(userData);
      }
    },
    [onContentClick]
  );

  return {
    lampsOn,
    handleObjectClick,
    setLampsOn,
  };
}
