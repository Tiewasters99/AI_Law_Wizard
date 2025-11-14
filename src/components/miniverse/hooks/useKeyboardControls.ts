import { useState, useEffect, useCallback } from "react";

export interface KeyboardControlsState {
  showHelp: boolean;
}

export interface KeyboardControlsActions {
  setShowHelp: (show: boolean) => void;
  toggleHelp: () => void;
}

export function useKeyboardControls() {
  const [showHelp, setShowHelp] = useState(true);

  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") {
        toggleHelp();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleHelp]);

  return {
    showHelp,
    setShowHelp,
    toggleHelp,
  };
}
