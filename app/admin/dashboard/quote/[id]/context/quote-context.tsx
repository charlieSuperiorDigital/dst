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

interface ErrorState {
  bays: string[];
  framelines: string[];
  flues: string[];
}

interface QuoteContextType {
  quote: Quotes;
  isLocked: boolean;
  bayDefinition?: PartWithBays[];
  setBayDefinitionContext: React.Dispatch<React.SetStateAction<PartWithBays[]>>;
  updateBayDefinitionContext: (bay: PartWithBays[]) => void;
  error: ErrorState;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({
  children,
  initialValue,
}: {
  children: ReactNode;
  initialValue?: Omit<
    QuoteContextType,
    "updateBayDefinitionContext" | "setBayDefinitionContext" | "error"
  >;
}) {
  const [bayDefinitionContext, setBayDefinitionContext] = useState<
    PartWithBays[]
  >(initialValue?.bayDefinition || []);

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
    partWithBays: PartWithBays[]
  ): string[] => {
    // Implement the logic to check for problematic framelines
    return [];
  };

  const checkForProblematicFlues = (partWithBays: PartWithBays[]): string[] => {
    // Implement the logic to check for problematic flues
    return [];
  };

  useEffect(() => {
    const problematicBays = checkForZeroQuantityBays(bayDefinitionContext);
    const problematicFramelines =
      checkForProblematicFramelines(bayDefinitionContext);
    const problematicFlues = checkForProblematicFlues(bayDefinitionContext);

    setError({
      bays: problematicBays,
      framelines: problematicFramelines,
      flues: problematicFlues,
    });
  }, [bayDefinitionContext]); // Added dependencies

  const updateBayDefinitionContext = (newBay: PartWithBays[]) => {
    console.log("Updating bayDefinitionContext with:", newBay);
    setBayDefinitionContext(newBay);
  };

  return (
    <QuoteContext.Provider
      value={{
        quote: initialValue?.quote || ({} as Quotes),
        isLocked: initialValue?.isLocked || false,
        bayDefinition: bayDefinitionContext,
        updateBayDefinitionContext,
        setBayDefinitionContext,
        error,
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
