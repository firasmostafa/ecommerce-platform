import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import axios from "axios";

import CategoryCard from "../../components/CategoryCard";

import "./CategoriesPreview.css";

const API_URL =
  "http://127.0.0.1:8000/api";

function CategoriesPreview() {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    sectionSettings,
    setSectionSettings,
  ] = useState({
    title: "Explore Categories",

    subtitle:
      "Find products by category and discover collections made for your lifestyle.",
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* ========================================
     LOAD CATEGORIES + HOMEPAGE SETTINGS
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          categoriesResponse,
          settingsResponse,
        ] = await Promise.all([
          axios.get(
            `${API_URL}/categories`
          ),

          axios.get(
            `${API_URL}/home-settings`
          ),
        ]);

        if (cancelled) {
          return;
        }

        /* ================================
           CATEGORIES
        ================================= */

        const categoriesData =
          categoriesResponse.data?.data ||
          [];

        const allCategories =
          Array.isArray(
            categoriesData
          )
            ? categoriesData
            : categoriesData.data ||
              [];

        setCategories(
          allCategories.slice(0, 4)
        );

        /* ================================
           HOMEPAGE SETTINGS
        ================================= */

        const settings =
          settingsResponse.data?.data ||
          settingsResponse.data ||
          {};

        setSectionSettings({
          title:
            settings.categories_title ||
            "Explore Categories",

          subtitle:
            settings.categories_subtitle ||
            "Find products by category and discover collections made for your lifestyle.",
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load categories preview:",
          err
        );

        setError(
          "We could not load the categories right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="categories-preview">
      <div className="categories-preview-container">

        {/* =================================
            HEADING
        ================================= */}

        <div className="preview-heading">
          <div>
            <span className="preview-eyebrow">
              DISCOVER YOUR STYLE
            </span>

            <h2>
              {sectionSettings.title}
            </h2>

            <p>
              {sectionSettings.subtitle}
            </p>
          </div>

          <Link
            to="/categories"
            className="preview-view-all"
          >
            View All Categories

            <ArrowRight size={17} />
          </Link>
        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading && (
          <div className="preview-state">
            <span className="preview-spinner" />

            <p>
              Loading categories...
            </p>
          </div>
        )}

        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (
          <div className="preview-state preview-error">
            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>
          </div>
        )}

        {/* =================================
            CATEGORIES
        ================================= */}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <div className="categories-preview-grid">
              {categories.map(
                (category) => (
                  <CategoryCard
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                  />
                )
              )}
            </div>
          )}

        {/* =================================
            EMPTY
        ================================= */}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className="preview-state">
              <p>
                No categories are
                available yet.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

export default CategoriesPreview;