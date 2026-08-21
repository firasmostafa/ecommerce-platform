import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Eye,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminCustomerDetails.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

function AdminCustomerDetails() {
  const { customerId } = useParams();

  const { token } = useAuth();

  const [customerData, setCustomerData] = useState(null);

  const [loading, setLoading] = useState(Boolean(token));

  const [error, setError] = useState("");

  /* ========================================
     LOAD CUSTOMER DETAILS
  ======================================== */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    const loadCustomer = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/customers/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,

              Accept: "application/json",
            },
          },
        );

        if (cancelled) {
          return;
        }

        setCustomerData(response.data?.data || null);

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load customer details:", err);

        setError(
          err.response?.data?.message || "Unable to load customer details.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [token, customerId]);

  /* ========================================
     HELPERS
  ======================================== */

  const formatMoney = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock3;

      case "confirmed":
        return CheckCircle2;

      case "processing":
        return Package;

      case "shipped":
        return ShoppingBag;

      case "delivered":
        return CheckCircle2;

      case "cancelled":
        return XCircle;

      default:
        return Package;
    }
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="admin-customer-details-page">
        <div className="admin-customer-details-container">
          <div className="admin-customer-details-state">
            <span className="admin-customer-details-spinner" />

            <strong>Loading customer...</strong>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================
     ERROR
  ======================================== */

  if (error || !customerData) {
    return (
      <main className="admin-customer-details-page">
        <div className="admin-customer-details-container">
          <div className="admin-customer-details-state">
            <XCircle size={28} />

            <strong>Customer unavailable</strong>

            <p>{error || "Customer information could not be loaded."}</p>

            <Link to="/admin/customers" className="admin-customer-back-link">
              <ArrowLeft size={13} />
              Back to Customers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { customer, summary, orders = [] } = customerData;

  return (
    <main className="admin-customer-details-page">
      <div className="admin-customer-details-container">
        {/* =================================
            BACK
        ================================= */}

        <div className="admin-customer-details-back">
          <Link to="/admin/customers">
            <ArrowLeft size={13} />
            Customers
          </Link>
        </div>

        {/* =================================
            HEADER
        ================================= */}

        <header className="admin-customer-details-heading">
          <span>CUSTOMER DETAILS</span>

          <h1>{customer.name}</h1>

          <p>Customer profile, spending and order history.</p>
        </header>

        {/* =================================
            CUSTOMER PROFILE
        ================================= */}

        <section className="admin-customer-profile">
          <div className="admin-customer-profile-main">
            <div className="admin-customer-profile-avatar">
              <UserRound size={24} />
            </div>

            <div className="admin-customer-profile-name">
              <strong>{customer.name}</strong>

              <span>Customer #{customer.id}</span>
            </div>
          </div>

          <div className="admin-customer-profile-contact">
            <div>
              <Mail size={13} />

              <span>{customer.email}</span>
            </div>

            <div>
              <Phone size={13} />

              <span>{customer.phone || "No phone number"}</span>
            </div>

            <div>
              <CalendarDays size={13} />

              <span>Joined {formatDate(customer.created_at)}</span>
            </div>
          </div>
        </section>

        {/* =================================
            SUMMARY
        ================================= */}

        <section className="admin-customer-details-summary">
          <article>
            <span className="summary-icon orders">
              <ShoppingBag size={17} />
            </span>

            <div>
              <small>Total Orders</small>

              <strong>{summary.total_orders || 0}</strong>
            </div>
          </article>

          <article>
            <span className="summary-icon pending">
              <Clock3 size={17} />
            </span>

            <div>
              <small>Pending</small>

              <strong>{summary.pending_orders || 0}</strong>
            </div>
          </article>

          <article>
            <span className="summary-icon delivered">
              <CheckCircle2 size={17} />
            </span>

            <div>
              <small>Delivered</small>

              <strong>{summary.delivered_orders || 0}</strong>
            </div>
          </article>

          <article>
            <span className="summary-icon spent">
              <DollarSign size={17} />
            </span>

            <div>
              <small>Paid Spending</small>

              <strong>{formatMoney(summary.total_spent)}</strong>
            </div>
          </article>
        </section>

        {/* =================================
            ORDER HISTORY
        ================================= */}

        <section className="admin-customer-orders-section">
          <div className="admin-customer-orders-heading">
            <div>
              <span>ORDER HISTORY</span>

              <h2>Customer Orders</h2>
            </div>

            <strong>{orders.length}</strong>
          </div>

          {orders.length > 0 ? (
            <div className="admin-customer-orders-list">
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);

                return (
                  <article className="admin-customer-order-card" key={order.id}>
                    <div className="admin-customer-order-main">
                      <div className="admin-customer-order-icon">
                        <ShoppingBag size={17} />
                      </div>

                      <div>
                        <strong>
                          {order.order_number || `Order #${order.id}`}
                        </strong>

                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>

                    <div className="admin-customer-order-info">
                      <div>
                        <span>Items</span>

                        <strong>{order.items?.length || 0}</strong>
                      </div>

                      <div>
                        <span>Total</span>

                        <strong>{formatMoney(order.total)}</strong>
                      </div>
                    </div>

                    <div className="admin-customer-order-badges">
                      <span
                        className={`admin-customer-order-status status-${order.status}`}
                      >
                        <StatusIcon size={11} />

                        {order.status}
                      </span>

                      <span
                        className={`admin-customer-payment-status payment-${order.payment_status}`}
                      >
                        {order.payment_status}
                      </span>
                    </div>

                    <div className="admin-customer-order-action">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Eye size={12} />
                        View Order
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-customer-details-empty">
              <ShoppingBag size={24} />

              <strong>No orders yet</strong>

              <p>This customer has not placed any orders.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminCustomerDetails;
