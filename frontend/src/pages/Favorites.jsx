import {
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import { useFavorites } from "../context/useFavorites";

import "./Favorites.css";

function Favorites() {
  const {
    favorites,
    favoritesCount,
    loading,
    clearFavorites,
  } = useFavorites();

  if (loading) {
    return (
      <main className="favorites-page">
        <div className="favorites-state">
          Loading favorites...
        </div>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      <section className="favorites-hero">
        <div className="favorites-container">
          <span>YOUR COLLECTION</span>

          <h1>Favorites</h1>

          <p>
            Save the products you love and
            return to them anytime.
          </p>
        </div>
      </section>

      <section className="favorites-content">
        <div className="favorites-container">

          <div className="favorites-toolbar">
            <div>
              <Heart size={17} />

              <strong>
                {favoritesCount}
              </strong>

              <span>
                {favoritesCount === 1
                  ? "favorite"
                  : "favorites"}
              </span>
            </div>

            {favoritesCount > 0 && (
              <button
                type="button"
                onClick={clearFavorites}
              >
                <Trash2 size={13} />
                Clear All
              </button>
            )}
          </div>

          {favoritesCount === 0 ? (
            <div className="favorites-empty">
              <span>
                <Heart size={22} />
              </span>

              <h2>No favorites yet</h2>

              <p>
                Press the heart on any product
                to save it here.
              </p>

              <Link to="/products">
                <ShoppingBag size={14} />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

export default Favorites;