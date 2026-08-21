import { useMemo, useState } from "react";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/cart-context";
import { useCurrency } from "../context/useCurrency";
import { useFavorites } from "../context/useFavorites";
import { useAuth } from "../context/auth-context";

import "./ProductCard.css";

function ProductCard({ product }) {
  const { cartItems, addToCart } = useCart();

  const { formatPrice } = useCurrency();

  const { toggleFavorite, isFavorite } = useFavorites();

  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [justAdded, setJustAdded] = useState(false);

  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const favorite = isFavorite(product.id);

 const primaryImage =
  product.images?.find((image) => image.is_primary) || product.images?.[0];

  const imageUrl = primaryImage?.image
  ? primaryImage.image.startsWith("http")
    ? `${primaryImage.image}?tr=w-500,q-80`
    : `https://ecommerce-platform-4vwn.onrender.com/storage/${primaryImage.image}`
  : null;
  
  const price = Number(product.price || 0);

  const salePrice = product.sale_price ? Number(product.sale_price) : null;

  const hasSale = salePrice !== null && salePrice > 0 && salePrice < price;

  const discountPercentage = hasSale
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const finalPrice = hasSale ? salePrice : price;

  const quantityInCart = useMemo(() => {
    const cartItem = cartItems.find((item) => item.id === product.id);

    return cartItem?.quantity || 0;
  }, [cartItems, product.id]);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      return;
    }

    addToCart(product, 1);

    setJustAdded(true);

    window.setTimeout(() => {
      setJustAdded(false);
    }, 1600);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    try {
      setFavoriteLoading(true);

      await toggleFavorite(product);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-card-image-wrapper">
        <Link
          to={`/products/${product.slug}`}
          className="product-card-image-link"
        >
          {imageUrl ? (
           <img
  src={imageUrl}
  alt={product.name}
  className="product-card-image"
  loading="lazy"
  decoding="async"
/>
          ) : (
            <div className="product-card-placeholder">
              {product.name?.charAt(0) || "N"}
            </div>
          )}
        </Link>

        <div className="product-card-badges">
          {hasSale && (
            <span className="product-sale-badge">-{discountPercentage}%</span>
          )}

          {product.is_featured && (
            <span className="product-featured-badge">Featured</span>
          )}
        </div>

        <button
          type="button"
          className={`product-wishlist-button ${
            favorite ? "product-wishlist-button-active" : ""
          }`}
          aria-label={
            favorite
              ? `Remove ${product.name} from favorites`
              : `Add ${product.name} to favorites`
          }
          aria-pressed={favorite}
          disabled={favoriteLoading}
          onClick={handleFavorite}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          className={`product-quick-cart ${
            justAdded ? "product-quick-cart-added" : ""
          }`}
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          {justAdded ? (
            <>
              <Check size={17} />

              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag size={17} />

              <span>{product.stock > 0 ? "Add to cart" : "Sold out"}</span>
            </>
          )}
        </button>
      </div>

      <div className="product-card-body">
        <div className="product-card-top">
          <span className="product-card-category">
            {product.category?.name || "Nova Collection"}
          </span>

          <div className="product-card-rating">
            <Star size={13} fill="currentColor" />

            <span>4.8</span>
          </div>
        </div>

        <Link to={`/products/${product.slug}`} className="product-card-title">
          {product.name}
        </Link>

        <p className="product-card-description">
          {product.short_description ||
            "Discover this product from our latest collection."}
        </p>

        {quantityInCart > 0 && (
          <div className="product-cart-status">
            <span className="product-cart-status-icon">
              <Check size={13} />
            </span>

            <span>
              In your cart:
              <strong> {quantityInCart}</strong>
            </span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-card-price">
            <strong>{formatPrice(finalPrice)}</strong>

            {hasSale && <span>{formatPrice(price)}</span>}
          </div>

          <span
            className={`product-stock ${
              product.stock > 0 ? "product-in-stock" : "product-out-stock"
            }`}
          >
            {product.stock > 0 ? "In stock" : "Sold out"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
