import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../context/cart-context";
import { useCurrency } from "../context/useCurrency";

import "./Cart.css";

const STORAGE_URL = "https://ecommerce-platform-4vwn.onrender.com/storage";

function Cart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const { formatPrice } = useCurrency();

  const getFinalPrice = (item) => {
    const regularPrice = Number(item.price || 0);
    const salePrice = Number(item.sale_price || 0);

    if (salePrice > 0 && regularPrice > 0 && salePrice < regularPrice) {
      return salePrice;
    }

    return regularPrice;
  };

  const getProductImage = (item) => {
    if (!item.images?.length) {
      return null;
    }

    const images = [...item.images].sort(
      (a, b) =>
        Number(b.is_primary || 0) - Number(a.is_primary || 0) ||
        Number(a.sort_order || 0) - Number(b.sort_order || 0),
    );

    if (!images[0]?.image) {
      return null;
    }

    return `${STORAGE_URL}/${images[0].image}`;
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={35} />
            </div>

            <span>YOUR CART</span>

            <h1>Your cart is empty</h1>

            <p>
              Looks like you haven't added anything to your cart yet. Explore
              our products and find something you love.
            </p>

            <Link to="/products">
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-heading">
          <div>
            <span>YOUR SELECTION</span>

            <h1>Shopping Cart</h1>

            <p>
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <Link to="/products" className="cart-continue-shopping">
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        <div className="cart-layout">
          <section className="cart-items">
            <div className="cart-items-header">
              <strong>Your Items</strong>

              <button type="button" onClick={clearCart}>
                <Trash2 size={15} />
                Clear Cart
              </button>
            </div>

            {cartItems.map((item) => {
              const finalPrice = getFinalPrice(item);

              const regularPrice = Number(item.price || 0);

              const imageUrl = getProductImage(item);

              const hasSale = finalPrice < regularPrice;

              const itemTotal = finalPrice * Number(item.quantity || 0);

              return (
                <article className="cart-item" key={item.id}>
                  <Link
                    to={`/products/${item.slug}`}
                    className="cart-item-image"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} />
                    ) : (
                      <div>{item.name?.charAt(0).toUpperCase()}</div>
                    )}
                  </Link>

                  <div className="cart-item-info">
                    <span>{item.category?.name || "Nova Collection"}</span>

                    <Link to={`/products/${item.slug}`}>{item.name}</Link>

                    {item.sku && <small>SKU: {item.sku}</small>}

                    <div className="cart-item-price">
                      <strong>{formatPrice(finalPrice)}</strong>

                      {hasSale && <span>{formatPrice(regularPrice)}</span>}
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        type="button"
                        disabled={
                          Number(item.stock) > 0 &&
                          item.quantity >= Number(item.stock)
                        }
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <strong className="cart-item-total">
                      {formatPrice(itemTotal)}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <span className="cart-summary-eyebrow">ORDER SUMMARY</span>

            <h2>Summary</h2>

            <div className="cart-summary-row">
              <span>
                Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})
              </span>

              <strong>{formatPrice(cartSubtotal)}</strong>
            </div>

            <div className="cart-summary-row">
              <span>Shipping</span>

              <strong>Calculated later</strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total</span>

              <strong>{formatPrice(cartSubtotal)}</strong>
            </div>

            <Link to="/checkout" className="cart-checkout-button">
              Proceed to Checkout
            </Link>

            <p className="cart-summary-note">
              Shipping and final order details will be confirmed during
              checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
