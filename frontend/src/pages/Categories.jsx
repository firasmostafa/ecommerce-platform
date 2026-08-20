import { useEffect, useState } from "react";
import axios from "axios";

import CategoryCard from "../components/CategoryCard";
import "./Categories.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/categories"
        );

        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Unable to load categories right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="categories-page">
      <section className="categories-page-hero">
        <div className="categories-page-container">
          <span>SHOP YOUR WAY</span>
          <h1>Explore All Categories</h1>
          <p>
            Discover collections across technology, fashion, beauty,
            home, sports and more.
          </p>
        </div>
      </section>

      <section className="categories-page-content">
        <div className="categories-page-container">
          {loading && (
            <div className="page-state">
              <div className="page-spinner" />
              <p>Loading categories...</p>
            </div>
          )}

          {!loading && error && (
            <div className="page-state">
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="categories-page-grid">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="page-state">
              <p>No categories are available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Categories;