import { useEffect, useState } from "react";
import axios from "axios";

import {
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/auth-context";
import { useCurrency } from "../context/useCurrency";

import "./MyOrders.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

const statusSteps = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function MyOrders() {
  const { token } = useAuth();

  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    axios
      .get(`${API_URL}/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        if (cancelled) {
          return;
        }

        setOrders(response.data.data?.data || []);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to load orders:", err);

        setError(err.response?.data?.message || "Unable to load your orders.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const reloadOrders = async () => {
    const response = await axios.get(`${API_URL}/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    setOrders(response.data.data?.data || []);
  };

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(orderId);
      setError("");

      await axios.patch(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      await reloadOrders();
    } catch (err) {
      console.error("Cancel order failed:", err);

      setError(err.response?.data?.message || "Unable to cancel this order.");
    } finally {
      setCancellingId(null);
    }
  };

  const getCurrentStep = (status) => {
    return statusSteps.indexOf(status);
  };

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-state">
          <Package size={35} />
          <h2>Loading your orders...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-container">
        <header className="my-orders-heading">
          <span>YOUR ACCOUNT</span>

          <h1>My Orders</h1>

          <p>
            View your purchases and follow each order from confirmation to
            delivery.
          </p>
        </header>

        {error && <div className="my-orders-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="my-orders-state">
            <ShoppingBag size={40} />

            <h2>No orders yet</h2>

            <p>
              When you place your first order, you will be able to track it
              here.
            </p>

            <Link to="/products">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const currentStep = getCurrentStep(order.status);

              const canCancel = ["pending", "confirmed"].includes(order.status);

              return (
                <article className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div>
                      <span>ORDER</span>

                      <h2>{order.order_number}</h2>

                      <small>
                        {new Date(order.created_at).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="order-card-total">
                      <span>Total</span>

                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </div>

                  {order.status === "cancelled" ? (
                    <div className="order-cancelled">
                      <XCircle size={20} />

                      <div>
                        <strong>Order Cancelled</strong>

                        <span>This order has been cancelled.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="order-timeline">
                      {statusSteps.map((step, index) => {
                        const completed = index <= currentStep;

                        const icons = {
                          pending: Clock3,
                          confirmed: CheckCircle2,
                          processing: Package,
                          shipped: Truck,
                          delivered: CheckCircle2,
                        };

                        const Icon = icons[step];

                        return (
                          <div
                            className={`timeline-step ${
                              completed ? "completed" : ""
                            }`}
                            key={step}
                          >
                            <div className="timeline-icon">
                              <Icon size={17} />
                            </div>

                            <span>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="order-card-footer">
                    <div>
                      <span>Status</span>

                      <strong className={`order-status status-${order.status}`}>
                        {order.status}
                      </strong>
                    </div>

                    <div className="order-actions">
                      <Link
                        to={`/orders/${order.id}`}
                        className="order-view-button"
                      >
                        View Details
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          className="order-cancel-button"
                          disabled={cancellingId === order.id}
                          onClick={() => cancelOrder(order.id)}
                        >
                          {cancellingId === order.id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyOrders;
