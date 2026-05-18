"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export const TOUR_OPT_OUT_KEY = "proenergia_tour_opt_out";
export const TOUR_VISITS_KEY = "proenergia_tour_visits";
export const TOUR_SESSION_KEY = "proenergia_tour_session_counted";
export const MAX_AUTO_SHOW_VISITS = 5;

interface TourContextType {
  isRunning: boolean;
  stepIndex: number;
  setStepIndex: (n: number) => void;
  startTour: (manual?: boolean) => void;
  stopTour: () => void;
  isManual: boolean;
  registerAction: (name: string, fn: (...args: unknown[]) => void) => void;
  callAction: (name: string, ...args: unknown[]) => void;
  dontShowAgain: boolean;
  setDontShowAgain: (v: boolean) => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const [dontShowAgain, setDontShowAgainState] = useState(false);
  const actionsRef = useRef<Record<string, (...args: unknown[]) => void>>({});

  const registerAction = useCallback(
    (name: string, fn: (...args: unknown[]) => void) => {
      actionsRef.current[name] = fn;
    },
    [],
  );

  const callAction = useCallback((name: string, ...args: unknown[]) => {
    actionsRef.current[name]?.(...args);
  }, []);

  const setDontShowAgain = useCallback((v: boolean) => {
    setDontShowAgainState(v);
    if (v) localStorage.setItem(TOUR_OPT_OUT_KEY, "true");
    else localStorage.removeItem(TOUR_OPT_OUT_KEY);
  }, []);

  const startTour = useCallback((manual = false) => {
    setIsManual(manual);
    setStepIndex(0);
    setIsRunning(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsRunning(false);
    setStepIndex(0);
  }, []);

  return (
    <TourContext.Provider
      value={{
        isRunning,
        stepIndex,
        setStepIndex,
        startTour,
        stopTour,
        isManual,
        registerAction,
        callAction,
        dontShowAgain,
        setDontShowAgain,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}
