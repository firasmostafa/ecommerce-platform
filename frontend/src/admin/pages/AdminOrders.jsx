import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminOrders.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = ["unpaid", "paid", "refunded"];

function AdminOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    const loadOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },

          params: {
            page,
            per_page: 10,

            search: search || undefined,

            status: status || undefined,

            payment_status: paymentStatus || undefined,
          },
        });

        if (cancelled) {
          return;
        }

        const pagination = response.data?.data;

        setOrders(pagination?.data || []);

        setTotal(pagination?.total || 0);

        setLastPage(pagination?.last_page || 1);

        setError("");
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load admin orders:", err);

        setError(err.response?.data?.message || "Unable to load orders.");

        setLoading(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [token, page, search, status, paymentStatus]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setPage(1);
    setLoading(true);

    setSearch(searchInput.trim());
  };

  const handleStatusFilter = (event) => {
    setPage(1);
    setLoading(true);

    setStatus(event.target.value);
  };

  const handlePaymentFilter = (event) => {
    setPage(1);
    setLoading(true);

    setPaymentStatus(event.target.value);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPage(1);

    setLoading(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await axios.patch(
        `${API_URL}/admin/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const updatedOrder = response.data?.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                status: updatedOrder?.status || newStatus,
              }
            : order,
        ),
      );
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(err.response?.data?.message || "Unable to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await axios.patch(
        `${API_URL}/admin/orders/${orderId}/payment-status`,
        {
          payment_status: newPaymentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const updatedOrder = response.data?.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...(updatedOrder || {}),
                payment_status:
                  updatedOrder?.payment_status || newPaymentStatus,
              }
            : order,
        ),
      );
    } catch (err) {
      console.error("Failed to update payment status:", err);

      setError(
        err.response?.data?.message || "Unable to update payment status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  };

  const currentPageStart = total === 0 ? 0 : (page - 1) * 10 + 1;

  const currentPageEnd = Math.min(page * 10, total);

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-container">
        {/* PAGE TITLE */}

        <header className="admin-orders-heading">
          <span>ORDER MANAGEMENT</span>

          <h1>Orders</h1>

          <p>Review, track and manage customer orders from one place.</p>
        </header>

        {/* SUMMARY */}

        <section className="admin-orders-summary">
          <div className="admin-order-summary-item">
            <span className="admin-summary-icon">
              <ShoppingBag size={15} />
            </span>

            <div>
              <span>Total Orders</span>

              <strong>{total}</strong>
            </div>
          </div>

          <div className="admin-order-summary-item">
            <span className="admin-summary-icon">
              <Package size={15} />
            </span>

            <div>
              <span>Showing</span>

              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="admin-order-summary-item">
            <span className="admin-summary-icon">
              <WalletCards size={15} />
            </span>

            <div>
              <span>Page</span>

              <strong>
                {page} / {lastPage}
              </strong>
            </div>
          </div>
        </section>

        {/* SEARCH + FILTER */}

        <section className="admin-orders-toolbar">
          <form className="admin-orders-search" onSubmit={handleSearchSubmit}>
            <Search size={15} />

            <input
              type="search"
              value={searchInput}
              placeholder="Search order, customer, email..."
              onChange={(event) => setSearchInput(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          <div className="admin-orders-filters">
            <select value={status} onChange={handleStatusFilter}>
              <option value="">All statuses</option>

              {orderStatuses.map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {orderStatus}
                </option>
              ))}
            </select>

            <select value={paymentStatus} onChange={handlePaymentFilter}>
              <option value="">All payments</option>

              {paymentStatuses.map((payment) => (
                <option key={payment} value={payment}>
                  {payment}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-orders-reset"
              onClick={handleResetFilters}
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </section>

        {/* ERROR */}

        {error && <div className="admin-orders-error">{error}</div>}

        {/* LOADING */}

        {loading && (
          <div className="admin-orders-state">
            <span className="admin-orders-spinner" />

            <strong>Loading orders...</strong>
          </div>
        )}

        {/* EMPTY */}

        {!loading && orders.length === 0 && (
          <div className="admin-orders-state">
            <Package size={25} />

            <strong>No orders found</strong>

            <p>Try changing your search or filters.</p>
          </div>
        )}

        {/* ORDERS */}

        {!loading && orders.length > 0 && (
          <>
            {/* DESKTOP */}

            <div className="admin-orders-table-card">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="admin-order-number">
                          <strong>{order.order_number}</strong>

                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-customer">
                          <span className="admin-customer-avatar">
                            <UserRound size={12} />
                          </span>

                          <div>
                            <strong>{order.customer_name}</strong>

                            <span>
                              {order.customer_email ||
                                order.customer_phone ||
                                "Customer"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong className="admin-order-total">
                          {formatPrice(order.total)}
                        </strong>
                      </td>

                      <td>
                        <select
                          className={`admin-order-select status-${order.status}`}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            updateOrderStatus(order.id, event.target.value)
                          }
                        >
                          {orderStatuses.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <select
                          className={`admin-payment-select payment-${order.payment_status}`}
                          value={order.payment_status}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            updatePaymentStatus(order.id, event.target.value)
                          }
                        >
                          {paymentStatuses.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-order-view"
                        >
                          <Eye size={13} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="admin-orders-mobile-list">
              {orders.map((order) => (
                <article key={order.id} className="admin-mobile-order-card">
                  <div className="admin-mobile-order-top">
                    <div>
                      <span>ORDER</span>

                      <strong>{order.order_number}</strong>

                      <small>{formatDate(order.created_at)}</small>
                    </div>

                    <strong className="admin-mobile-order-price">
                      {formatPrice(order.total)}
                    </strong>
                  </div>

                  <div className="admin-mobile-customer">
                    <UserRound size={12} />

                    <span>{order.customer_name}</span>
                  </div>

                  <div className="admin-mobile-order-controls">
                    <div>
                      <label>Status</label>

                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          updateOrderStatus(order.id, event.target.value)
                        }
                      >
                        {orderStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Payment</label>

                      <select
                        value={order.payment_status}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          updatePaymentStatus(order.id, event.target.value)
                        }
                      >
                        {paymentStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="admin-mobile-view"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* PAGINATION */}

            <footer className="admin-orders-pagination">
              <span>
                {currentPageStart}–{currentPageEnd} of {total}
              </span>

              <div>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setLoading(true);

                    setPage((current) => current - 1);
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                <strong>{page}</strong>

                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() => {
                    setLoading(true);

                    setPage((current) => current + 1);
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminOrders;
