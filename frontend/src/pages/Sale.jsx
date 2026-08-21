import { useEffect, useState } from "react";
import axios from "axios";

import ProductCard from "../components/ProductCard";
import "./Sale.css";

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await axios.get(
          "https://ecommerce-platform-4vwn.onrender.com/api/products?on_sale=1&per_page=48",
        );

        setProducts(response.data.data?.data || []);
      } catch (err) {
        console.error("Failed to load sale products:", err);
        setError("Unable to load sale products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  return (
    <div className="sale-page">
      <section className="sale-hero">
        <div className="sale-container">
          <span>LIMITED TIME</span>
          <h1>Hot Deals & Special Offers</h1>
          <p>Discover selected products at special prices while stock lasts.</p>
        </div>
      </section>

      <section className="sale-content">
        <div className="sale-container">
          {loading && (
            <div className="sale-state">
              <div className="sale-spinner" />
              <p>Loading offers...</p>
            </div>
          )}

          {!loading && error && (
            <div className="sale-state">
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="sale-grid">
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

export default Sale;
