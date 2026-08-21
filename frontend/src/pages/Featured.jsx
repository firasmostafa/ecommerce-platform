import { useEffect, useState } from "react";
import axios from "axios";

import ProductCard from "../components/ProductCard";
import "./Featured.css";

function Featured() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "https://ecommerce-platform-4vwn.onrender.com/api/products?featured=1&per_page=48",
        );

        setProducts(response.data.data?.data || []);
      } catch (err) {
        console.error("Failed to load featured products:", err);
        setError("Unable to load featured products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="featured-page">
      <section className="featured-page-hero">
        <div className="featured-page-container">
          <span>CURATED COLLECTION</span>
          <h1>Featured Products</h1>
          <p>Handpicked products selected from across the store.</p>
        </div>
      </section>

      <section className="featured-page-content">
        <div className="featured-page-container">
          {loading && (
            <div className="featured-page-state">
              <div className="featured-page-spinner" />
              <p>Loading featured products...</p>
            </div>
          )}

          {!loading && error && (
            <div className="featured-page-state">
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="featured-page-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Featured;
