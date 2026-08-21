import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../../components/ProductCard";
import { useHomeData } from "../../context/home-data-context";

import "./FeaturedPreview.css";

function FeaturedPreview() {
  const {
    featuredProducts,
    homeSettings,
    loading,
    error,
  } = useHomeData();

  const products = Array.isArray(featuredProducts)
    ? featuredProducts
    : [];

  const sectionSettings = {
    title:
      homeSettings?.featured_title ||
      "Featured Products",

    subtitle:
      homeSettings?.featured_subtitle ||
      "A selection of our highlighted products, chosen from across the store.",
  };

  return (
    <section className="featured-preview">
      <div className="featured-preview-container">
        {/* =================================
            HEADING
        ================================= */}

        <div className="featured-preview-heading">
          <div>
            <span className="featured-preview-eyebrow">
              HANDPICKED FOR YOU
            </span>

            <h2>{sectionSettings.title}</h2>

            <p>{sectionSettings.subtitle}</p>
          </div>

          <Link
            to="/featured"
            className="featured-preview-link"
          >
            View All Featured
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading && (
          <div className="featured-preview-state">
            <span className="featured-preview-spinner" />

            <p>Loading featured products...</p>
          </div>
        )}

        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (
          <div className="featured-preview-state">
            <strong>Something went wrong</strong>

            <p>{error}</p>
          </div>
        )}

        {/* =================================
            PRODUCTS
        ================================= */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="featured-preview-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

        {/* =================================
            EMPTY
        ================================= */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="featured-preview-state">
              <p>
                No featured products are available yet.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

export default FeaturedPreview;