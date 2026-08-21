import { useEffect, useState } from "react";
import axios from "axios";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  DollarSign,
  Package,
  ShoppingBag,
  Truck,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/auth-context";

import "./AdminDashboard.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

function AdminDashboard() {
  const { token } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (cancelled) {
          return;
        }

        setDashboard(response.data.data);
        setError("");
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load admin dashboard:", err);

        setError(err.response?.data?.message || "Unable to load dashboard.");

        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-state">
          <Package size={30} />

          <h2>Loading dashboard...</h2>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-state">
          <XCircle size={30} />

          <h2>Dashboard unavailable</h2>

          <p>{error || "Dashboard data could not be loaded."}</p>
        </div>
      </main>
    );
  }

  const {
    summary,
    orders,
    payments,
    recent_orders: recentOrders,
    low_stock_products: lowStockProducts,
    best_selling_products: bestSellingProducts,
    sales_by_month: salesByMonth,
  } = dashboard;

  const orderStatuses = [
    {
      label: "Pending",
      value: orders.pending,
      icon: Clock3,
      className: "pending",
    },
    {
      label: "Confirmed",
      value: orders.confirmed,
      icon: CheckCircle2,
      className: "confirmed",
    },
    {
      label: "Processing",
      value: orders.processing,
      icon: Package,
      className: "processing",
    },
    {
      label: "Shipped",
      value: orders.shipped,
      icon: Truck,
      className: "shipped",
    },
    {
      label: "Delivered",
      value: orders.delivered,
      icon: CheckCircle2,
      className: "delivered",
    },
    {
      label: "Cancelled",
      value: orders.cancelled,
      icon: XCircle,
      className: "cancelled",
    },
  ];

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <div>
            <span>ADMIN PANEL</span>

            <h1>Dashboard</h1>

            <p>Store performance, orders and inventory.</p>
          </div>

          <div className="admin-dashboard-payment">
            <span>Payments</span>

            <strong>{payments.paid} Paid</strong>

            <small>{payments.unpaid} Unpaid</small>
          </div>
        </header>

        <section className="admin-summary-grid">
          <article className="admin-summary-card">
            <div className="admin-summary-icon revenue">
              <DollarSign size={18} />
            </div>

            <div>
              <span>Total Revenue</span>

              <strong>{formatMoney(summary.total_revenue)}</strong>

              <small>Paid revenue</small>
            </div>
          </article>

          <article className="admin-summary-card">
            <div className="admin-summary-icon orders">
              <ShoppingBag size={18} />
            </div>

            <div>
              <span>Total Orders</span>

              <strong>{summary.total_orders}</strong>

              <small>All orders</small>
            </div>
          </article>

          <article className="admin-summary-card">
            <div className="admin-summary-icon customers">
              <Users size={18} />
            </div>

            <div>
              <span>Customers</span>

              <strong>{summary.total_customers}</strong>

              <small>Registered users</small>
            </div>
          </article>

          <article className="admin-summary-card">
            <div className="admin-summary-icon products">
              <Boxes size={18} />
            </div>

            <div>
              <span>Products</span>

              <strong>{summary.total_products}</strong>

              <small>Store products</small>
            </div>
          </article>
        </section>

        <section className="admin-dashboard-main-grid">
          <article className="admin-panel-card">
            <div className="admin-panel-heading">
              <div>
                <span>SALES</span>

                <h2>Sales Overview</h2>
              </div>

              <DollarSign size={18} />
            </div>

            <div className="admin-sales-list">
              {salesByMonth.length > 0 ? (
                salesByMonth.map((month) => (
                  <div
                    className="admin-sales-row"
                    key={`${month.year}-${month.month}`}
                  >
                    <div>
                      <strong>
                        {new Date(
                          month.year,
                          month.month - 1,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>

                      <span>{month.orders_count} orders</span>
                    </div>

                    <strong>{formatMoney(month.revenue)}</strong>
                  </div>
                ))
              ) : (
                <div className="admin-empty">No sales data yet.</div>
              )}
            </div>
          </article>

          <article className="admin-panel-card">
            <div className="admin-panel-heading">
              <div>
                <span>ORDERS</span>

                <h2>Order Status</h2>
              </div>

              <Package size={18} />
            </div>

            <div className="admin-status-list">
              {orderStatuses.map((status) => {
                const Icon = status.icon;

                return (
                  <div className="admin-status-row" key={status.label}>
                    <div>
                      <span className={`admin-status-icon ${status.className}`}>
                        <Icon size={12} />
                      </span>

                      <strong>{status.label}</strong>
                    </div>

                    <span>{status.value}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="admin-panel-card admin-recent-orders">
          <div className="admin-panel-heading">
            <div>
              <span>RECENT</span>

              <h2>Recent Orders</h2>
            </div>

            <ShoppingBag size={18} />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>

                    <td>{order.customer_name}</td>

                    <td>{formatDate(order.created_at)}</td>

                    <td>
                      <strong>{formatMoney(order.total)}</strong>
                    </td>

                    <td>
                      <span
                        className={`admin-badge payment-${order.payment_status}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    <td>
                      <span className={`admin-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-dashboard-main-grid">
          <article className="admin-panel-card">
            <div className="admin-panel-heading">
              <div>
                <span>INVENTORY</span>

                <h2>Low Stock</h2>
              </div>

              <AlertTriangle size={18} />
            </div>

            <div className="admin-product-list">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div className="admin-product-row" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>

                      <span>{product.sku}</span>
                    </div>

                    <span className="admin-stock-warning">
                      {product.stock} left
                    </span>
                  </div>
                ))
              ) : (
                <div className="admin-empty">Stock levels look good.</div>
              )}
            </div>
          </article>

          <article className="admin-panel-card">
            <div className="admin-panel-heading">
              <div>
                <span>PERFORMANCE</span>

                <h2>Best Sellers</h2>
              </div>

              <Boxes size={18} />
            </div>

            <div className="admin-product-list">
              {bestSellingProducts.length > 0 ? (
                bestSellingProducts.map((product, index) => (
                  <div
                    className="admin-product-row"
                    key={product.product_id || index}
                  >
                    <div>
                      <strong>{product.product_name}</strong>

                      <span>{product.total_quantity} sold</span>
                    </div>

                    <strong>{formatMoney(product.total_sales)}</strong>
                  </div>
                ))
              ) : (
                <div className="admin-empty">No sales yet.</div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
