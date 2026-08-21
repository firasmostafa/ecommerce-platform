import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Home,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Megaphone,
  Save,
  Settings,
  Star,
  Store,
  Truck,
} from "lucide-react";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminSettings.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

const initialStoreSettings = {
  store_name: "",
  email: "",
  phone: "",
  address: "",
  logo: null,
  logo_path: "",
  announcement_enabled: true,
  announcement_text: "Free delivery on orders over",
  free_shipping_threshold: "100",
};

const initialHomeSettings = {
  hero_title: "",
  hero_subtitle: "",
  hero_button_text: "",
  hero_button_link: "",

  categories_title: "Shop by Category",

  categories_subtitle:
    "Explore our collections and find exactly what you need.",

  featured_title: "Featured Products",

  featured_subtitle:
    "A selection of our highlighted products, chosen from across the store.",
};

function AdminSettings() {
  const { token } = useAuth();

  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);

  const [logoPreview, setLogoPreview] = useState("");

  const [homeSettings, setHomeSettings] = useState(initialHomeSettings);

  const [loading, setLoading] = useState(true);

  const [savingStore, setSavingStore] = useState(false);

  const [savingHome, setSavingHome] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ========================================
     LOAD SETTINGS
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const [storeResponse, homeResponse] = await Promise.all([
          axios.get(`${API_URL}/store-settings`),

          axios.get(`${API_URL}/home-settings`),
        ]);

        if (cancelled) {
          return;
        }

        const storeData = storeResponse.data?.data || storeResponse.data || {};

        const homeData = homeResponse.data?.data || homeResponse.data || {};

        setStoreSettings({
          store_name: storeData.store_name || storeData.name || "",

          email: storeData.email || "",

          phone: storeData.phone || "",

          address: storeData.address || "",

          logo: null,

          logo_path: storeData.logo || "",

          announcement_enabled: storeData.announcement_enabled ?? true,

          announcement_text:
            storeData.announcement_text || "Free delivery on orders over",

          free_shipping_threshold: storeData.free_shipping_threshold ?? "100",
        });

        if (storeData.logo) {
          setLogoPreview(
            `https://ecommerce-platform-4vwn.onrender.com/storage/${storeData.logo}`,
          );
        }

        setHomeSettings({
          hero_title: homeData.hero_title || "",

          hero_subtitle: homeData.hero_subtitle || "",

          hero_button_text: homeData.hero_button_text || "",

          hero_button_link: homeData.hero_button_link || "",

          categories_title: homeData.categories_title || "Shop by Category",

          categories_subtitle:
            homeData.categories_subtitle ||
            "Explore our collections and find exactly what you need.",

          featured_title: homeData.featured_title || "Featured Products",

          featured_subtitle:
            homeData.featured_subtitle ||
            "A selection of our highlighted products, chosen from across the store.",
        });

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load settings:", err);

        setError(
          err.response?.data?.message || "Unable to load store settings.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ========================================
     AUTO HIDE SUCCESS
  ======================================== */

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [success]);

  /* ========================================
     STORE CHANGE
  ======================================== */

  const handleStoreChange = (event) => {
    const { name, value, type, checked } = event.target;

    setStoreSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] || null;

    setStoreSettings((current) => ({
      ...current,
      logo: file,
    }));

    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }

    setError("");
    setSuccess("");
  };

  /* ========================================
     HOME CHANGE
  ======================================== */

  const handleHomeChange = (event) => {
    const { name, value } = event.target;

    setHomeSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================
     SAVE STORE SETTINGS
  ======================================== */

  const handleSaveStore = async (event) => {
    event.preventDefault();

    try {
      setSavingStore(true);

      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("_method", "PUT");

      formData.append("store_name", storeSettings.store_name);

      formData.append("email", storeSettings.email);

      formData.append("phone", storeSettings.phone);

      formData.append("address", storeSettings.address);

      formData.append(
        "announcement_enabled",
        storeSettings.announcement_enabled ? "1" : "0",
      );

      formData.append("announcement_text", storeSettings.announcement_text);

      formData.append(
        "free_shipping_threshold",
        storeSettings.free_shipping_threshold,
      );

      if (storeSettings.logo) {
        formData.append("logo", storeSettings.logo);
      }

      const response = await axios.post(
        `${API_URL}/admin/store-settings`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },
        },
      );

      const savedSettings = response.data?.data || {};

      setStoreSettings((current) => ({
        ...current,
        logo: null,
        logo_path: savedSettings.logo || current.logo_path,
      }));

      if (savedSettings.logo) {
        setLogoPreview(
          `https://ecommerce-platform-4vwn.onrender.com/storage/${savedSettings.logo}`,
        );
      }

      setSuccess("Store settings updated successfully.");
    } catch (err) {
      console.error("Failed to update store settings:", err);

      const errors = err.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors).flat().find(Boolean);

        setError(firstError || "Please check the store settings.");
      } else {
        setError(
          err.response?.data?.message || "Unable to update store settings.",
        );
      }
    } finally {
      setSavingStore(false);
    }
  };

  /* ========================================
     SAVE HOMEPAGE SETTINGS
  ======================================== */

  const handleSaveHome = async (event) => {
    event.preventDefault();

    try {
      setSavingHome(true);

      setError("");
      setSuccess("");

      await axios.put(`${API_URL}/admin/home-settings`, homeSettings, {
        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },
      });

      setSuccess("Homepage settings updated successfully.");
    } catch (err) {
      console.error("Failed to update homepage settings:", err);

      const errors = err.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors).flat().find(Boolean);

        setError(firstError || "Please check the homepage settings.");
      } else {
        setError(
          err.response?.data?.message || "Unable to update homepage settings.",
        );
      }
    } finally {
      setSavingHome(false);
    }
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="admin-settings-page">
        <div className="admin-settings-container">
          <div className="admin-settings-state">
            <Loader2 size={22} className="admin-settings-loader" />

            <strong>Loading settings...</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-settings-page">
      <div className="admin-settings-container">
        {/* =================================
            HEADER
        ================================= */}

        <header className="admin-settings-heading">
          <span>STORE MANAGEMENT</span>

          <h1>Settings</h1>

          <p>Manage store information and customize your homepage.</p>
        </header>

        {/* SUCCESS */}

        {success && (
          <div className="admin-settings-message admin-settings-success">
            <CheckCircle2 size={15} />

            <strong>{success}</strong>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="admin-settings-message admin-settings-error">
            {error}
          </div>
        )}

        {/* =================================
            STORE INFORMATION
        ================================= */}

        <form className="admin-settings-card" onSubmit={handleSaveStore}>
          <div className="admin-settings-card-heading">
            <span className="admin-settings-card-icon">
              <Store size={16} />
            </span>

            <div>
              <h2>Store Information</h2>

              <p>Basic information about your store.</p>
            </div>
          </div>

          <div className="admin-settings-fields">
            <label className="admin-settings-field">
              <span>Store Name</span>

              <input
                type="text"
                name="store_name"
                value={storeSettings.store_name}
                placeholder="NOVA Store"
                onChange={handleStoreChange}
              />
            </label>

            <label className="admin-settings-field">
              <span>Store Email</span>

              <input
                type="email"
                name="email"
                value={storeSettings.email}
                placeholder="store@example.com"
                onChange={handleStoreChange}
              />
            </label>

            <label className="admin-settings-field">
              <span>Phone</span>

              <input
                type="text"
                name="phone"
                value={storeSettings.phone}
                placeholder="+961 ..."
                onChange={handleStoreChange}
              />
            </label>

            <label className="admin-settings-field admin-settings-field-full">
              <span>Store Address</span>

              <input
                type="text"
                name="address"
                value={storeSettings.address}
                placeholder="Store address"
                onChange={handleStoreChange}
              />
            </label>
          </div>

          <div className="admin-settings-section-divider" />

          <div className="admin-settings-section-label">
            <ImagePlus size={13} />
            Store Branding
          </div>

          <div className="admin-settings-fields">
            <label className="admin-settings-field admin-settings-field-full">
              <span>Store Logo</span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
              />
            </label>

            {logoPreview && (
              <div className="admin-settings-field admin-settings-field-full">
                <span>Current Logo</span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    border: "1px solid #ebe8ef",
                    borderRadius: "12px",
                    background: "#faf9fd",
                  }}
                >
                  <img
                    src={logoPreview}
                    alt="Store logo preview"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain",
                      borderRadius: "10px",
                      background: "#ffffff",
                    }}
                  />

                  <small>This logo will be used across the storefront.</small>
                </div>
              </div>
            )}
          </div>

          <div className="admin-settings-section-divider" />

          <div className="admin-settings-section-label">
            <Megaphone size={13} />
            Announcement Bar
          </div>

          <div className="admin-settings-fields">
            <label className="admin-product-toggle-row">
              <div>
                <strong>Enable Announcement</strong>

                <span>Show the offer bar at the top of the storefront.</span>
              </div>

              <input
                type="checkbox"
                name="announcement_enabled"
                checked={storeSettings.announcement_enabled}
                onChange={handleStoreChange}
              />
            </label>

            <label className="admin-settings-field admin-settings-field-full">
              <span>Announcement Text</span>

              <input
                type="text"
                name="announcement_text"
                value={storeSettings.announcement_text}
                placeholder="Free delivery on orders over"
                onChange={handleStoreChange}
              />
            </label>

            <label className="admin-settings-field">
              <span>Free Delivery From ($)</span>

              <input
                type="number"
                name="free_shipping_threshold"
                value={storeSettings.free_shipping_threshold}
                min="0"
                step="0.01"
                placeholder="100"
                onChange={handleStoreChange}
              />
            </label>

            <div className="admin-settings-field">
              <span>Preview</span>

              <div
                style={{
                  minHeight: "42px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 12px",
                  border: "1px solid #ebe8ef",
                  borderRadius: "10px",
                  background: "#faf9fd",
                }}
              >
                <Truck size={14} />

                <strong
                  style={{
                    fontSize: "11px",
                  }}
                >
                  {storeSettings.announcement_text ||
                    "Free delivery on orders over"}{" "}
                  $
                  {Number(storeSettings.free_shipping_threshold || 0).toFixed(
                    2,
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="admin-settings-actions">
            <button type="submit" disabled={savingStore}>
              <Save size={13} />

              {savingStore ? "Saving..." : "Save Store Information"}
            </button>
          </div>
        </form>

        {/* =================================
            HERO SECTION
        ================================= */}

        <form className="admin-settings-card" onSubmit={handleSaveHome}>
          <div className="admin-settings-card-heading">
            <span className="admin-settings-card-icon">
              <Home size={16} />
            </span>

            <div>
              <h2>Homepage</h2>

              <p>Customize text displayed on the homepage.</p>
            </div>
          </div>

          {/* HERO */}

          <div className="admin-settings-section-label">
            <Home size={13} />
            Hero Section
          </div>

          <div className="admin-settings-fields">
            <label className="admin-settings-field admin-settings-field-full">
              <span>Hero Title</span>

              <input
                type="text"
                name="hero_title"
                value={homeSettings.hero_title}
                placeholder="Discover your next favorite product"
                onChange={handleHomeChange}
              />
            </label>

            <label className="admin-settings-field admin-settings-field-full">
              <span>Hero Subtitle</span>

              <textarea
                name="hero_subtitle"
                value={homeSettings.hero_subtitle}
                rows="3"
                placeholder="Homepage hero description..."
                onChange={handleHomeChange}
              />
            </label>

            <label className="admin-settings-field">
              <span>Button Text</span>

              <input
                type="text"
                name="hero_button_text"
                value={homeSettings.hero_button_text}
                placeholder="Shop Now"
                onChange={handleHomeChange}
              />
            </label>

            <label className="admin-settings-field">
              <span>Button Link</span>

              <input
                type="text"
                name="hero_button_link"
                value={homeSettings.hero_button_link}
                placeholder="/products"
                onChange={handleHomeChange}
              />
            </label>
          </div>

          {/* =================================
              CATEGORIES SECTION
          ================================= */}

          <div className="admin-settings-section-divider" />

          <div className="admin-settings-section-label">
            <LayoutGrid size={13} />
            Categories Section
          </div>

          <div className="admin-settings-fields">
            <label className="admin-settings-field admin-settings-field-full">
              <span>Section Title</span>

              <input
                type="text"
                name="categories_title"
                value={homeSettings.categories_title}
                placeholder="Shop by Category"
                onChange={handleHomeChange}
              />
            </label>

            <label className="admin-settings-field admin-settings-field-full">
              <span>Section Description</span>

              <textarea
                name="categories_subtitle"
                value={homeSettings.categories_subtitle}
                rows="2"
                placeholder="Explore our collections..."
                onChange={handleHomeChange}
              />
            </label>
          </div>

          {/* =================================
              FEATURED SECTION
          ================================= */}

          <div className="admin-settings-section-divider" />

          <div className="admin-settings-section-label">
            <Star size={13} />
            Featured Products Section
          </div>

          <div className="admin-settings-fields">
            <label className="admin-settings-field admin-settings-field-full">
              <span>Section Title</span>

              <input
                type="text"
                name="featured_title"
                value={homeSettings.featured_title}
                placeholder="Featured Products"
                onChange={handleHomeChange}
              />
            </label>

            <label className="admin-settings-field admin-settings-field-full">
              <span>Section Description</span>

              <textarea
                name="featured_subtitle"
                value={homeSettings.featured_subtitle}
                rows="2"
                placeholder="A selection of our highlighted products..."
                onChange={handleHomeChange}
              />
            </label>
          </div>

          {/* SAVE */}

          <div className="admin-settings-actions">
            <button type="submit" disabled={savingHome}>
              <Save size={13} />

              {savingHome ? "Saving..." : "Save Homepage Settings"}
            </button>
          </div>
        </form>

        <div className="admin-settings-note">
          <Settings size={13} />
          Homepage changes are reflected on the storefront.
        </div>
      </div>
    </main>
  );
}

export default AdminSettings;
