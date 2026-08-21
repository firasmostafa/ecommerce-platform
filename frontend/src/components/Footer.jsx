import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import "./Footer.css";

const API_URL =
  "https://ecommerce-platform-4vwn.onrender.com/api";

const STORAGE_URL =
  "https://ecommerce-platform-4vwn.onrender.com/storage";

const defaultSettings = {
  store_name: "NOVA",
  store_description:
    "Modern products, simple shopping, and reliable service.",
  logo: "",
  email: "frasm688@gmail.com",
  phone: "+961 79 360 988",
  address: "Lebanon",
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
};

function Footer() {
  const [storeSettings, setStoreSettings] =
    useState(defaultSettings);

  useEffect(() => {
    let cancelled = false;

    const loadStoreSettings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/store-settings`,
        );

        if (cancelled) return;

        const data =
          response.data?.data ||
          response.data ||
          {};

        setStoreSettings({
          store_name:
            data.store_name ||
            defaultSettings.store_name,

          store_description:
            data.store_description ||
            defaultSettings.store_description,

          logo: data.logo || "",

          email:
            data.email ||
            defaultSettings.email,

          phone:
            data.phone ||
            defaultSettings.phone,

          address:
            data.address ||
            defaultSettings.address,

          facebook_url:
            data.facebook_url || "",

          instagram_url:
            data.instagram_url || "",

          twitter_url:
            data.twitter_url ||
            data.x_url ||
            "",
        });
      } catch (error) {
        console.error(
          "Failed to load footer settings:",
          error,
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

  const storeInitial =
    storeName.trim().charAt(0).toUpperCase() || "N";

  const logoUrl = storeSettings.logo
    ? storeSettings.logo.startsWith("http")
      ? storeSettings.logo
      : `${STORAGE_URL}/${storeSettings.logo}`
    : "";

  const phoneLink =
    storeSettings.phone
      ?.replace(/\s+/g, "")
      .replace(/[()-]/g, "") || "";

  const mapLink =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      storeSettings.address || "Lebanon",
    );

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* BRAND */}

        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                className="footer-logo-image"
              />
            ) : (
              <span className="footer-logo-icon">
                {storeInitial}
              </span>
            )}

            <div className="footer-logo-text">
              <strong>{storeName}</strong>
              <small>STORE</small>
            </div>
          </Link>

          <p className="footer-description">
            {storeSettings.store_description}
          </p>

          <div className="footer-socials">
            {storeSettings.facebook_url && (
              <a
                href={storeSettings.facebook_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <span>f</span>
              </a>
            )}

            {storeSettings.instagram_url && (
              <a
                href={storeSettings.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <span>◎</span>
              </a>
            )}

            {storeSettings.twitter_url && (
              <a
                href={storeSettings.twitter_url}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <span>X</span>
              </a>
            )}
          </div>
        </div>

        {/* SHOP */}

        <div className="footer-column footer-shop">
          <div className="footer-column-title">
            <ShoppingBag size={17} />
            <h3>Shop</h3>
          </div>

          <Link to="/products">
            All Products
          </Link>

          <Link to="/categories">
            Categories
          </Link>

          <Link to="/featured">
            Featured
          </Link>

          <Link to="/sale">
            Sale
          </Link>
        </div>

        {/* INFORMATION */}

        <div className="footer-column footer-information">
          <div className="footer-column-title">
            <Info size={17} />
            <h3>Information</h3>
          </div>

          <Link to="/about">
            About Us
          </Link>

          <Link to="/contact">
            Contact
          </Link>

          <Link to="/my-orders">
            My Orders
          </Link>

          <Link to="/cart">
            Cart
          </Link>
        </div>

        {/* CONTACT */}

        <div className="footer-contact-row">
          <div className="footer-contact-title">
            <Phone size={17} />
            <h3>Contact</h3>
          </div>

          <div className="footer-contact-items">
            <a
              href={`mailto:${storeSettings.email}`}
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <Mail size={15} />
              </span>

              <span>
                {storeSettings.email}
              </span>
            </a>

            <span className="footer-contact-divider" />

            <a
              href={`tel:${phoneLink}`}
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <Phone size={15} />
              </span>

              <span>
                {storeSettings.phone}
              </span>
            </a>

            <span className="footer-contact-divider" />

            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <MapPin size={15} />
              </span>

              <span>
                {storeSettings.address}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM */}

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © {year}{" "}
            <strong>{storeName}</strong>.
            All rights reserved.
          </p>

          <div className="footer-bottom-badge">
            <ShieldCheck size={15} />
            <span>Secure Shopping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;