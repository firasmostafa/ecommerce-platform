import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import axios from "axios";

import ProductCard from "../components/ProductCard";

import { useCart } from "../context/cart-context";
import { useCurrency } from "../context/useCurrency";

import "./ProductDetails.css";
import "./ProductDetailsFeedback.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

const STORAGE_URL = "https://ecommerce-platform-4vwn.onrender.com/storage";

function ProductDetails() {
  const { slug } = useParams();

  const { cartItems, addToCart } = useCart();

  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [justAdded, setJustAdded] = useState(false);

  const [lastAddedQuantity, setLastAddedQuantity] = useState(0);

  /* ========================================
     IMAGE URL HELPER
  ======================================== */

 const getImageUrl = (image, width = 900) => {
  if (!image) {
    return null;
  }

  if (image.startsWith("http")) {
    return `${image}?tr=w-${width},q-85`;
  }

  return `${STORAGE_URL}/${image}`;
};
  /* ========================================
     LOAD PRODUCT
  ======================================== */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

const fetchProduct = async () => {
  try {
    setLoading(true);
    setError("");

    const productResponse = await axios.get(
      `${API_URL}/products/${slug}`,
    );

    const matchedProduct =
      productResponse.data?.data ||
      productResponse.data;

    if (!matchedProduct) {
      setError("Product not found.");
      return;
    }

    setProduct(matchedProduct);
    setSelectedImageIndex(0);
    setQuantity(1);
    setJustAdded(false);

    const relatedResponse = await axios.get(
      `${API_URL}/products?category=${matchedProduct.category?.slug}&per_page=5`,
    );

    const relatedProductsData =
      relatedResponse.data?.data?.data ||
      relatedResponse.data?.data ||
      [];

    const related = relatedProductsData
      .filter((item) => item.id !== matchedProduct.id)
      .slice(0, 4);

    setRelatedProducts(related);
  } catch (err) {
    console.error("Failed to load product details:", err);

    setError("We could not load this product right now.");
  } finally {
    setLoading(false);
  }
};

    fetchProduct();
  }, [slug]);

  /* ========================================
     IMAGES
  ======================================== */

  const images = useMemo(() => {
    if (!product?.images?.length) {
      return [];
    }

    return [...product.images].sort(
      (a, b) =>
        Number(b.is_primary || 0) - Number(a.is_primary || 0) ||
        Number(a.sort_order || 0) - Number(b.sort_order || 0),
    );
  }, [product]);

  /* ========================================
     CART QUANTITY
  ======================================== */

  const quantityInCart = useMemo(() => {
    if (!product) {
      return 0;
    }

    const cartItem = cartItems.find(
      (item) => item.id === product.id,
    );

    return Number(cartItem?.quantity || 0);
  }, [cartItems, product]);

  /* ========================================
     SELECTED IMAGE
  ======================================== */

  const selectedImage = images[selectedImageIndex];
  
const selectedImageUrl = selectedImage?.image
  ? getImageUrl(selectedImage.image, 1000)
  : null;

  /* ========================================
     PRICE
  ======================================== */

  const regularPrice = Number(product?.price || 0);

  const salePrice = product?.sale_price
    ? Number(product.sale_price)
    : null;

  const hasSale =
    salePrice !== null &&
    salePrice > 0 &&
    salePrice < regularPrice;

  const finalPrice = hasSale ? salePrice : regularPrice;

  const discountPercentage =
    hasSale && regularPrice > 0
      ? Math.round(
          ((regularPrice - salePrice) / regularPrice) * 100,
        )
      : 0;

  /* ========================================
     QUANTITY
  ======================================== */

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    setQuantity((current) =>
      Math.min(current + 1, Number(product.stock)),
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  /* ========================================
     ADD TO CART
  ======================================== */

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product, quantity);

    setLastAddedQuantity(quantity);

    setJustAdded(true);

    window.setTimeout(() => {
      setJustAdded(false);
    }, 2200);
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-state">
          <span className="product-details-spinner" />

          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  /* ========================================
     ERROR
  ======================================== */

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-state">
          <strong>Product unavailable</strong>

          <p>{error || "This product could not be found."}</p>

          <Link to="/products">Back to Shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="product-details-page">
      <section className="product-details-main">
        <div className="product-details-container">
          <Link
            to="/products"
            className="product-details-back"
          >
            <ArrowLeft size={17} />
            Back to Shop
          </Link>

          <div className="product-details-grid">
            {/* =================================
                GALLERY
            ================================= */}

            <div className="product-gallery">
              <div className="product-main-image">
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={
                      selectedImage?.alt_text ||
                      product.name
                    }
                  />
                ) : (
                  <div className="product-main-placeholder">
                    {product.name.charAt(0)}
                  </div>
                )}

                {hasSale && (
                  <span className="product-details-sale">
                    -{discountPercentage}%
                  </span>
                )}

                {product.is_featured && (
                  <span className="product-details-featured">
                    Featured
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="product-thumbnails">
                  {images.map((image, index) => {
                  const url = getImageUrl(image.image, 180);

                    return (
                      <button
                        key={image.id || `${image.image}-${index}`}
                        type="button"
                        className={
                          index === selectedImageIndex
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setSelectedImageIndex(index)
                        }
                        aria-label={`View product image ${
                          index + 1
                        }`}
                      >
                        {url && (
                       <img
  src={selectedImageUrl}
  alt={selectedImage?.alt_text || product.name}
  decoding="async"
/>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =================================
                INFORMATION
            ================================= */}

            <div className="product-information">
              <span className="product-details-category">
                {product.category?.name ||
                  "Nova Collection"}
              </span>

              <h1>{product.name}</h1>

              {/* PRICE */}

              <div className="product-details-price">
                <strong>{formatPrice(finalPrice)}</strong>

                {hasSale && (
                  <>
                    <span>
                      {formatPrice(regularPrice)}
                    </span>

                    <small>
                      Save {discountPercentage}%
                    </small>
                  </>
                )}
              </div>

              <p className="product-details-short">
                {product.short_description ||
                  product.description}
              </p>

              {/* META */}

              <div className="product-details-meta">
                <div>
                  <span>SKU</span>

                  <strong>{product.sku || "N/A"}</strong>
                </div>

                <div>
                  <span>Availability</span>

                  <strong
                    className={
                      Number(product.stock) <= 0
                        ? "unavailable"
                        : Number(product.stock) <=
                            Number(
                              product.low_stock_threshold ??
                                5,
                            )
                          ? "low-stock"
                          : "available"
                    }
                  >
                    {Number(product.stock) <= 0
                      ? "Sold Out"
                      : Number(product.stock) <=
                          Number(
                            product.low_stock_threshold ??
                              5,
                          )
                        ? "Low Stock"
                        : "In Stock"}
                  </strong>
                </div>
              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <div className="product-details-description">
                  <h3>About this product</h3>

                  <p>{product.description}</p>
                </div>
              )}

              {/* PURCHASE */}

              <div className="product-purchase-panel">
                <div className="quantity-control">
                  <span>Quantity</span>

                  <div>
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={17} />
                    </button>

                    <strong>{quantity}</strong>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        product.stock === 0 ||
                        quantity >=
                          Number(product.stock)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={`product-details-cart ${
                    justAdded
                      ? "product-details-cart-added"
                      : ""
                  }`}
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  {justAdded ? (
                    <>
                      <Check size={19} />
                      Added Successfully
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={19} />

                      {product.stock > 0
                        ? "Add to Cart"
                        : "Sold Out"}
                    </>
                  )}
                </button>
              </div>

              {/* CART STATUS */}

              {quantityInCart > 0 && (
                <div className="product-details-cart-status">
                  <div className="product-details-cart-status-icon">
                    <Check size={16} />
                  </div>

                  <div>
                    <strong>
                      Product is in your cart
                    </strong>

                    <span>
                      You currently have{" "}
                      <b>{quantityInCart}</b>{" "}
                      {quantityInCart === 1
                        ? "item"
                        : "items"}{" "}
                      of this product.
                    </span>
                  </div>

                  <Link to="/cart">
                    View Cart
                  </Link>
                </div>
              )}

              {/* ADDED MESSAGE */}

              {justAdded && (
                <div className="product-added-message">
                  <Check size={17} />

                  <span>
                    {lastAddedQuantity}{" "}
                    {lastAddedQuantity === 1
                      ? "item was"
                      : "items were"}{" "}
                    added successfully.
                  </span>
                </div>
              )}

              {/* BENEFITS */}

              <div className="product-details-benefits">
                <div>
                  <span>
                    <Truck size={19} />
                  </span>

                  <div>
                    <strong>Fast Delivery</strong>

                    <small>
                      Reliable shipping service
                    </small>
                  </div>
                </div>

                <div>
                  <span>
                    <ShieldCheck size={19} />
                  </span>

                  <div>
                    <strong>Secure Checkout</strong>

                    <small>
                      Protected order process
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          RELATED PRODUCTS
      ================================= */}

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="product-details-container">
            <div className="related-products-heading">
              <span>YOU MAY ALSO LIKE</span>

              <h2>Related Products</h2>
            </div>

            <div className="related-products-grid">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetails;