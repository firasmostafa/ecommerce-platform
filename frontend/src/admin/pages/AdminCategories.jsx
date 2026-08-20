import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Edit3,
  FolderOpen,
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminCategories.css";

const API_URL =
  "http://127.0.0.1:8000/api";

const STORAGE_URL =
  "http://127.0.0.1:8000/storage";

const initialForm = {
  name: "",
  description: "",
};

function AdminCategories() {
  const { token } = useAuth();

  const [categories, setCategories] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [image, setImage] =
    useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  /* ========================================
     LOAD CATEGORIES
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response =
          await axios.get(
            `${API_URL}/categories`
          );

        if (cancelled) {
          return;
        }

        const data =
          response.data?.data?.data ||
          response.data?.data ||
          [];

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load categories:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load categories."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ========================================
     AUTO HIDE SUCCESS
  ======================================== */

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer =
      window.setTimeout(() => {
        setSuccess("");
      }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [success]);

  /* ========================================
     CLEAN IMAGE PREVIEW
  ======================================== */

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  /* ========================================
     FILTER
  ======================================== */

  const filteredCategories =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            ?.toLowerCase()
            .includes(value) ||
          category.slug
            ?.toLowerCase()
            .includes(value) ||
          category.description
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      categories,
      search,
    ]);

  /* ========================================
     HELPERS
  ======================================== */

  const getCategoryImage = (
    category
  ) => {
    if (!category?.image) {
      return null;
    }

    if (
      category.image.startsWith(
        "http"
      )
    ) {
      return category.image;
    }

    return `${STORAGE_URL}/${category.image}`;
  };

  const getProductCount = (
    category
  ) => {
    return (
      category.products_count ??
      category.products?.length ??
      0
    );
  };

  /* ========================================
     OPEN ADD FORM
  ======================================== */

  const handleAdd = () => {
    setEditingCategory(null);

    setForm(initialForm);

    setImage(null);
    setImagePreview("");

    setError("");

    setFormOpen(true);
  };

  /* ========================================
     OPEN EDIT FORM
  ======================================== */

  const handleEdit = (
    category
  ) => {
    setEditingCategory(
      category
    );

    setForm({
      name:
        category.name || "",

      description:
        category.description || "",
    });

    setImage(null);

    setImagePreview(
      getCategoryImage(
        category
      ) || ""
    );

    setError("");

    setFormOpen(true);
  };

  /* ========================================
     CLOSE FORM
  ======================================== */

  const handleCloseForm = () => {
    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setFormOpen(false);

    setEditingCategory(null);

    setForm(initialForm);

    setImage(null);
    setImagePreview("");

    setError("");
  };

  /* ========================================
     INPUT CHANGE
  ======================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setError("");
  };

  /* ========================================
     IMAGE CHANGE
  ======================================== */

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  /* ========================================
     SAVE CATEGORY
  ======================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Category name is required."
      );

      return;
    }

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      let response;

      if (editingCategory) {
        formData.append(
          "_method",
          "PUT"
        );

        response =
          await axios.post(
            `${API_URL}/admin/categories/${editingCategory.id}`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );
      } else {
        response =
          await axios.post(
            `${API_URL}/admin/categories`,
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );
      }

      const savedCategory =
        response.data?.data ||
        response.data;

      if (editingCategory) {
        setCategories(
          (current) =>
            current.map(
              (category) =>
                category.id ===
                editingCategory.id
                  ? {
                      ...category,
                      ...savedCategory,
                    }
                  : category
            )
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        setCategories(
          (current) => [
            savedCategory,
            ...current,
          ]
        );

        setSuccess(
          "Category created successfully."
        );
      }

      handleCloseForm();
    } catch (err) {
      console.error(
        "Failed to save category:",
        err
      );

      const errors =
        err.response?.data?.errors;

      if (errors) {
        const firstError =
          Object.values(errors)
            .flat()
            .find(Boolean);

        setError(
          firstError ||
            "Please check the category information."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to save category."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* ========================================
     DELETE CATEGORY
  ======================================== */

  const handleDelete = async (
    category
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        category.id
      );

      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/admin/categories/${category.id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },
        }
      );

      setCategories(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              category.id
          )
      );

      setSuccess(
        `"${category.name}" deleted successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete this category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="admin-categories-page">
        <div className="admin-categories-container">
          <div className="admin-categories-state">
            <span className="admin-categories-spinner" />

            <strong>
              Loading categories...
            </strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-categories-page">
      <div className="admin-categories-container">

        {/* HEADER */}

        <header className="admin-categories-heading">
          <div>
            <span>
              STORE ORGANIZATION
            </span>

            <h1>
              Categories
            </h1>

            <p>
              Organize products into
              clear store categories.
            </p>
          </div>

          <button
            type="button"
            className="admin-category-add"
            onClick={handleAdd}
          >
            <Plus size={14} />

            Add Category
          </button>
        </header>

        {/* SUCCESS */}

        {success && (
          <div className="admin-categories-success">
            <CheckCircle2
              size={16}
            />

            <strong>
              {success}
            </strong>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              aria-label="Close success message"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ERROR */}

        {error &&
          !formOpen && (
            <div className="admin-categories-error">
              {error}
            </div>
          )}

        {/* SUMMARY */}

        <section className="admin-categories-summary">
          <article>
            <span>
              <FolderOpen
                size={16}
              />
            </span>

            <div>
              <small>
                Categories
              </small>

              <strong>
                {
                  categories.length
                }
              </strong>
            </div>
          </article>

          <article>
            <span>
              <Package
                size={16}
              />
            </span>

            <div>
              <small>
                Products
              </small>

              <strong>
                {categories.reduce(
                  (
                    total,
                    category
                  ) =>
                    total +
                    Number(
                      getProductCount(
                        category
                      )
                    ),
                  0
                )}
              </strong>
            </div>
          </article>
        </section>

        {/* SEARCH */}

        <section className="admin-categories-toolbar">
          <div className="admin-categories-search">
            <Search size={14} />

            <input
              type="search"
              value={search}
              placeholder="Search categories..."
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setSearch("")
            }
          >
            <RefreshCw
              size={13}
            />

            Reset
          </button>
        </section>

        {/* CATEGORIES */}

        {filteredCategories.length >
        0 ? (
          <section className="admin-categories-grid">
            {filteredCategories.map(
              (category) => {
                const imageUrl =
                  getCategoryImage(
                    category
                  );

                return (
                  <article
                    className="admin-category-card"
                    key={
                      category.id
                    }
                  >
                    <div className="admin-category-image">
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl
                          }
                          alt={
                            category.name
                          }
                        />
                      ) : (
                        <FolderOpen
                          size={24}
                        />
                      )}
                    </div>

                    <div className="admin-category-content">
                      <div className="admin-category-title">
                        <div>
                          <strong>
                            {
                              category.name
                            }
                          </strong>

                          <span>
                            {category.slug ||
                              "category"}
                          </span>
                        </div>

                        <span className="admin-category-count">
                          {getProductCount(
                            category
                          )}{" "}
                          products
                        </span>
                      </div>

                      <p>
                        {category.description ||
                          "No description added for this category."}
                      </p>

                      <div className="admin-category-actions">
                        <button
                          type="button"
                          className="edit"
                          onClick={() =>
                            handleEdit(
                              category
                            )
                          }
                        >
                          <Edit3
                            size={12}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete"
                          disabled={
                            deletingId ===
                            category.id
                          }
                          onClick={() =>
                            handleDelete(
                              category
                            )
                          }
                        >
                          <Trash2
                            size={12}
                          />

                          {deletingId ===
                          category.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        ) : (
          <div className="admin-categories-state">
            <FolderOpen
              size={25}
            />

            <strong>
              No categories found
            </strong>

            <p>
              Try another search or
              create a new category.
            </p>
          </div>
        )}
      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ====================================== */}

      {formOpen && (
        <div
          className="admin-category-modal-backdrop"
          onMouseDown={
            handleCloseForm
          }
        >
          <div
            className="admin-category-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  CATEGORY MANAGEMENT
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p>
                  {editingCategory
                    ? "Update category information."
                    : "Create a new store category."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseForm
                }
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>

            {error && (
              <div className="admin-category-form-error">
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
            >
              <label className="admin-category-field">
                <span>
                  Category Name *
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  placeholder="Category name"
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label className="admin-category-field">
                <span>
                  Description
                </span>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  rows="4"
                  placeholder="Short category description..."
                  onChange={
                    handleChange
                  }
                />
              </label>

              <div className="admin-category-field">
                <span>
                  Category Image
                </span>

                <label className="admin-category-upload">
                  {imagePreview ? (
                    <img
                      src={
                        imagePreview
                      }
                      alt="Category preview"
                    />
                  ) : (
                    <>
                      <ImagePlus
                        size={22}
                      />

                      <strong>
                        Choose Image
                      </strong>

                      <small>
                        JPG, PNG or WEBP
                      </small>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleImageChange
                    }
                  />
                </label>
              </div>

              <div className="admin-category-form-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={
                    handleCloseForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminCategories;