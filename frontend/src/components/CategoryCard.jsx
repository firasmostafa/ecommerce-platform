import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import "./CategoryCard.css";

function CategoryCard({ category }) {
const imageUrl = category.image
  ? category.image.startsWith("http")
    ? `${category.image}?tr=w-700,q-80`
    : `https://ecommerce-platform-4vwn.onrender.com/storage/${category.image}`
  : null;

  return (
    <Link to={`/products?category=${category.slug}`} className="category-card">
      <div className="category-card-image">
        {imageUrl ? (
        <img
  src={imageUrl}
  alt={category.name}
  loading="lazy"
  decoding="async"
/>
        ) : (
          <div className="category-card-placeholder">
            {category.name.charAt(0)}
          </div>
        )}

        <div className="category-card-overlay" />
      </div>

      <div className="category-card-content">
        <div>
          <span className="category-card-label">Collection</span>

          <h3>{category.name}</h3>

          <p>{category.products_count ?? 0} products</p>
        </div>

        <span className="category-card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>
    </Link>
  );
}

export default CategoryCard;
