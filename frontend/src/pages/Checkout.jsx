import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useCart } from "../context/cart-context";
import { useAuth } from "../context/auth-context";
import { useCurrency } from "../context/useCurrency";

import "./Checkout.css";

const API_URL = "http://127.0.0.1:8000/api";

function Checkout() {
  const navigate = useNavigate();

  const { token } = useAuth();

  const {
    cartItems,
    cartSubtotal,
    clearCart,
  } = useCart();

  const {
    formatPrice,
  } = useCurrency();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    country: "Lebanon",
    city: "",
    address: "",
    customer_notes: "",
    payment_method: "cash_on_delivery",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...formData,

        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await axios.post(
        `${API_URL}/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const order = response.data.data;

      clearCart();

      navigate("/checkout-success", {
        state: {
          order,
        },
      });
    } catch (err) {
      console.error("Checkout failed:", err);

      const message =
        err.response?.data?.message ||
        "Unable to place your order right now.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>Your cart is empty</h1>

          <p>
            Add some products before continuing
            to checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Back to Shop
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-heading">
          <span>
            SECURE CHECKOUT
          </span>

          <h1>
            Complete Your Order
          </h1>

          <p>
            Enter your delivery information and
            review your order before confirming.
          </p>
        </div>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            <div className="checkout-form-section">
              <h2>
                Customer Information
              </h2>

              <div className="checkout-fields-grid">
                <label>
                  <span>
                    Full Name *
                  </span>

                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>
                    Email
                  </span>

                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>
                    Phone *
                  </span>

                  <input
                    type="text"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="checkout-form-section">
              <h2>
                Delivery Address
              </h2>

              <div className="checkout-fields-grid">
                <label>
                  <span>
                    Country
                  </span>

                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>
                    City *
                  </span>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Address *
                  </span>

                  <textarea
                    name="address"
                    rows="4"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="checkout-full-field">
                  <span>
                    Order Notes
                  </span>

                  <textarea
                    name="customer_notes"
                    rows="4"
                    value={formData.customer_notes}
                    onChange={handleChange}
                    placeholder="Optional delivery notes..."
                  />
                </label>
              </div>
            </div>

            <div className="checkout-form-section">
              <h2>
                Payment Method
              </h2>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="cash_on_delivery"
                  checked={
                    formData.payment_method ===
                    "cash_on_delivery"
                  }
                  onChange={handleChange}
                />

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order arrives.
                  </span>
                </div>
              </label>
            </div>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="checkout-submit"
              disabled={submitting}
            >
              {submitting
                ? "Placing Order..."
                : "Place Order"}
            </button>
          </form>

          <aside className="checkout-summary">
            <span>
              ORDER SUMMARY
            </span>

            <h2>
              Your Order
            </h2>

            <div className="checkout-summary-items">
              {cartItems.map((item) => {
                const regularPrice = Number(
                  item.price || 0
                );

                const salePrice = Number(
                  item.sale_price || 0
                );

                const finalPrice =
                  salePrice > 0 &&
                  salePrice < regularPrice
                    ? salePrice
                    : regularPrice;

                const itemTotal =
                  finalPrice *
                  Number(item.quantity || 0);

                return (
                  <div
                    key={item.id}
                    className="checkout-summary-item"
                  >
                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        Qty: {item.quantity}
                      </span>
                    </div>

                    <strong>
                      {formatPrice(
                        itemTotal
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                {formatPrice(
                  cartSubtotal
                )}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>
                Shipping
              </span>

              <strong>
                Calculated by store
              </strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>
                Estimated Total
              </span>

              <strong>
                {formatPrice(
                  cartSubtotal
                )}
              </strong>
            </div>

            <p>
              Final shipping and tax values are
              calculated securely by Laravel.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;