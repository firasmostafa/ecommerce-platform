import { createContext } from "react";

export const CurrencyContext = createContext(null);

export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    rate: 1,
    locale: "en-US",
  },

  LBP: {
    code: "LBP",
    symbol: "L.L.",
    label: "Lebanese Pound",
    rate: 89500,
    locale: "en-LB",
  },

  EUR: {
    code: "EUR",
    symbol: "€",
    label: "Euro",
    rate: 0.86,
    locale: "en-IE",
  },
};