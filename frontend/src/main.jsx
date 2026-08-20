import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import CurrencyProvider from "./context/CurrencyProvider.jsx";

import "./index.css";
import { FavoritesProvider } from "./context/FavoritesProvider.jsx";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
           <FavoritesProvider>
          <App />
          </FavoritesProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  </StrictMode>
);