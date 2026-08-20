import { Outlet } from "react-router-dom";

import AdminHeader from "./AdminHeader.jsx";

import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminHeader />

      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;