"use client";

import type { Quotes } from "@/app/entities/Quotes";
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import type { PartWithBays } from "../components/bay-definition-tab/table-test2";
import { PartWithFrames } from "../components/frameline-definition-tab/frame-definition-table";
import { PartWithFlues } from "../components/flue-dinition-tab/flue-definition-table";

interface ErrorState {
  bays: string[];
  framelines: string[];
  flues: string[];
}

interface QuoteContextType {
  quote: Quotes;
  isLocked: boolean;
  bayDefinition?: PartWithBays[];
  framelineDefinition?: PartWithFrames[];
  flueDefinition?: PartWithFlues[];
  setBayDefinitionContext: React.Dispatch<React.SetStateAction<PartWithBays[]>>;
  setFrameLinesDefinitionContext: React.Dispatch<
    React.SetStateAction<PartWithFrames[]>
  >;
  setFluesDefinitionContext: React.Dispatch<
    React.SetStateAction<PartWithFlues[]>
  >;
  updateBayDefinitionContext: (bay: PartWithBays[]) => void;
  error: ErrorState;
  bayDefinitionContext?: PartWithBays[];
  frameLinesDefinitionContext?: PartWithFrames[];
  fluesDefinitionContext?: PartWithFlues[];
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({
  children,
  initialValue,
}: {
  children: ReactNode;
  initialValue?: Omit<
    QuoteContextType,
    | "updateBayDefinitionContext"
    | "setBayDefinitionContext"
    | "error"
    | "setFrameLinesDefinitionContext"
    | "setFluesDefinitionContext"
    | "bayDefinitionContext"
    | "frameLinesDefinitionContext"
    | "fluesDefinitionContext"
  >;
}) {
  const [bayDefinitionContext, setBayDefinitionContext] = useState<
    PartWithBays[]
  >(initialValue?.bayDefinition || []);

  const [frameLinesDefinitionContext, setFrameLinesDefinitionContext] =
    useState<PartWithFrames[]>(initialValue?.framelineDefinition || []);
  const [fluesDefinitionContext, setFluesDefinitionContext] = useState<
    PartWithFlues[]
  >(initialValue?.flueDefinition || []);

  const [error, setError] = useState<ErrorState>({
    bays: [],
    framelines: [],
    flues: [],
  });

  const checkForZeroQuantityBays = (partWithBays: PartWithBays[]): string[] => {
    const problematicBays: string[] = [];

    partWithBays.forEach((partWithBay) => {
      partWithBay.bays.forEach((bay) => {
        if (bay.quantity === 0) {
          const allPartsZero = partWithBays
            .filter((p) => p.bays.some((b) => b.bayId === bay.bayId))
            .every(
              (p) => p.bays.find((b) => b.bayId === bay.bayId)?.quantity === 0
            );

          if (allPartsZero && !problematicBays.includes(bay.bayName)) {
            problematicBays.push(bay.bayName);
          }
        }
      });
    });

    return problematicBays;
  };

  // Add similar functions for framelines and flues if needed
  const checkForProblematicFramelines = (
    partWithFrames: PartWithFrames[]
  ): string[] => {
    const problematicFrames: string[] = [];

    partWithFrames.forEach((partWithBay) => {
      partWithBay.framelines.forEach((frameline) => {
        if (frameline.quantity === 0) {
          const allPartsZero = partWithFrames
            .filter((p) =>
              p.framelines.some((f) => f.framelineId === frameline.framelineId)
            )
            .every(
              (p) =>
                p.framelines.find(
                  (f) => f.framelineId === frameline.framelineId
                )?.quantity === 0
            );

          if (
            allPartsZero &&
            !problematicFrames.includes(frameline.framelineName)
          ) {
            problematicFrames.push(frameline.framelineName);
          }
        }
      });
    });

    return problematicFrames;
  };
  const checkForProblematicFlues = (
    partWithFlues: PartWithFlues[]
  ): string[] => {
    const problematicFlues: string[] = [];

    partWithFlues.forEach((partWithFlue) => {
      partWithFlue.flues.forEach((flue) => {
        if (flue.quantity === 0) {
          const allPartsZero = partWithFlues
            .filter((p) => p.flues.some((f) => f.flueId === flue.flueId))
            .every(
              (p) =>
                p.flues.find((f) => f.flueId === flue.flueId)?.quantity === 0
            );

          if (allPartsZero && !problematicFlues.includes(flue.flueName)) {
            problematicFlues.push(flue.flueName);
          }
        }
      });
    });

    return problematicFlues;
  };

  useEffect(() => {
    const problematicBays = checkForZeroQuantityBays(bayDefinitionContext);
    const problematicFramelines = checkForProblematicFramelines(
      frameLinesDefinitionContext
    );
    const problematicFlues = checkForProblematicFlues(fluesDefinitionContext);

    setError({
      bays: problematicBays,
      framelines: problematicFramelines,
      flues: problematicFlues,
    });
  }, [
    bayDefinitionContext,
    frameLinesDefinitionContext,
    fluesDefinitionContext,
  ]);

  const updateBayDefinitionContext = (newBay: PartWithBays[]) => {
    setBayDefinitionContext(newBay);
  };

  return (
    <QuoteContext.Provider
      value={{
        quote: initialValue?.quote || ({} as Quotes),
        isLocked: initialValue?.isLocked || false,
        bayDefinitionContext: bayDefinitionContext,
        frameLinesDefinitionContext,
        fluesDefinitionContext,
        updateBayDefinitionContext,
        setBayDefinitionContext,
        error,
        setFluesDefinitionContext,
        setFrameLinesDefinitionContext,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

// Custom hook to use the context
export function useQuote() {
  const context = useContext(QuoteContext);

  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }

  return context;
}
