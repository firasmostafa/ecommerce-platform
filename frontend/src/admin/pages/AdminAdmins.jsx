import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  X,
} from "lucide-react";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminAdmins.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
};

function AdminAdmins() {
  const { token, user } = useAuth();

  const [admins, setAdmins] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(Boolean(token));

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ========================================
     LOAD ADMINS
  ======================================== */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    const loadAdmins = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/admins`, {
          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },
        });

        if (cancelled) {
          return;
        }

        const data = response.data?.data || [];

        setAdmins(Array.isArray(data) ? data : []);

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load administrators:", err);

        setError(
          err.response?.data?.message || "Unable to load administrators.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAdmins();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* ========================================
     AUTO HIDE SUCCESS
  ======================================== */

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [success]);

  /* ========================================
     FILTER ADMINS
  ======================================== */

  const filteredAdmins = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return admins;
    }

    return admins.filter(
      (admin) =>
        admin.name?.toLowerCase().includes(value) ||
        admin.email?.toLowerCase().includes(value) ||
        admin.phone?.toLowerCase().includes(value),
    );
  }, [admins, search]);

  /* ========================================
     OPEN ADD FORM
  ======================================== */

  const handleAdd = () => {
    setEditingAdmin(null);

    setForm(initialForm);

    setError("");
    setSuccess("");

    setFormOpen(true);
  };

  /* ========================================
     OPEN EDIT FORM
  ======================================== */

  const handleEdit = (admin) => {
    setEditingAdmin(admin);

    setForm({
      name: admin.name || "",

      email: admin.email || "",

      phone: admin.phone || "",

      password: "",

      password_confirmation: "",
    });

    setError("");
    setSuccess("");

    setFormOpen(true);
  };

  /* ========================================
     CLOSE FORM
  ======================================== */

  const handleCloseForm = () => {
    setFormOpen(false);

    setEditingAdmin(null);

    setForm(initialForm);

    setError("");
  };

  /* ========================================
     INPUT CHANGE
  ======================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  /* ========================================
     SAVE ADMIN
  ======================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Administrator name is required.");

      return;
    }

    if (!form.email.trim()) {
      setError("Administrator email is required.");

      return;
    }

    if (!editingAdmin && !form.password) {
      setError("Password is required for a new administrator.");

      return;
    }

    if (form.password && form.password !== form.password_confirmation) {
      setError("Password confirmation does not match.");

      return;
    }

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),

        email: form.email.trim(),

        phone: form.phone.trim() || null,
      };

      if (form.password) {
        payload.password = form.password;

        payload.password_confirmation = form.password_confirmation;
      }

      let response;

      if (editingAdmin) {
        response = await axios.put(
          `${API_URL}/admin/admins/${editingAdmin.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,

              Accept: "application/json",
            },
          },
        );
      } else {
        response = await axios.post(`${API_URL}/admin/admins`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },
        });
      }

      const savedAdmin = response.data?.data;

      if (editingAdmin) {
        setAdmins((current) =>
          current.map((admin) =>
            admin.id === editingAdmin.id
              ? {
                  ...admin,
                  ...savedAdmin,
                }
              : admin,
          ),
        );

        setSuccess("Administrator updated successfully.");
      } else {
        setAdmins((current) => [savedAdmin, ...current]);

        setSuccess("Administrator created successfully.");
      }

      handleCloseForm();
    } catch (err) {
      console.error("Failed to save administrator:", err);

      const errors = err.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors).flat().find(Boolean);

        setError(firstError || "Please check the administrator information.");
      } else {
        setError(
          err.response?.data?.message || "Unable to save administrator.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* ========================================
     DELETE ADMIN
  ======================================== */

  const handleDelete = async (admin) => {
    if (Number(user?.id) === Number(admin.id)) {
      setError("You cannot delete your own administrator account.");

      return;
    }

    const confirmed = window.confirm(`Delete administrator "${admin.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(admin.id);

      setError("");
      setSuccess("");

      await axios.delete(`${API_URL}/admin/admins/${admin.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },
      });

      setAdmins((current) => current.filter((item) => item.id !== admin.id));

      setSuccess(`"${admin.name}" deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete administrator:", err);

      setError(
        err.response?.data?.message || "Unable to delete this administrator.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ========================================
     DATE FORMAT
  ======================================== */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="admin-admins-page">
        <div className="admin-admins-container">
          <div className="admin-admins-state">
            <span className="admin-admins-spinner" />

            <strong>Loading administrators...</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-admins-page">
      <div className="admin-admins-container">
        {/* =================================
            HEADER
        ================================= */}

        <header className="admin-admins-heading">
          <div>
            <span>ACCESS MANAGEMENT</span>

            <h1>Administrators</h1>

            <p>
              Manage accounts with access to the store administration panel.
            </p>
          </div>

          <button
            type="button"
            className="admin-admins-add"
            onClick={handleAdd}
          >
            <Plus size={14} />
            Add Admin
          </button>
        </header>

        {/* =================================
            SUCCESS
        ================================= */}

        {success && (
          <div className="admin-admins-message admin-admins-success">
            <CheckCircle2 size={15} />

            <strong>{success}</strong>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Close success message"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* =================================
            ERROR
        ================================= */}

        {error && !formOpen && (
          <div className="admin-admins-message admin-admins-error">{error}</div>
        )}

        {/* =================================
            SUMMARY
        ================================= */}

        <section className="admin-admins-summary">
          <span>
            <ShieldCheck size={17} />
          </span>

          <div>
            <small>Administrator Accounts</small>

            <strong>{admins.length}</strong>
          </div>
        </section>

        {/* =================================
            SEARCH
        ================================= */}

        <section className="admin-admins-toolbar">
          <div className="admin-admins-search">
            <Search size={14} />

            <input
              type="search"
              value={search}
              placeholder="Search administrators..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        {/* =================================
            ADMIN GRID
        ================================= */}

        {filteredAdmins.length > 0 ? (
          <section className="admin-admins-grid">
            {filteredAdmins.map((admin) => {
              const isCurrentAdmin = Number(user?.id) === Number(admin.id);

              return (
                <article className="admin-admin-card" key={admin.id}>
                  <div className="admin-admin-card-top">
                    <div className="admin-admin-avatar">
                      <UserCog size={19} />
                    </div>

                    <div className="admin-admin-identity">
                      <div className="admin-admin-name-row">
                        <h2>{admin.name}</h2>

                        {isCurrentAdmin && <span>You</span>}
                      </div>

                      <small>Administrator</small>
                    </div>
                  </div>

                  <div className="admin-admin-details">
                    <div>
                      <Mail size={12} />

                      <span>{admin.email}</span>
                    </div>

                    <div>
                      <Phone size={12} />

                      <span>{admin.phone || "No phone"}</span>
                    </div>
                  </div>

                  <div className="admin-admin-meta">
                    <span>Added</span>

                    <strong>{formatDate(admin.created_at)}</strong>
                  </div>

                  <div className="admin-admin-actions">
                    <button
                      type="button"
                      className="edit"
                      onClick={() => handleEdit(admin)}
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      disabled={isCurrentAdmin || deletingId === admin.id}
                      onClick={() => handleDelete(admin)}
                    >
                      <Trash2 size={12} />

                      {deletingId === admin.id
                        ? "Deleting..."
                        : isCurrentAdmin
                          ? "Your Account"
                          : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="admin-admins-state">
            <UserCog size={24} />

            <strong>No administrators found</strong>

            <p>Try another search or create a new administrator.</p>
          </div>
        )}
      </div>

      {/* =====================================
          ADD / EDIT ADMIN MODAL
      ====================================== */}

      {formOpen && (
        <div
          className="admin-admin-modal-backdrop"
          onMouseDown={handleCloseForm}
        >
          <div
            className="admin-admin-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>ACCESS MANAGEMENT</span>

                <h2>
                  {editingAdmin ? "Edit Administrator" : "Add Administrator"}
                </h2>

                <p>
                  {editingAdmin
                    ? "Update administrator account information."
                    : "Create a new account with administrator access."}
                </p>
              </div>

              <button
                type="button"
                className="admin-admin-modal-close"
                onClick={handleCloseForm}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>

            {error && <div className="admin-admin-form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="admin-admin-field">
                <span>Name *</span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  placeholder="Administrator name"
                  onChange={handleChange}
                />
              </label>

              <label className="admin-admin-field">
                <span>Email *</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="admin@example.com"
                  onChange={handleChange}
                />
              </label>

              <label className="admin-admin-field">
                <span>Phone</span>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  placeholder="+961 ..."
                  onChange={handleChange}
                />
              </label>

              <label className="admin-admin-field">
                <span>
                  Password
                  {editingAdmin ? " (optional)" : " *"}
                </span>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  placeholder={
                    editingAdmin
                      ? "Leave blank to keep current password"
                      : "Minimum 8 characters"
                  }
                  onChange={handleChange}
                />
              </label>

              <label className="admin-admin-field">
                <span>
                  Confirm Password
                  {editingAdmin ? "" : " *"}
                </span>

                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  placeholder="Repeat password"
                  onChange={handleChange}
                />
              </label>

              <div className="admin-admin-form-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

                <button type="submit" className="save" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingAdmin
                      ? "Update Admin"
                      : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminAdmins;
