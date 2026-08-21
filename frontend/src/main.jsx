import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import CurrencyProvider from "./context/CurrencyProvider.jsx";

import "./index.css";
import { FavoritesProvider } from "./context/FavoritesProvider.jsx";
import HomeDataProvider from "./context/HomeDataProvider";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
           <FavoritesProvider>
             <HomeDataProvider>
          <App />
          </HomeDataProvider>
          </FavoritesProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  </StrictMode>
);