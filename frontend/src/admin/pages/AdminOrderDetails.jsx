import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminOrderDetails.css";

const API_URL = "http://127.0.0.1:8000/api";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "unpaid",
  "paid",
  "refunded",
];

function AdminOrderDetails() {
  const { orderId } = useParams();

  const { token } = useAuth();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [
    updatingPayment,
    setUpdatingPayment,
  ] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token || !orderId) {
      return undefined;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (cancelled) {
          return;
        }

        setOrder(response.data?.data || null);

        setError("");
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load admin order:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load this order."
        );

        setLoading(false);
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [
    orderId,
    token,
  ]);

  const updateOrderStatus = async (
    newStatus
  ) => {
    if (!order) {
      return;
    }

    try {
      setUpdatingStatus(true);

      setError("");
      setSuccess("");

      const response = await axios.patch(
        `${API_URL}/admin/orders/${order.id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const updatedOrder =
        response.data?.data;

      setOrder((currentOrder) => ({
        ...currentOrder,
        ...(updatedOrder || {}),
        status:
          updatedOrder?.status ||
          newStatus,
      }));

      setSuccess(
        "Order status updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update order status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updatePaymentStatus = async (
    newPaymentStatus
  ) => {
    if (!order) {
      return;
    }

    try {
      setUpdatingPayment(true);

      setError("");
      setSuccess("");

      const response = await axios.patch(
        `${API_URL}/admin/orders/${order.id}/payment-status`,
        {
          payment_status:
            newPaymentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const updatedOrder =
        response.data?.data;

      setOrder((currentOrder) => ({
        ...currentOrder,
        ...(updatedOrder || {}),
        payment_status:
          updatedOrder?.payment_status ||
          newPaymentStatus,
      }));

      setSuccess(
        "Payment status updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update payment status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update payment status."
      );
    } finally {
      setUpdatingPayment(false);
    }
  };

  const formatPrice = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(new Date(value));
  };

  const items =
    order?.items || [];

  if (loading) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details-container">

          <div className="admin-order-details-state">

            <span className="admin-order-details-spinner" />

            <strong>
              Loading order...
            </strong>

          </div>

        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details-container">

          <div className="admin-order-details-state">

            <Package size={26} />

            <strong>
              Order unavailable
            </strong>

            <p>
              {error}
            </p>

            <Link
              to="/admin/orders"
              className="admin-order-back-button"
            >
              <ArrowLeft size={14} />

              Back to Orders
            </Link>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="admin-order-details-page">

      <div className="admin-order-details-container">

        {/* TOP */}

        <div className="admin-order-details-top">

          <Link
            to="/admin/orders"
            className="admin-order-back"
          >
            <ArrowLeft size={14} />

            Orders
          </Link>

          <div className="admin-order-details-title">

            <span>
              ORDER DETAILS
            </span>

            <h1>
              {order.order_number ||
                `Order #${order.id}`}
            </h1>

            <p>
              <CalendarDays size={12} />

              {formatDate(
                order.created_at
              )}
            </p>

          </div>

          <div className="admin-order-top-status">

            <span
              className={`admin-order-status-badge status-${order.status}`}
            >
              {order.status}
            </span>

          </div>

        </div>

        {/* MESSAGES */}

        {error && (
          <div className="admin-order-message admin-order-message-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-order-message admin-order-message-success">

            <CheckCircle2 size={14} />

            {success}

          </div>
        )}

        {/* CONTROLS */}

        <section className="admin-order-controls-card">

          <div className="admin-order-control">

            <div>
              <span>
                Order Status
              </span>

              <strong>
                {order.status}
              </strong>
            </div>

            <select
              value={
                order.status ||
                "pending"
              }
              disabled={
                updatingStatus
              }
              onChange={(event) =>
                updateOrderStatus(
                  event.target.value
                )
              }
            >
              {orderStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="admin-order-control">

            <div>
              <span>
                Payment Status
              </span>

              <strong>
                {order.payment_status ||
                  "unpaid"}
              </strong>
            </div>

            <select
              value={
                order.payment_status ||
                "unpaid"
              }
              disabled={
                updatingPayment
              }
              onChange={(event) =>
                updatePaymentStatus(
                  event.target.value
                )
              }
            >
              {paymentStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

          </div>

          {(updatingStatus ||
            updatingPayment) && (

            <div className="admin-order-updating">

              <RefreshCw size={13} />

              Updating...

            </div>

          )}

        </section>

        {/* MAIN GRID */}

        <div className="admin-order-details-grid">

          {/* MAIN */}

          <div className="admin-order-details-main">

            {/* PRODUCTS */}

            <section className="admin-order-section">

              <div className="admin-order-section-heading">

                <div>

                  <ShoppingBag size={15} />

                  <h2>
                    Order Items
                  </h2>

                </div>

                <span>
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </span>

              </div>

              {items.length > 0 ? (

                <div className="admin-order-items">

                  {items.map(
                    (item, index) => {

                      const product =
                        item.product || {};

                      const name =
                        item.product_name ||
                        item.name ||
                        product.name ||
                        `Product ${
                          index + 1
                        }`;

                      const quantity =
                        Number(
                          item.quantity || 1
                        );

                      const price =
                        Number(
                          item.unit_price ||
                            item.price ||
                            product.price ||
                            0
                        );

                      const lineTotal =
                        Number(
                          item.line_total ||
                            price *
                              quantity
                        );

                      const primaryImage =
                        product.images?.find(
                          (image) =>
                            image.is_primary
                        ) ||
                        product.images?.[0];

                      const imageUrl =
                        primaryImage?.image
                          ? `${API_URL.replace(
                              "/api",
                              ""
                            )}/storage/${primaryImage.image}`
                          : null;

                      return (
                        <article
                          className="admin-order-item"
                          key={
                            item.id ||
                            `${name}-${index}`
                          }
                        >

                          <div className="admin-order-item-image">

                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={name}
                              />
                            ) : (
                              <Package
                                size={16}
                              />
                            )}

                          </div>

                          <div className="admin-order-item-info">

                            <strong>
                              {name}
                            </strong>

                            <span>
                              SKU:{" "}
                              {item.product_sku ||
                                product.sku ||
                                "—"}
                            </span>

                            <small>
                              {formatPrice(
                                price
                              )}{" "}
                              × {quantity}
                            </small>

                          </div>

                          <strong className="admin-order-item-total">

                            {formatPrice(
                              lineTotal
                            )}

                          </strong>

                        </article>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="admin-order-empty-items">

                  No product information available.

                </div>

              )}

            </section>

            {/* SUMMARY */}

            <section className="admin-order-section admin-order-summary-card">

              <div className="admin-order-section-heading">

                <div>

                  <CreditCard size={15} />

                  <h2>
                    Order Summary
                  </h2>

                </div>

              </div>

              <div className="admin-order-price-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatPrice(
                    order.subtotal
                  )}
                </strong>

              </div>

              <div className="admin-order-price-row">

                <span>
                  Discount
                </span>

                <strong>
                  -
                  {formatPrice(
                    order.discount_amount
                  )}
                </strong>

              </div>

              <div className="admin-order-price-row">

                <span>
                  Shipping
                </span>

                <strong>
                  {formatPrice(
                    order.shipping_amount
                  )}
                </strong>

              </div>

              <div className="admin-order-price-row">

                <span>
                  Tax
                </span>

                <strong>
                  {formatPrice(
                    order.tax_amount
                  )}
                </strong>

              </div>

              <div className="admin-order-price-row admin-order-grand-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(
                    order.total
                  )}
                </strong>

              </div>

            </section>

          </div>

          {/* SIDE */}

          <aside className="admin-order-details-side">

            {/* CUSTOMER */}

            <section className="admin-order-section">

              <div className="admin-order-section-heading">

                <div>

                  <UserRound size={15} />

                  <h2>
                    Customer
                  </h2>

                </div>

              </div>

              <div className="admin-order-info-list">

                <div>

                  <UserRound size={13} />

                  <span>

                    <small>
                      Name
                    </small>

                    <strong>
                      {order.customer_name ||
                        order.user?.name ||
                        "—"}
                    </strong>

                  </span>

                </div>

                <div>

                  <Mail size={13} />

                  <span>

                    <small>
                      Email
                    </small>

                    <strong>
                      {order.customer_email ||
                        order.user?.email ||
                        "—"}
                    </strong>

                  </span>

                </div>

                <div>

                  <Phone size={13} />

                  <span>

                    <small>
                      Phone
                    </small>

                    <strong>
                      {order.customer_phone ||
                        "—"}
                    </strong>

                  </span>

                </div>

              </div>

            </section>

            {/* SHIPPING */}

            <section className="admin-order-section">

              <div className="admin-order-section-heading">

                <div>

                  <MapPin size={15} />

                  <h2>
                    Shipping
                  </h2>

                </div>

              </div>

              <div className="admin-order-address">

                <strong>
                  {order.address ||
                    "No address provided"}
                </strong>

                <span>
                  {[
                    order.city,
                    order.country,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                    "—"}
                </span>

                {order.customer_notes && (

                  <p>

                    <small>
                      Customer Note
                    </small>

                    {order.customer_notes}

                  </p>

                )}

              </div>

            </section>

            {/* PAYMENT */}

            <section className="admin-order-section">

              <div className="admin-order-section-heading">

                <div>

                  <CreditCard size={15} />

                  <h2>
                    Payment
                  </h2>

                </div>

              </div>

              <div className="admin-order-mini-info">

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {order.payment_status ||
                      "unpaid"}
                  </strong>

                </div>

                <div>

                  <span>
                    Method
                  </span>

                  <strong>
                    {order.payment_method
                      ?.replaceAll(
                        "_",
                        " "
                      ) ||
                      "Cash on delivery"}
                  </strong>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default AdminOrderDetails;