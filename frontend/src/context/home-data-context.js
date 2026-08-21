import { createContext, useContext } from "react";

export const HomeDataContext = createContext(null);

export function useHomeData() {
  const context = useContext(HomeDataContext);

  if (!context) {
    throw new Error(
      "useHomeData must be used inside HomeDataProvider",
    );
  }

  return context;
}