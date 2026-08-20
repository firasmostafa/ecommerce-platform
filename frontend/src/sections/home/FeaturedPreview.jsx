import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

import ProductCard from "../../components/ProductCard";
import "./FeaturedPreview.css";

const API_URL = "http://127.0.0.1:8000/api";

function FeaturedPreview() {
  const [products, setProducts] = useState([]);

  const [sectionSettings, setSectionSettings] =
    useState({
      title: "Featured Products",
      subtitle:
        "A selection of our highlighted products, chosen from across the store.",
    });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchFeaturedData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          settingsResponse,
        ] = await Promise.all([
          axios.get(
            `${API_URL}/products?featured=1&per_page=50`
          ),

          axios.get(
            `${API_URL}/home-settings`
          ),
        ]);

        if (cancelled) {
          return;
        }

        /* =================================
           FEATURED PRODUCTS
        ================================= */

        const productsData =
          productsResponse.data?.data?.data ||
          productsResponse.data?.data ||
          [];

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        /* =================================
           HOMEPAGE SETTINGS
        ================================= */

        const settings =
          settingsResponse.data?.data ||
          settingsResponse.data ||
          {};

        setSectionSettings({
          title:
            settings.featured_title ||
            "Featured Products",

          subtitle:
            settings.featured_subtitle ||
            "A selection of our highlighted products, chosen from across the store.",
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load featured products:",
          err
        );

        setError(
          "We could not load featured products right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedData();

    return () => {
      cancelled = true;
    };
  }, []);

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

            <h2>
              {sectionSettings.title}
            </h2>

            <p>
              {sectionSettings.subtitle}
            </p>
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

            <p>
              Loading featured products...
            </p>
          </div>
        )}

        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (
          <div className="featured-preview-state">
            <strong>
              Something went wrong
            </strong>

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
                No featured products are
                available yet.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

export default FeaturedPreview;