import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./HeroSection.css";

function HeroSection() {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(
          "https://ecommerce-platform-4vwn.onrender.com/api/products?featured=1&per_page=6",
        );

        const featuredProducts = response.data.data?.data || [];

        setProducts(featuredProducts);
      } catch (error) {
        console.error("Failed to load hero products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (products.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((current) =>
        current === products.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  const nextProduct = () => {
    if (products.length === 0) return;

    setCurrentIndex((current) =>
      current === products.length - 1 ? 0 : current + 1,
    );
  };

  const previousProduct = () => {
    if (products.length === 0) return;

    setCurrentIndex((current) =>
      current === 0 ? products.length - 1 : current - 1,
    );
  };

  const currentProduct = products[currentIndex] || null;

  const primaryImage =
    currentProduct?.images?.find((image) => image.is_primary) ||
    currentProduct?.images?.[0];

  const imageUrl = primaryImage?.image
    ? `https://ecommerce-platform-4vwn.onrender.com/storage/${primaryImage.image}`
    : null;

  const originalPrice = Number(currentProduct?.price || 0);

  const salePrice = currentProduct?.sale_price
    ? Number(currentProduct.sale_price)
    : null;

  const hasSale =
    salePrice !== null && salePrice > 0 && salePrice < originalPrice;

  const finalPrice = hasSale ? salePrice : originalPrice;

  const discountPercentage =
    hasSale && originalPrice > 0
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0;

  return (
    <section className="nova-hero">
      <div className="nova-hero-glow nova-hero-glow-left" />
      <div className="nova-hero-glow nova-hero-glow-right" />

      <div className="nova-hero-container">
        <div className="nova-hero-content">
          <div className="nova-hero-badge">
            <Zap size={15} />
            <span>NEW SEASON • NEW ENERGY</span>
          </div>

          <h1>
            Discover products that <span>match your lifestyle.</span>
          </h1>

          <p className="nova-hero-description">
            Explore trending technology, fashion, beauty, home essentials and
            more in one modern shopping experience.
          </p>

          <div className="nova-hero-actions">
            <Link to="/products" className="nova-hero-primary">
              <ShoppingBag size={18} />
              Shop Now
              <ArrowRight size={18} />
            </Link>

            <Link to="/sale" className="nova-hero-secondary">
              Explore Deals
            </Link>
          </div>

          <div className="nova-hero-benefits">
            <div className="nova-hero-benefit">
              <span>
                <Truck size={18} />
              </span>

              <div>
                <strong>Free Shipping</strong>
                <small>Orders over $100</small>
              </div>
            </div>

            <div className="nova-hero-benefit">
              <span>
                <ShieldCheck size={18} />
              </span>

              <div>
                <strong>Secure Shopping</strong>
                <small>Protected checkout</small>
              </div>
            </div>
          </div>
        </div>

        <div className="nova-hero-slider">
          <div className="nova-slider-orbit nova-slider-orbit-one" />
          <div className="nova-slider-orbit nova-slider-orbit-two" />

          {loading ? (
            <div className="nova-hero-loading">
              <span />
              <p>Loading featured products...</p>
            </div>
          ) : currentProduct ? (
            <>
              <article key={currentProduct.id} className="nova-slider-card">
                <Link
                  to={`/products/${currentProduct.slug}`}
                  className="nova-slider-image"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={currentProduct.name} />
                  ) : (
                    <div className="nova-slider-placeholder">
                      {currentProduct.name?.charAt(0) || "N"}
                    </div>
                  )}
                </Link>

                <div className="nova-slider-product-info">
                  <div className="nova-slider-meta">
                    <span>
                      {currentProduct.category?.name || "Nova Collection"}
                    </span>

                    {currentProduct.stock > 0 && (
                      <span className="nova-slider-stock">In Stock</span>
                    )}
                  </div>

                  <Link
                    to={`/products/${currentProduct.slug}`}
                    className="nova-slider-title"
                  >
                    {currentProduct.name}
                  </Link>

                  <div className="nova-slider-price">
                    <strong>${finalPrice.toFixed(2)}</strong>

                    {hasSale && <span>${originalPrice.toFixed(2)}</span>}
                  </div>
                </div>

                {hasSale && (
                  <div className="nova-slider-discount">
                    <small>Save</small>
                    <strong>{discountPercentage}%</strong>
                  </div>
                )}
              </article>

              {products.length > 1 && (
                <>
                  <button
                    type="button"
                    className="nova-slider-arrow nova-slider-arrow-left"
                    onClick={previousProduct}
                    aria-label="Previous product"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <button
                    type="button"
                    className="nova-slider-arrow nova-slider-arrow-right"
                    onClick={nextProduct}
                    aria-label="Next product"
                  >
                    <ArrowRight size={19} />
                  </button>

                  <div className="nova-slider-dots">
                    {products.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        aria-label={`Show ${product.name}`}
                        className={index === currentIndex ? "active" : ""}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="nova-hero-empty">
              <Zap size={30} />

              <strong>Featured products coming soon</strong>

              <Link to="/products">Explore the store</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
