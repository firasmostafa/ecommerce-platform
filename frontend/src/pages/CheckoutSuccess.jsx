import {
  CheckCircle2,
  FileText,
  ShoppingBag,
  ClipboardList,
  Home,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import { useCurrency } from "../context/useCurrency";

import "./CheckoutSuccess.css";

function CheckoutSuccess() {
  const location = useLocation();

  const { formatPrice } = useCurrency();

  const order = location.state?.order;

  if (!order) {
    return (
      <main className="checkout-success-page">
        <div className="checkout-success-card">
          <FileText size={42} />

          <h1>No Order Found</h1>

          <p>
            We could not find the order details for this page.
          </p>

          <div className="checkout-success-actions">
            <Link
              to="/products"
              className="checkout-success-primary"
            >
              <ShoppingBag size={15} />
              Continue Shopping
            </Link>

            <Link
              to="/my-orders"
              className="checkout-success-secondary"
            >
              <ClipboardList size={15} />
              My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-success-page">
      <div className="checkout-success-card">
        <div className="checkout-success-icon">
          <CheckCircle2 size={44} />
        </div>

        <span>ORDER CONFIRMED</span>

        <h1>Thank You for Your Order!</h1>

        <p>
          Your order has been placed successfully
          and is now waiting for confirmation.
        </p>

        <div className="checkout-success-details">
          <div>
            <span>Order Number</span>

            <strong>
              {order.order_number}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong>
              {order.status}
            </strong>
          </div>

          <div>
            <span>Payment</span>

            <strong>
              {order.payment_status}
            </strong>
          </div>

          <div>
            <span>Total</span>

            <strong>
              {formatPrice(
                order.total
              )}
            </strong>
          </div>
        </div>

        <div className="checkout-success-actions">
          <Link
            to={`/orders/${order.id}`}
            className="checkout-success-order"
          >
            <ClipboardList size={15} />
            View Order Details
          </Link>

          <Link
            to="/products"
            className="checkout-success-primary"
          >
            <ShoppingBag size={15} />
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="checkout-success-secondary"
          >
            <Home size={15} />
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CheckoutSuccess;