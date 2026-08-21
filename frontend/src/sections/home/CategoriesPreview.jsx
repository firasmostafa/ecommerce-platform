import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import CategoryCard from "../../components/CategoryCard";
import { useHomeData } from "../../context/home-data-context";

import "./CategoriesPreview.css";

function CategoriesPreview() {
  const {
    categories,
    homeSettings,
    loading,
    error,
  } = useHomeData();

  const visibleCategories = Array.isArray(categories)
    ? categories.slice(0, 4)
    : [];

  const sectionSettings = {
    title:
      homeSettings?.categories_title ||
      "Explore Categories",

    subtitle:
      homeSettings?.categories_subtitle ||
      "Find products by category and discover collections made for your lifestyle.",
  };

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

            <h2>{sectionSettings.title}</h2>

            <p>{sectionSettings.subtitle}</p>
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

            <p>Loading categories...</p>
          </div>
        )}

        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (
          <div className="preview-state preview-error">
            <strong>Something went wrong</strong>

            <p>{error}</p>
          </div>
        )}

        {/* =================================
            CATEGORIES
        ================================= */}

        {!loading &&
          !error &&
          visibleCategories.length > 0 && (
            <div className="categories-preview-grid">
              {visibleCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          )}

        {/* =================================
            EMPTY
        ================================= */}

        {!loading &&
          !error &&
          visibleCategories.length === 0 && (
            <div className="preview-state">
              <p>
                No categories are available yet.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

export default CategoriesPreview;