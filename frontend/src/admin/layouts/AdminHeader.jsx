import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tags,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../../context/auth-context";

import "./AdminHeader.css";

function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();

    await logout();
  };

  return (
    <>
      <header className="admin-header">
        <div className="admin-header-container">
          <NavLink
            to="/admin"
            end
            className="admin-brand"
            onClick={closeMenu}
          >
            <span className="admin-brand-icon">N</span>

            <span className="admin-brand-content">
              <strong>NOVA</strong>
              <small>ADMIN</small>
            </span>
          </NavLink>

          <nav className="admin-desktop-navigation">
            <NavLink to="/admin" end>
              <LayoutDashboard size={14} />
              Dashboard
            </NavLink>

            <NavLink to="/admin/orders">
              <ShoppingBag size={14} />
              Orders
            </NavLink>

            <NavLink to="/admin/products">
              <Boxes size={14} />
              Products
            </NavLink>

            <NavLink to="/admin/categories">
              <Tags size={14} />
              Categories
            </NavLink>

            <NavLink to="/admin/customers">
              <Users size={14} />
              Customers
            </NavLink>

            <NavLink to="/admin/settings">
              <Settings size={14} />
              Settings
            </NavLink>

            <NavLink to="/admin/admins">
              <UserCog size={14} />
              Admins
            </NavLink>
          </nav>

          <div className="admin-header-actions">
            <div className="admin-header-user">
              <span className="admin-header-user-icon">
                <UserCog size={13} />
              </span>

              <div>
                <small>Administrator</small>
                <strong>{user?.name || "Admin"}</strong>
              </div>
            </div>

            <button
              type="button"
              className="admin-header-logout"
              onClick={handleLogout}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>

            <button
              type="button"
              className="admin-header-menu-button"
              aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`admin-mobile-navigation ${
          menuOpen ? "admin-mobile-navigation-open" : ""
        }`}
      >
        <nav>
          <NavLink to="/admin" end onClick={closeMenu}>
            <LayoutDashboard size={14} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/orders" onClick={closeMenu}>
            <ShoppingBag size={14} />
            Orders
          </NavLink>

          <NavLink to="/admin/products" onClick={closeMenu}>
            <Boxes size={14} />
            Products
          </NavLink>

          <NavLink to="/admin/categories" onClick={closeMenu}>
            <Tags size={14} />
            Categories
          </NavLink>

          <NavLink to="/admin/customers" onClick={closeMenu}>
            <Users size={14} />
            Customers
          </NavLink>

          <NavLink to="/admin/settings" onClick={closeMenu}>
            <Settings size={14} />
            Settings
          </NavLink>

          <NavLink to="/admin/admins" onClick={closeMenu}>
            <UserCog size={14} />
            Admins
          </NavLink>

          <button type="button" onClick={handleLogout}>
            <LogOut size={14} />
            Logout
          </button>
        </nav>
      </div>
    </>
  );
}

export default AdminHeader;