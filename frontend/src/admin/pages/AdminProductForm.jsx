import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Package,
  Save,
  Star,
  Tag,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminProductForm.css";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

const initialForm = {
  name: "",
  sku: "",
  category_id: "",
  price: "",
  sale_price: "",
  stock: "",
  low_stock_threshold: "5",
  short_description: "",
  description: "",
  is_active: true,
  is_featured: false,
};

function AdminProductForm() {
  const { productId } = useParams();

  const navigate = useNavigate();

  const { token } = useAuth();

  const isEditMode = Boolean(productId);

  const [form, setForm] =
    useState(initialForm);

  const [categories, setCategories] =
    useState([]);

  const [images, setImages] =
    useState([]);

  const [imagePreviews, setImagePreviews] =
    useState([]);

  const [existingImages, setExistingImages] =
    useState([]);

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ========================================
     LOAD CATEGORIES + PRODUCT
  ======================================== */

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const categoriesResponse =
          await axios.get(
            `${API_URL}/categories`
          );

        if (cancelled) {
          return;
        }

        const categoriesData =
          categoriesResponse.data?.data?.data ||
          categoriesResponse.data?.data ||
          [];

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );

        if (!isEditMode) {
          setLoading(false);
          return;
        }

        const productResponse =
          await axios.get(
            `${API_URL}/products/${productId}`
          );

        if (cancelled) {
          return;
        }

        const product =
          productResponse.data?.data ||
          productResponse.data;

        setForm({
          name:
            product?.name || "",

          sku:
            product?.sku || "",

          category_id:
            product?.category_id ||
            product?.category?.id ||
            "",

          price:
            product?.price ?? "",

          sale_price:
            product?.sale_price ?? "",

          stock:
            product?.stock ?? "",

          low_stock_threshold:
            product?.low_stock_threshold ?? 5,

          short_description:
            product?.short_description ||
            "",

          description:
            product?.description || "",

          is_active:
            Boolean(product?.is_active),

          is_featured:
            Boolean(product?.is_featured),
        });

        setExistingImages(
          Array.isArray(product?.images)
            ? product.images
            : []
        );

        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load product form:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load product information."
        );

        setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    productId,
    isEditMode,
  ]);

  /* ========================================
     CLEAN IMAGE PREVIEWS
  ======================================== */

  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(preview);
        }
      );
    };
  }, [imagePreviews]);

  /* ========================================
     INPUT CHANGE
  ======================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================
     IMAGE CHANGE
  ======================================== */

  const handleImagesChange = (event) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    imagePreviews.forEach(
      (preview) => {
        URL.revokeObjectURL(preview);
      }
    );

    setImages(selectedFiles);

    setImagePreviews(
      selectedFiles.map((file) =>
        URL.createObjectURL(file)
      )
    );
  };

  /* ========================================
     VALIDATION
  ======================================== */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.category_id) {
      return "Please select a category.";
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      return "Please enter a valid price.";
    }

    if (
      form.sale_price !== "" &&
      Number(form.sale_price) < 0
    ) {
      return "Sale price cannot be negative.";
    }

    if (
      form.sale_price !== "" &&
      Number(form.sale_price) >=
        Number(form.price)
    ) {
      return "Sale price must be lower than the regular price.";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      return "Please enter valid stock.";
    }

    if (
      form.low_stock_threshold === "" ||
      Number(form.low_stock_threshold) < 0
    ) {
      return "Please enter a valid low stock warning value.";
    }

    return "";
  };

  /* ========================================
     SUBMIT
  ======================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
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
        "sku",
        form.sku.trim()
      );

      formData.append(
        "category_id",
        form.category_id
      );

      formData.append(
        "price",
        form.price
      );

      if (form.sale_price !== "") {
        formData.append(
          "sale_price",
          form.sale_price
        );
      }

      formData.append(
        "stock",
        form.stock
      );

      formData.append(
        "low_stock_threshold",
        form.low_stock_threshold
      );

      formData.append(
        "short_description",
        form.short_description
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "is_active",
        form.is_active ? "1" : "0"
      );

      formData.append(
        "is_featured",
        form.is_featured
          ? "1"
          : "0"
      );

      images.forEach((image) => {
        formData.append(
          "images[]",
          image
        );
      });

      let response;

      if (isEditMode) {
        formData.append(
          "_method",
          "PUT"
        );

        response =
          await axios.post(
            `${API_URL}/admin/products/${productId}`,
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
            `${API_URL}/admin/products`,
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
const savedProduct =
  response.data?.data;

const successMessage =
  isEditMode
    ? "Product updated successfully."
    : "Product created successfully.";

setSuccess(successMessage);

window.setTimeout(() => {
  navigate("/admin/products", {
    state: {
      successMessage,
    },
  });
}, 900);

return savedProduct;

    } catch (err) {
      console.error(
        "Failed to save product:",
        err
      );

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(
            validationErrors
          )
            .flat()
            .find(Boolean);

        setError(
          firstError ||
            "Please check the product information."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to save this product."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="admin-product-form-page">
        <div className="admin-product-form-container">
          <div className="admin-product-form-state">
            <span className="admin-product-form-spinner" />

            <strong>
              Loading product...
            </strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-product-form-page">
      <div className="admin-product-form-container">

        {/* =================================
            HEADER
        ================================= */}

        <header className="admin-product-form-header">
          <Link
            to="/admin/products"
            className="admin-product-form-back"
          >
            <ArrowLeft size={14} />
            Products
          </Link>

          <div className="admin-product-form-title">
            <span>
              PRODUCT MANAGEMENT
            </span>

            <h1>
              {isEditMode
                ? "Edit Product"
                : "Add Product"}
            </h1>

            <p>
              {isEditMode
                ? "Update product information, pricing and visibility."
                : "Create a new product for your store."}
            </p>
          </div>

          <div className="admin-product-form-header-space" />
        </header>

        {/* =================================
            MESSAGES
        ================================= */}

        {error && (
          <div className="admin-product-form-message admin-product-form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-product-form-message admin-product-form-success">
            <Check size={14} />
            {success}
          </div>
        )}

        {/* =================================
            FORM
        ================================= */}

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-product-form-grid">

            {/* PRODUCT INFORMATION */}

            <div className="admin-product-form-main">
              <section className="admin-product-form-card">
                <div className="admin-product-form-card-title">
                  <Package size={15} />

                  <div>
                    <h2>
                      Product Information
                    </h2>

                    <p>
                      Basic information about
                      this product.
                    </p>
                  </div>
                </div>

                <div className="admin-product-fields-grid">
                  <label className="admin-product-field admin-product-field-wide">
                    <span>
                      Product Name *
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      placeholder="Product name"
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>
                      SKU
                    </span>

                    <input
                      type="text"
                      name="sku"
                      value={form.sku}
                      placeholder="SKU-001"
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>
                      Category *
                    </span>

                    <select
                      name="category_id"
                      value={
                        form.category_id
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="admin-product-field admin-product-field-wide">
                    <span>
                      Short Description
                    </span>

                    <input
                      type="text"
                      name="short_description"
                      value={
                        form.short_description
                      }
                      placeholder="Short product description"
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label className="admin-product-field admin-product-field-wide">
                    <span>
                      Description
                    </span>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      rows="5"
                      placeholder="Write product details..."
                      onChange={
                        handleChange
                      }
                    />
                  </label>
                </div>
              </section>

              {/* PRICE */}

              <section className="admin-product-form-card">
                <div className="admin-product-form-card-title">
                  <Tag size={15} />

                  <div>
                    <h2>
                      Price & Stock
                    </h2>

                    <p>
                      Manage pricing and
                      inventory.
                    </p>
                  </div>
                </div>

                <div className="admin-product-price-grid">
                  <label className="admin-product-field">
                    <span>
                      Price *
                    </span>

                    <div className="admin-product-money-input">
                      <span>$</span>

                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </label>

                  <label className="admin-product-field">
                    <span>
                      Sale Price
                    </span>

                    <div className="admin-product-money-input">
                      <span>$</span>

                      <input
                        type="number"
                        name="sale_price"
                        value={
                          form.sale_price
                        }
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </label>

                  <label className="admin-product-field">
                    <span>
                      Stock *
                    </span>

                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      min="0"
                      step="1"
                      placeholder="0"
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label className="admin-product-field">
                    <span>
                      Low Stock Warning At *
                    </span>

                    <input
                      type="number"
                      name="low_stock_threshold"
                      value={
                        form.low_stock_threshold
                      }
                      min="0"
                      step="1"
                      placeholder="5"
                      onChange={
                        handleChange
                      }
                    />

                    <small>
                      Customers will see "Low Stock"
                      when inventory reaches this amount.
                    </small>
                  </label>
                </div>
              </section>
            </div>

            {/* IMAGES + VISIBILITY */}

            <aside className="admin-product-form-side">
              <section className="admin-product-form-card">
                <div className="admin-product-form-card-title">
                  <ImagePlus size={15} />

                  <div>
                    <h2>
                      Product Images
                    </h2>

                    <p>
                      Upload product photos.
                    </p>
                  </div>
                </div>

                <label className="admin-product-image-upload">
                  <ImagePlus size={22} />

                  <strong>
                    Choose Images
                  </strong>

                  <span>
                    JPG, PNG or WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={
                      handleImagesChange
                    }
                  />
                </label>

                {imagePreviews.length >
                  0 && (
                  <div className="admin-product-image-preview-grid">
                    {imagePreviews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          className="admin-product-image-preview"
                          key={
                            preview
                          }
                        >
                          <img
                            src={
                              preview
                            }
                            alt={`New product ${
                              index + 1
                            }`}
                          />

                          {index === 0 && (
                            <span>
                              Primary
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {isEditMode &&
                  imagePreviews.length ===
                    0 &&
                  existingImages.length >
                    0 && (
                    <div className="admin-product-image-preview-grid">
                      {existingImages.map(
                        (
                          image,
                          index
                        ) => (
                          <div
                            className="admin-product-image-preview"
                            key={
                              image.id ||
                              image.image
                            }
                          >
                            <img
                              src={`${STORAGE_URL}/${image.image}`}
                              alt={`Product ${
                                index + 1
                              }`}
                            />

                            {(image.is_primary ||
                              index ===
                                0) && (
                              <span>
                                Primary
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </section>

              <section className="admin-product-form-card">
                <div className="admin-product-form-card-title">
                  <Star size={15} />

                  <div>
                    <h2>
                      Visibility
                    </h2>

                    <p>
                      Product availability
                      options.
                    </p>
                  </div>
                </div>

                <label className="admin-product-toggle-row">
                  <div>
                    <strong>
                      Active Product
                    </strong>

                    <span>
                      Show this product in
                      the store.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={
                      form.is_active
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>

                <label className="admin-product-toggle-row">
                  <div>
                    <strong>
                      Featured Product
                    </strong>

                    <span>
                      Show in featured
                      products.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={
                      form.is_featured
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>
              </section>
            </aside>
          </div>

          {/* =================================
              ACTIONS
          ================================= */}

          <div className="admin-product-form-actions">
            <Link
              to="/admin/products"
              className="admin-product-form-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-product-form-save"
              disabled={saving}
            >
              <Save size={14} />

              {saving
                ? "Saving..."
                : isEditMode
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminProductForm;