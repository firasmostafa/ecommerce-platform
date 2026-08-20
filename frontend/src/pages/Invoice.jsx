import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  ReceiptText,
  User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/auth-context";
import "./Invoice.css";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

function Invoice() {
  const { orderId } = useParams();
  const { token } = useAuth();

  const [invoiceData, setInvoiceData] = useState(null);
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
    .get(`${API_URL}/orders/${orderId}/invoice`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
    .then((response) => {
      if (cancelled) {
        return;
      }

      setInvoiceData(response.data.data);
    })
    .catch((err) => {
      if (cancelled) {
        return;
      }

      console.error(
        "Failed to load invoice:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load this invoice."
      );
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

  const formatMoney = (value) => {
    const symbol =
      invoiceData?.store?.currency_symbol || "$";

    return `${symbol}${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatPaymentMethod = (method) => {
    if (!method) {
      return "—";
    }

    return method
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  if (loading) {
    return (
      <main className="invoice-page">
        <div className="invoice-state">
          <ReceiptText size={38} />
          <h2>Preparing your invoice</h2>
          <p>Please wait a moment...</p>
        </div>
      </main>
    );
  }

  if (error || !invoiceData) {
    return (
      <main className="invoice-page">
        <div className="invoice-state">
          <FileText size={38} />

          <h2>Invoice unavailable</h2>

          <p>
            {error || "Invoice could not be found."}
          </p>

          <Link to="/my-orders">
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const {
    invoice,
    store,
    customer,
    items,
    totals,
  } = invoiceData;

  return (
    <main className="invoice-page">
      <div className="invoice-page-container">
        {/* ACTIONS */}

        <div className="invoice-actions no-print">
          <Link
            to={`/orders/${orderId}`}
            className="invoice-back"
          >
            <ArrowLeft size={16} />
            Order Details
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>

        {/* DOCUMENT */}

        <article className="invoice-document">
          {/* TOP ACCENT */}

          <div className="invoice-top-accent" />

          {/* HEADER */}

          <header className="invoice-header">
            <div className="invoice-brand">
              {store.logo ? (
                <img
                  src={`${STORAGE_URL}/${store.logo}`}
                  alt={store.name}
                />
              ) : (
                <div className="invoice-logo-placeholder">
                  {store.name?.charAt(0) || "N"}
                </div>
              )}

              <div>
                <h1>{store.name}</h1>

                <p>
                  {store.description}
                </p>
              </div>
            </div>

            <div className="invoice-title">
              <span>INVOICE</span>

              <strong>
                {invoice.number}
              </strong>

              <div className="invoice-date">
                <CalendarDays size={12} />
                {formatDate(invoice.created_at)}
              </div>
            </div>
          </header>

          {/* INFORMATION */}

          <section className="invoice-information">
            <div className="invoice-info-card">
              <div className="invoice-info-title">
                <div className="invoice-info-icon">
                  <User size={15} />
                </div>

                <div>
                  <span>CUSTOMER</span>
                  <h3>Billing Details</h3>
                </div>
              </div>

              <strong className="invoice-customer-name">
                {customer.name}
              </strong>

              <div className="invoice-contact-line">
                <Mail size={12} />
                <span>{customer.email}</span>
              </div>

              <div className="invoice-contact-line">
                <Phone size={12} />
                <span>{customer.phone}</span>
              </div>

              <div className="invoice-contact-line">
                <MapPin size={12} />
                <span>
                  {[
                    customer.address,
                    customer.city,
                    customer.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>

            <div className="invoice-info-card">
              <div className="invoice-info-title">
                <div className="invoice-info-icon">
                  <CreditCard size={15} />
                </div>

                <div>
                  <span>PAYMENT</span>
                  <h3>Order Information</h3>
                </div>
              </div>

              <div className="invoice-meta-row">
                <span>Order Status</span>

                <strong
                  className={`invoice-status invoice-status-${invoice.status}`}
                >
                  {invoice.status}
                </strong>
              </div>

              <div className="invoice-meta-row">
                <span>Payment Status</span>

                <strong
                  className={`invoice-status invoice-status-${invoice.payment_status}`}
                >
                  {invoice.payment_status}
                </strong>
              </div>

              <div className="invoice-meta-row">
                <span>Payment Method</span>

                <strong>
                  {formatPaymentMethod(
                    invoice.payment_method
                  )}
                </strong>
              </div>
            </div>
          </section>

          {/* ITEMS */}

          <section className="invoice-items">
            <div className="invoice-section-heading">
              <div>
                <span>ORDER ITEMS</span>
                <h2>Your Purchase</h2>
              </div>

              <div className="invoice-item-count">
                <Package size={14} />
                {items?.length || 0}{" "}
                {(items?.length || 0) === 1
                  ? "Item"
                  : "Items"}
              </div>
            </div>

            <div className="invoice-table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {(items || []).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="invoice-product">
                          {item.image ? (
                            <img
                              src={`${STORAGE_URL}/${item.image}`}
                              alt={item.name}
                            />
                          ) : (
                            <div className="invoice-product-placeholder">
                              <Package size={17} />
                            </div>
                          )}

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            {item.sku && (
                              <span>
                                SKU: {item.sku}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        {formatMoney(
                          item.unit_price
                        )}
                      </td>

                      <td>
                        × {item.quantity}
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            item.line_total
                          )}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BOTTOM */}

        {/* =========================================
    FULL WIDTH PRICE SUMMARY
========================================= */}

<section className="invoice-full-summary">
  <div className="invoice-full-summary-header">
    <div className="invoice-full-summary-title">
      <ReceiptText size={17} />

      <span>PRICE SUMMARY</span>
    </div>

    <span>AMOUNT</span>
  </div>

  <div className="invoice-full-summary-body">
    <div className="invoice-summary-row">
      <div className="invoice-summary-row-label">
        <span>Subtotal</span>
      </div>

      <strong>
        {formatMoney(totals.subtotal)}
      </strong>
    </div>

    <div className="invoice-summary-row">
      <div className="invoice-summary-row-label">
        <span>Discount</span>
      </div>

      <strong
        className={
          Number(totals.discount || 0) > 0
            ? "invoice-summary-discount"
            : ""
        }
      >
        -
        {formatMoney(totals.discount)}
      </strong>
    </div>

    <div className="invoice-summary-row">
      <div className="invoice-summary-row-label">
        <span>Delivery</span>
      </div>

      <strong>
        {Number(totals.shipping || 0) === 0
          ? "FREE"
          : formatMoney(totals.shipping)}
      </strong>
    </div>

    <div className="invoice-summary-row">
      <div className="invoice-summary-row-label">
        <span>Tax</span>
      </div>

      <strong>
        {formatMoney(totals.tax)}
      </strong>
    </div>
  </div>

  <div className="invoice-summary-total">
    <div>
      <strong>TOTAL</strong>
      <span>Final amount to be paid</span>
    </div>

    <strong>
      {formatMoney(totals.total)}
    </strong>
  </div>
</section>

{/* =========================================
    PAYMENT INFORMATION
========================================= */}

<section className="invoice-payment-bar">
  <div className="invoice-payment-box">
    <div className="invoice-payment-icon">
      <CreditCard size={18} />
    </div>

    <div>
      <span>Payment Method</span>

      <strong>
        {formatPaymentMethod(
          invoice.payment_method
        )}
      </strong>
    </div>
  </div>

  <div className="invoice-payment-divider" />

  <div className="invoice-payment-box">
    <div className="invoice-payment-icon">
      <ReceiptText size={18} />
    </div>

    <div>
      <span>Payment Status</span>

      <strong
        className={`invoice-payment-${invoice.payment_status}`}
      >
        {invoice.payment_status}
      </strong>
    </div>
  </div>
</section>

{/* =========================================
    SELLER
========================================= */}

<section className="invoice-seller-footer">
  <div>
    <span>SOLD BY</span>

    <strong>{store.name}</strong>
  </div>

  <div className="invoice-seller-footer-details">
    {store.address && (
      <span>
        <MapPin size={11} />
        {store.address}
      </span>
    )}

    {store.email && (
      <span>
        <Mail size={11} />
        {store.email}
      </span>
    )}

    {store.phone && (
      <span>
        <Phone size={11} />
        {store.phone}
      </span>
    )}
  </div>
</section>

{customer.notes && (
  <section className="invoice-notes">
    <strong>ORDER NOTES</strong>
    <p>{customer.notes}</p>
  </section>
)}

          {/* FOOTER */}

          <footer className="invoice-footer">
            <div>
              <strong>
                Thank you for your order!
              </strong>

              <p>
                {store.invoice_footer ||
                  `Thank you for shopping with ${store.name}.`}
              </p>
            </div>

            <span>{invoice.number}</span>
          </footer>
        </article>
      </div>
    </main>
  );
}

export default Invoice;