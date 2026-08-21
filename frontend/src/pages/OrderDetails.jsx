import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/auth-context";
import { useCurrency } from "../context/useCurrency";

import "./OrderDetails.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";
const STORAGE_URL = "https://ecommerce-platform-4vwn.onrender.com/storage";

const ORDER_STEPS = [
  {
    status: "pending",
    label: "Order Placed",
    icon: Clock3,
  },
  {
    status: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    status: "processing",
    label: "Processing",
    icon: Package,
  },
  {
    status: "shipped",
    label: "Shipped",
    icon: Truck,
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
  },
];

function OrderDetails() {
  const { orderId } = useParams();

  const { token } = useAuth();

  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    if (!token) {
      return undefined;
    }

    let cancelled = false;

    axios
      .get(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        if (cancelled) {
          return;
        }

        setOrder(response.data.data);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to load order:", err);

        setError(err.response?.data?.message || "Unable to load this order.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  const currentStep = useMemo(() => {
    if (!order) {
      return -1;
    }

    return ORDER_STEPS.findIndex((step) => step.status === order.status);
  }, [order]);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString();
  };

  const getItemImage = (item) => {
    const images = item.product?.images || [];

    if (images.length === 0) {
      return null;
    }

    const primaryImage =
      images.find(
        (image) => image.is_primary === true || image.is_primary === 1,
      ) || images[0];

    if (!primaryImage?.image) {
      return null;
    }

    return `${STORAGE_URL}/${primaryImage.image}`;
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-state">
          <Package size={38} />

          <h2>Loading order...</h2>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="order-details-state">
          <XCircle size={40} />

          <h2>Order unavailable</h2>

          <p>{error || "Order not found."}</p>

          <Link to="/my-orders">Back to My Orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">
      <div className="order-details-container">
        <Link to="/my-orders" className="order-details-back">
          <ArrowLeft size={17} />
          My Orders
        </Link>

        <header className="order-details-heading">
          <div>
            <span>ORDER DETAILS</span>

            <h1>{order.order_number}</h1>

            <p>Placed on {formatDate(order.created_at)}</p>
          </div>

          <span className={`order-details-status status-${order.status}`}>
            {order.status}
          </span>
        </header>

        {order.status === "cancelled" ? (
          <section className="order-details-cancelled">
            <XCircle size={24} />

            <div>
              <strong>Order Cancelled</strong>

              <p>
                This order was cancelled and will not continue through the
                delivery process.
              </p>
            </div>
          </section>
        ) : (
          <section className="order-details-tracking">
            <div className="tracking-heading">
              <div>
                <span>LIVE STATUS</span>

                <h2>Track your order</h2>
              </div>

              <Package size={24} />
            </div>

            <div className="tracking-timeline">
              {ORDER_STEPS.map((step, index) => {
                const Icon = step.icon;

                const completed = index <= currentStep;

                const active = index === currentStep;

                return (
                  <div
                    key={step.status}
                    className={`tracking-step ${completed ? "completed" : ""} ${
                      active ? "active" : ""
                    }`}
                  >
                    <div className="tracking-step-icon">
                      <Icon size={18} />
                    </div>

                    <div>
                      <strong>{step.label}</strong>

                      {active && <span>Current status</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="order-details-grid">
          <section className="order-details-products">
            <div className="order-section-heading">
              <Package size={20} />

              <div>
                <span>YOUR PURCHASE</span>

                <h2>Order Items</h2>
              </div>
            </div>

            <div className="order-items-list">
              {(order.items || []).map((item) => {
                const imageUrl = getItemImage(item);

                const productLink = item.product?.slug
                  ? `/products/${item.product.slug}`
                  : null;

                const lineTotal =
                  item.line_total ||
                  Number(item.unit_price || 0) * Number(item.quantity || 0);

                return (
                  <div className="order-detail-item" key={item.id}>
                    <div className="order-detail-item-info">
                      {productLink ? (
                        <Link to={productLink} className="order-item-image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={
                                item.product_name ||
                                item.product?.name ||
                                "Product"
                              }
                            />
                          ) : (
                            <div className="order-item-placeholder">
                              <Package size={20} />
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="order-item-image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product_name || "Product"}
                            />
                          ) : (
                            <div className="order-item-placeholder">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        {productLink ? (
                          <Link
                            to={productLink}
                            className="order-item-product-name"
                          >
                            {item.product_name ||
                              item.product?.name ||
                              "Product"}
                          </Link>
                        ) : (
                          <strong>
                            {item.product_name ||
                              item.product?.name ||
                              "Product"}
                          </strong>
                        )}

                        {item.product_sku && (
                          <span>SKU: {item.product_sku}</span>
                        )}

                        <span>Quantity: {item.quantity}</span>
                      </div>
                    </div>

                    <div className="order-item-price">
                      <span>{formatPrice(item.unit_price)} each</span>

                      <strong>{formatPrice(lineTotal)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="order-summary-card">
            <div className="order-section-heading">
              <FileText size={20} />

              <div>
                <span>PAYMENT</span>

                <h2>Order Summary</h2>
              </div>
            </div>

            <div className="order-summary-lines">
              <div>
                <span>Subtotal</span>

                <strong>{formatPrice(order.subtotal)}</strong>
              </div>

              <div>
                <span>Discount</span>

                <strong>-{formatPrice(order.discount_amount)}</strong>
              </div>

              <div>
                <span>Shipping</span>

                <strong>
                  {Number(order.shipping_amount || 0) === 0
                    ? "Free"
                    : formatPrice(order.shipping_amount)}
                </strong>
              </div>

              <div>
                <span>Tax</span>

                <strong>{formatPrice(order.tax_amount)}</strong>
              </div>

              <div className="order-summary-total">
                <span>Total</span>

                <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>

            <div className="order-payment-status">
              <span>Payment</span>

              <strong>{order.payment_status || "pending"}</strong>
            </div>

            <Link
              to={`/orders/${order.id}/invoice`}
              className="order-invoice-button"
            >
              <FileText size={17} />
              View Invoice
            </Link>
          </aside>
        </div>

        <section className="order-address-card">
          <div className="order-section-heading">
            <MapPin size={20} />

            <div>
              <span>DELIVERY</span>

              <h2>Shipping Information</h2>
            </div>
          </div>

          <div className="order-address-content">
            <div>
              <span>Name</span>

              <strong>{order.customer_name || "—"}</strong>
            </div>

            <div>
              <span>Phone</span>

              <strong>{order.customer_phone || "—"}</strong>
            </div>

            <div>
              <span>Country</span>

              <strong>{order.country || "—"}</strong>
            </div>

            <div>
              <span>City</span>

              <strong>{order.city || "—"}</strong>
            </div>

            <div className="order-address-full">
              <span>Address</span>

              <strong>{order.address || "—"}</strong>
            </div>

            {order.customer_notes && (
              <div className="order-address-full">
                <span>Delivery Notes</span>

                <strong>{order.customer_notes}</strong>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderDetails;
