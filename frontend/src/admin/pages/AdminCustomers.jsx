import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Eye,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminCustomers.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

function AdminCustomers() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(Boolean(token));

  const [error, setError] = useState("");

  /* ========================================
     LOAD CUSTOMERS
  ======================================== */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    const loadCustomers = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },
        });

        if (cancelled) {
          return;
        }

        const data = response.data?.data || [];

        setCustomers(Array.isArray(data) ? data : []);

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load customers:", err);

        setError(err.response?.data?.message || "Unable to load customers.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* ========================================
     FILTER
  ======================================== */

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(value) ||
        customer.email?.toLowerCase().includes(value) ||
        customer.phone?.toLowerCase().includes(value),
    );
  }, [customers, search]);

  /* ========================================
     SUMMARY
  ======================================== */

  const totalCustomers = customers.length;

  const totalOrders = customers.reduce(
    (total, customer) => total + Number(customer.orders_count || 0),
    0,
  );

  const totalSpent = customers.reduce(
    (total, customer) => total + Number(customer.total_spent || 0),
    0,
  );

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

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="admin-customers-page">
        <div className="admin-customers-container">
          <div className="admin-customers-state">
            <span className="admin-customers-spinner" />

            <strong>Loading customers...</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-customers-page">
      <div className="admin-customers-container">
        {/* =================================
            HEADER
        ================================= */}

        <header className="admin-customers-heading">
          <span>CUSTOMER MANAGEMENT</span>

          <h1>Customers</h1>

          <p>View registered customers, their orders and spending.</p>
        </header>

        {/* =================================
            ERROR
        ================================= */}

        {error && <div className="admin-customers-error">{error}</div>}

        {/* =================================
            SUMMARY
        ================================= */}

        <section className="admin-customers-summary">
          <article>
            <span>
              <Users size={16} />
            </span>

            <div>
              <small>Customers</small>

              <strong>{totalCustomers}</strong>
            </div>
          </article>

          <article>
            <span>
              <ShoppingBag size={16} />
            </span>

            <div>
              <small>Orders</small>

              <strong>{totalOrders}</strong>
            </div>
          </article>

          <article>
            <span>$</span>

            <div>
              <small>Paid Spending</small>

              <strong>{formatMoney(totalSpent)}</strong>
            </div>
          </article>
        </section>

        {/* =================================
            SEARCH
        ================================= */}

        <section className="admin-customers-toolbar">
          <div className="admin-customers-search">
            <Search size={14} />

            <input
              type="search"
              value={search}
              placeholder="Search name, email or phone..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        {/* =================================
            CUSTOMERS
        ================================= */}

        {filteredCustomers.length > 0 ? (
          <section className="admin-customers-list">
            {filteredCustomers.map((customer) => (
              <article className="admin-customer-row" key={customer.id}>
                {/* IDENTITY */}

                <div className="admin-customer-identity">
                  <span className="admin-customer-avatar">
                    <UserRound size={18} />
                  </span>

                  <div>
                    <strong>{customer.name}</strong>

                    <small>Customer #{customer.id}</small>
                  </div>
                </div>

                {/* CONTACT */}

                <div className="admin-customer-contact">
                  <div>
                    <Mail size={12} />

                    <span>{customer.email}</span>
                  </div>

                  <div>
                    <Phone size={12} />

                    <span>{customer.phone || "No phone"}</span>
                  </div>
                </div>

                {/* ORDERS */}

                <div className="admin-customer-stat">
                  <span>Orders</span>

                  <strong>{customer.orders_count || 0}</strong>
                </div>

                {/* SPENT */}

                <div className="admin-customer-stat">
                  <span>Paid Spending</span>

                  <strong>{formatMoney(customer.total_spent)}</strong>
                </div>

                {/* DATE */}

                <div className="admin-customer-date">
                  <CalendarDays size={12} />

                  <div>
                    <span>Joined</span>

                    <strong>{formatDate(customer.created_at)}</strong>
                  </div>
                </div>

                {/* ACTION */}

                <div className="admin-customer-actions">
                  <Link to={`/admin/customers/${customer.id}`}>
                    <Eye size={12} />
                    View
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="admin-customers-state">
            <Users size={25} />

            <strong>No customers found</strong>

            <p>Try another search.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminCustomers;
