import { useEffect, useState } from "react";

import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Heart,

  LogIn,
  LogOut,
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { useCart } from "../context/cart-context";
import { useAuth } from "../context/auth-context";
import { useCurrency } from "../context/useCurrency";
import { useFavorites } from "../context/useFavorites";

import axios from "axios";

import "./Navbar.css";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

const defaultStoreSettings = {
  store_name: "NOVA",
  logo: "",
  announcement_enabled: true,
  announcement_text: "Free shipping on orders over",
  free_shipping_threshold: 100,
};

function Navbar() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    currencyOpen,
    setCurrencyOpen,
  ] = useState(false);

  const [
    storeSettings,
    setStoreSettings,
  ] = useState(defaultStoreSettings);

  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const {
    currency,
    currencies,
    setCurrency,
    formatPrice,
  } = useCurrency();

  useEffect(() => {
    let cancelled = false;

    const loadStoreSettings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/store-settings`
        );

        if (cancelled) {
          return;
        }

        const data =
          response.data?.data ||
          response.data ||
          {};

        setStoreSettings({
          store_name:
            data.store_name ||
            data.name ||
            "NOVA",

          logo:
            data.logo || "",

          announcement_enabled:
            data.announcement_enabled ??
            true,

          announcement_text:
            data.announcement_text ||
            "Free shipping on orders over",

          free_shipping_threshold:
            Number(
              data.free_shipping_threshold ??
              100
            ),
        });
      } catch (error) {
        console.error(
          "Failed to load store settings:",
          error
        );
      }
    };

    loadStoreSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const storeName =
    storeSettings.store_name || "NOVA";

  const storeLogoUrl =
    storeSettings.logo
      ? `${STORAGE_URL}/${storeSettings.logo}`
      : "";

  const storeInitial =
    storeName.trim().charAt(0).toUpperCase() ||
    "N";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const closeCurrencyMenu = () => {
    setCurrencyOpen(false);
  };

  const handleCurrencyChange = (
    currencyCode
  ) => {
    setCurrency(currencyCode);

    closeCurrencyMenu();
  };

  const handleMobileCurrencyChange = (
    event
  ) => {
    setCurrency(
      event.target.value
    );
  };

  const handleLogout = async () => {
    closeMobileMenu();

    await logout();
  };

  return (
    <>
      {/* ===============================
          ANNOUNCEMENT
      =============================== */}

      {storeSettings.announcement_enabled && (
        <div className="announcement-bar">
          <div className="announcement-content">
            <span>
              <Sparkles size={15} />
              Special offer
            </span>

            <p>
              {storeSettings.announcement_text}{" "}
              <strong>
                {formatPrice(
                  storeSettings.free_shipping_threshold
                )}
              </strong>
            </p>

            <Link to="/sale">
              Shop offers →
            </Link>
          </div>
        </div>
      )}

      {/* ===============================
          NAVBAR
      =============================== */}

      <header className="navbar">
        <div className="navbar-container">

          {/* ===============================
              MOBILE LEFT ACTIONS
          =============================== */}

          <div className="mobile-header-actions">
            <Link
              to="/cart"
              className="mobile-header-action mobile-header-cart"
              aria-label="Shopping cart"
              onClick={closeMobileMenu}
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="mobile-header-count">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/favorites"
              className="mobile-header-action mobile-header-favorites"
              aria-label="Favorites"
              onClick={closeMobileMenu}
            >
              <Heart size={20} />

              {favoritesCount > 0 && (
                <span className="mobile-header-count">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="mobile-header-action mobile-header-search"
              aria-label="Search"
              onClick={() =>
                setSearchOpen(
                  (current) => !current
                )
              }
            >
              <Search size={21} />
            </button>
          </div>

          {/* LOGO */}

          <Link
            to="/"
            className="navbar-logo"
            onClick={closeMobileMenu}
          >
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={`${storeName} logo`}
                className="navbar-logo-image"
              />
            ) : (
              <span className="logo-icon">
                {storeInitial}
              </span>
            )}

            <span className="logo-text">
              {storeName}

              <small>
                STORE
              </small>
            </span>
          </Link>

          {/* DESKTOP CART BESIDE LOGO */}

          <Link
            to="/cart"
            className="desktop-logo-cart"
            aria-label="Shopping cart"
          >
            <span className="desktop-logo-cart-icon">
              <ShoppingCart size={21} />
            </span>

            <span className="desktop-logo-cart-text">
              <small>Shopping</small>
              <strong>Cart</strong>
            </span>

            {cartCount > 0 && (
              <span className="desktop-logo-cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE ACCOUNT */}

          {isAuthenticated ? (
            <Link
              to="/my-orders"
              className="mobile-header-account"
              aria-label="My Orders"
              title="My Orders"
              onClick={closeMobileMenu}
            >
              <PackageSearch size={20} />
            </Link>
          ) : (
            <Link
              to="/login"
              className="mobile-header-account"
              aria-label="Sign in"
              onClick={closeMobileMenu}
            >
              <UserRound size={20} />
            </Link>
          )}

          {/* MOBILE CURRENCY */}

          <div className="mobile-header-currency">
            <select
              value={currency}
              onChange={handleMobileCurrencyChange}
              aria-label="Select currency"
            >
              {Object.values(currencies).map(
                (currencyItem) => (
                  <option
                    key={currencyItem.code}
                    value={currencyItem.code}
                  >
                    {currencyItem.code}
                  </option>
                )
              )}
            </select>

            <ChevronDown size={11} />
          </div>

          {/* MOBILE MENU */}

          <button
            type="button"
            className={`mobile-header-menu-button ${
              mobileMenuOpen
                ? "mobile-header-menu-button-active"
                : ""
            }`}
            aria-label={
              mobileMenuOpen
                ? "Close menu"
                : "Open menu"
            }
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current
              )
            }
          >
            <Menu size={23} />
          </button>

          {/* ===============================
              DESKTOP NAVIGATION
          =============================== */}

          <nav className="desktop-navigation">
            <NavLink to="/">
              Home
            </NavLink>

            <NavLink to="/products">
              Shop
            </NavLink>

            <NavLink to="/categories">
              Categories
            </NavLink>

            <NavLink to="/featured">
              Featured
            </NavLink>

            <NavLink
              to="/sale"
              className="sale-link"
            >
              Sale
            </NavLink>

            <NavLink to="/about">
              About
            </NavLink>

            <NavLink to="/contact">
              Contact
            </NavLink>

            <NavLink
              to="/favorites"
              className="desktop-favorites-link"
            >
              Favorites
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/my-orders"
                className="desktop-orders-link"
              >
                My Orders
              </NavLink>
            )}
          </nav>

          {/* ===============================
              ACTIONS
          =============================== */}

          <div className="navbar-actions">

            {/* ===============================
                DESKTOP CURRENCY
            =============================== */}

            <div className="navbar-currency">
              <button
                type="button"
                className={`navbar-currency-button ${
                  currencyOpen
                    ? "navbar-currency-button-open"
                    : ""
                }`}
                aria-label="Select currency"
                aria-expanded={currencyOpen}
                onClick={() =>
                  setCurrencyOpen(
                    (current) =>
                      !current
                  )
                }
              >
                <CircleDollarSign
                  size={16}
                />

                <span>
                  {currency}
                </span>

                <ChevronDown
                  size={13}
                />
              </button>

              {currencyOpen && (
                <div className="navbar-currency-menu">

                  {Object.values(
                    currencies
                  ).map(
                    (
                      currencyItem
                    ) => (
                      <button
                        type="button"
                        key={
                          currencyItem.code
                        }
                        className={
                          currency ===
                          currencyItem.code
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          handleCurrencyChange(
                            currencyItem.code
                          )
                        }
                      >
                        <span className="navbar-currency-symbol">
                          {
                            currencyItem.symbol
                          }
                        </span>

                        <span className="navbar-currency-info">
                          <strong>
                            {
                              currencyItem.code
                            }
                          </strong>

                          <small>
                            {
                              currencyItem.label
                            }
                          </small>
                        </span>

                        {currency ===
                          currencyItem.code && (
                          <span className="navbar-currency-check">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  )}

                </div>
              )}
            </div>

            {/* SEARCH */}

            <button
              type="button"
              className="navbar-action-button search-button"
              aria-label="Search"
              onClick={() =>
                setSearchOpen(
                  (current) =>
                    !current
                )
              }
            >
              <Search size={21} />
            </button>

            {/* ACCOUNT DESKTOP */}

            {isAuthenticated ? (
              <div className="navbar-user-area">

                <Link
                  to="/my-orders"
                  className="navbar-action-button account-button"
                  aria-label="My account"
                >
                  <UserRound
                    size={21}
                  />

                  <span className="account-text">
                    <small>
                      Welcome
                    </small>

                    <strong>
                      {user?.name ||
                        "Account"}
                    </strong>
                  </span>
                </Link>

                <button
                  type="button"
                  className="navbar-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="navbar-action-button account-button"
              >
                <UserRound
                  size={21}
                />

                <span className="account-text">
                  <small>
                    Welcome
                  </small>

                  <strong>
                    Sign In
                  </strong>
                </span>
              </Link>
            )}

          </div>
        </div>

        {/* ===============================
            SEARCH
        =============================== */}

        <div
          className={`navbar-search ${
            searchOpen
              ? "navbar-search-open"
              : ""
          }`}
        >
          <div className="navbar-search-inner">
            <Search size={20} />

            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
            />

            <button
              type="button"
              onClick={() =>
                setSearchOpen(false)
              }
              aria-label="Close search"
            >
              <X size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* ===============================
          MOBILE OVERLAY
      =============================== */}

      <button
        type="button"
        className={`mobile-menu-overlay ${
          mobileMenuOpen
            ? "mobile-menu-overlay-open"
            : ""
        }`}
        aria-label="Close mobile menu"
        onClick={closeMobileMenu}
      />

      {/* ===============================
          MOBILE DRAWER
      =============================== */}

      <aside
        className={`mobile-navigation ${
          mobileMenuOpen
            ? "mobile-navigation-open"
            : ""
        }`}
      >

        {/* DRAWER HEADER */}

        <div className="mobile-navigation-header">
          <Link
            to="/"
            className="mobile-navigation-brand"
            onClick={closeMobileMenu}
          >
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={`${storeName} logo`}
                className="mobile-navigation-logo-image"
              />
            ) : (
              <span className="mobile-navigation-logo">
                {storeInitial}
              </span>
            )}

            <div>
              <strong>
                {storeName}
              </strong>

              <small>
                STORE
              </small>
            </div>
          </Link>

          <button
            type="button"
            className="mobile-navigation-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ACCOUNT */}

        {isAuthenticated ? (
          <div className="mobile-user-card">

            <div className="mobile-user-icon">
              <UserRound
                size={17}
              />
            </div>

            <div>
              <span>
                Welcome
              </span>

              <strong>
                {user?.name ||
                  "Account"}
              </strong>
            </div>

          </div>
        ) : (
          <Link
            to="/login"
            className="mobile-signin-card"
            onClick={closeMobileMenu}
          >
            <div className="mobile-user-icon">
              <LogIn
                size={17}
              />
            </div>

            <div>
              <span>
                Welcome
              </span>

              <strong>
                Sign In
              </strong>
            </div>

            <ChevronRight
              size={16}
            />
          </Link>
        )}

        {/* ===============================
            MOBILE CURRENCY
        =============================== */}

        <div className="mobile-currency-section">

          <div className="mobile-currency-heading">
            <span>
              CURRENCY
            </span>

            <strong>
              {currency}
            </strong>
          </div>

          <div className="mobile-currency-select-wrapper">

            <CircleDollarSign
              size={15}
            />

            <select
              value={currency}
              onChange={
                handleMobileCurrencyChange
              }
              aria-label="Select currency"
            >
              {Object.values(
                currencies
              ).map(
                (
                  currencyItem
                ) => (
                  <option
                    key={
                      currencyItem.code
                    }
                    value={
                      currencyItem.code
                    }
                  >
                    {
                      currencyItem.code
                    }{" "}
                    —{" "}
                    {
                      currencyItem.label
                    }
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={13}
            />

          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="mobile-navigation-links">

          <span className="mobile-menu-section-title">
            SHOP
          </span>

          <NavLink
            to="/products"
            onClick={closeMobileMenu}
          >
            <span>
              Shop
            </span>

            <ChevronRight
              size={15}
            />
          </NavLink>

          <NavLink
            to="/categories"
            onClick={closeMobileMenu}
          >
            <span>
              Categories
            </span>

            <ChevronRight
              size={15}
            />
          </NavLink>

          <NavLink
            to="/featured"
            onClick={closeMobileMenu}
          >
            <span>
              Featured
            </span>

            <ChevronRight
              size={15}
            />
          </NavLink>

          <NavLink
            to="/sale"
            className="mobile-sale-link"
            onClick={closeMobileMenu}
          >
            <span>
              Sale
            </span>

            <ChevronRight
              size={15}
            />
          </NavLink>

          {isAuthenticated && (
            <>
              <span className="mobile-menu-section-title mobile-menu-section-space">
                ACCOUNT
              </span>

              <NavLink
                to="/my-orders"
                onClick={
                  closeMobileMenu
                }
              >
                <span>
                  My Orders
                </span>

                <ChevronRight
                  size={15}
                />
              </NavLink>
            </>
          )}

          <span className="mobile-menu-section-title mobile-menu-section-space">
            INFORMATION
          </span>

          <NavLink
            to="/about"
            onClick={closeMobileMenu}
          >
            <span>
              About
            </span>

            <ChevronRight
              size={15}
            />
          </NavLink>

          <NavLink
            to="/contact"
            onClick={closeMobileMenu}
          >
            <span>
              Contact
            </span>

            <ChevronRight
              size={15}
            />
          </NavLink>

        </nav>

        {/* DRAWER BOTTOM */}

        <div className="mobile-navigation-bottom">

          <Link
            to="/cart"
            className="mobile-drawer-cart"
            onClick={closeMobileMenu}
          >
            <ShoppingBag
              size={16}
            />

            <span>
              Shopping Cart
            </span>

            {cartCount > 0 && (
              <strong>
                {cartCount}
              </strong>
            )}
          </Link>

          {isAuthenticated && (
            <button
              type="button"
              className="mobile-logout-button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} />

              <span>Logout</span>
            </button>
          )}

        </div>
      </aside>
    </>
  );
}

export default Navbar;