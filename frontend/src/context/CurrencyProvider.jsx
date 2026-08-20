import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  CURRENCIES,
  CurrencyContext,
} from "./currency-context";

function getInitialCurrency() {
  const savedCurrency =
    localStorage.getItem("nova_currency");

  if (
    savedCurrency &&
    CURRENCIES[savedCurrency]
  ) {
    return savedCurrency;
  }

  return "USD";
}

function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] =
    useState(getInitialCurrency);

  const setCurrency = useCallback((currencyCode) => {
    if (!CURRENCIES[currencyCode]) {
      return;
    }

    setCurrencyState(currencyCode);

    localStorage.setItem(
      "nova_currency",
      currencyCode
    );
  }, []);

  const convertPrice = useCallback(
    (usdPrice) => {
      const price =
        Number(usdPrice || 0);

      const selectedCurrency =
        CURRENCIES[currency];

      return (
        price *
        selectedCurrency.rate
      );
    },
    [currency]
  );

  const formatPrice = useCallback(
    (usdPrice) => {
      const value =
        convertPrice(usdPrice);

      if (currency === "LBP") {
        return `${Math.round(
          value
        ).toLocaleString(
          "en-US"
        )} L.L.`;
      }

      return new Intl.NumberFormat(
        CURRENCIES[currency].locale,
        {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(value);
    },
    [
      currency,
      convertPrice,
    ]
  );

  const value = useMemo(
    () => ({
      currency,
      currencies: CURRENCIES,
      setCurrency,
      convertPrice,
      formatPrice,
    }),
    [
      currency,
      setCurrency,
      convertPrice,
      formatPrice,
    ]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default CurrencyProvider;