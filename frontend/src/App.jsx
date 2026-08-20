import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Featured from "./pages/Featured";
import Sale from "./pages/Sale";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Invoice from "./pages/Invoice";

import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminOrderDetails from "./admin/pages/AdminOrderDetails";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminProductForm from "./admin/pages/AdminProductForm";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminAdmins from "./admin/pages/AdminAdmins";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminCustomerDetails from "./admin/pages/AdminCustomerDetails";


import Favorites from "./pages/Favorites";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================
            CUSTOMER AREA
        ================================= */}

        <Route element={<MainLayout />}>
        <Route
  path="/favorites"
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  }
/>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:slug"
            element={<ProductDetails />}
          />

          <Route
            path="/categories"
            element={<Categories />}
          />

          <Route
            path="/featured"
            element={<Featured />}
          />

          <Route
            path="/sale"
            element={<Sale />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout-success"
            element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId/invoice"
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
        </Route>

        {/* ================================
            ADMIN AREA
        ================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="orders/:orderId"
            element={<AdminOrderDetails />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="products/create"
            element={<AdminProductForm />}
          />

          <Route
            path="products/:productId/edit"
            element={<AdminProductForm />}
          />
       
        <Route
  path="categories"
  element={<AdminCategories />}
/> 
<Route
  path="settings"
  element={<AdminSettings />}
/>
<Route
  path="admins"
  element={<AdminAdmins />}
/>
<Route
  path="customers"
  element={<AdminCustomers />}
/>
<Route
  path="customers/:customerId"
  element={<AdminCustomerDetails />}
/>
</Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;