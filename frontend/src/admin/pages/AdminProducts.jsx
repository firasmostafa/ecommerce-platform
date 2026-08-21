import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Edit3,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../context/auth-context";

import "./AdminProducts.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";
const STORAGE_URL = "https://ecommerce-platform-4vwn.onrender.com/storage";

function AdminProducts() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [stockFilter, setStockFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${API_URL}/products?per_page=50`),

          axios.get(`${API_URL}/categories`),
        ]);

        if (cancelled) {
          return;
        }

        const productsData =
          productsResponse.data?.data?.data ||
          productsResponse.data?.data ||
          [];

        const categoriesData =
          categoriesResponse.data?.data?.data ||
          categoriesResponse.data?.data ||
          [];

        setProducts(Array.isArray(productsData) ? productsData : []);

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        setError("");
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load admin products:", err);

        setError(err.response?.data?.message || "Unable to load products.");

        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.sku?.toLowerCase().includes(normalizedSearch) ||
        product.slug?.toLowerCase().includes(normalizedSearch);

      const categoryId = product.category_id ?? product.category?.id;

      const matchesCategory =
        !categoryFilter || String(categoryId) === String(categoryFilter);

      let matchesStock = true;

      if (stockFilter === "in_stock") {
        matchesStock = Number(product.stock || 0) > 0;
      }

      if (stockFilter === "low_stock") {
        const stock = Number(product.stock || 0);

        matchesStock = stock > 0 && stock <= 10;
      }

      if (stockFilter === "out_of_stock") {
        matchesStock = Number(product.stock || 0) <= 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalProducts = products.length;

  const activeProducts = products.filter((product) => product.is_active).length;

  const featuredProducts = products.filter(
    (product) => product.is_featured,
  ).length;

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);

    return stock > 0 && stock <= 10;
  }).length;

  const getPrimaryImage = (product) => {
    const image =
      product.images?.find((item) => item.is_primary) || product.images?.[0];

    if (!image?.image) {
      return null;
    }

    return `${STORAGE_URL}/${image.image}`;
  };

  const formatPrice = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const getFinalPrice = (product) => {
    const price = Number(product.price || 0);

    const salePrice =
      product.sale_price !== null && product.sale_price !== undefined
        ? Number(product.sale_price)
        : null;

    if (salePrice !== null && salePrice > 0 && salePrice < price) {
      return salePrice;
    }

    return price;
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStockFilter("");
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);
      setError("");
      setSuccess("");

      await axios.delete(`${API_URL}/admin/products/${product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id),
      );

      setSuccess(`${product.name} was deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete product:", err);

      setError(err.response?.data?.message || "Unable to delete this product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="admin-products-page">
        <div className="admin-products-container">
          <div className="admin-products-state">
            <span className="admin-products-spinner" />

            <strong>Loading products...</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-products-page">
      <div className="admin-products-container">
        {/* =====================================
            PAGE HEADER
        ====================================== */}

        <header className="admin-products-heading">
          <div>
            <span>PRODUCT MANAGEMENT</span>

            <h1>Products</h1>

            <p>Manage your store products, prices, stock and visibility.</p>
          </div>

          <Link to="/admin/products/create" className="admin-add-product">
            <Plus size={14} />
            Add Product
          </Link>
        </header>

        {/* =====================================
            SUMMARY
        ====================================== */}

        <section className="admin-products-summary">
          <article className="admin-product-summary-card">
            <span className="admin-product-summary-icon">
              <Boxes size={15} />
            </span>

            <div>
              <span>Products</span>

              <strong>{totalProducts}</strong>
            </div>
          </article>

          <article className="admin-product-summary-card">
            <span className="admin-product-summary-icon active">
              <Package size={15} />
            </span>

            <div>
              <span>Active</span>

              <strong>{activeProducts}</strong>
            </div>
          </article>

          <article className="admin-product-summary-card">
            <span className="admin-product-summary-icon featured">
              <Star size={15} />
            </span>

            <div>
              <span>Featured</span>

              <strong>{featuredProducts}</strong>
            </div>
          </article>

          <article className="admin-product-summary-card">
            <span className="admin-product-summary-icon warning">
              <Package size={15} />
            </span>

            <div>
              <span>Low Stock</span>

              <strong>{lowStockProducts}</strong>
            </div>
          </article>
        </section>

        {/* =====================================
            FILTERS
        ====================================== */}

        <section className="admin-products-toolbar">
          <div className="admin-products-search">
            <Search size={14} />

            <input
              type="search"
              value={search}
              placeholder="Search product or SKU..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            aria-label="Filter by stock"
          >
            <option value="">All Stock</option>

            <option value="in_stock">In Stock</option>

            <option value="low_stock">Low Stock</option>

            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button
            type="button"
            className="admin-products-reset"
            onClick={handleResetFilters}
          >
            <RefreshCw size={13} />
            Reset
          </button>
        </section>

        {/* =====================================
            MESSAGES
        ====================================== */}

        {error && (
          <div className="admin-products-message admin-products-message-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-products-message admin-products-message-success">
            {success}
          </div>
        )}

        {/* =====================================
            RESULTS HEADER
        ====================================== */}

        <div className="admin-products-results-heading">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            <strong>{totalProducts}</strong> products
          </span>
        </div>

        {/* =====================================
            DESKTOP TABLE
        ====================================== */}

        {filteredProducts.length > 0 ? (
          <>
            <div className="admin-products-table-card">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>

                    <th>Category</th>

                    <th>Price</th>

                    <th>Stock</th>

                    <th>Status</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const imageUrl = getPrimaryImage(product);

                    const price = Number(product.price || 0);

                    const finalPrice = getFinalPrice(product);

                    const hasSale = finalPrice < price;

                    const stock = Number(product.stock || 0);

                    return (
                      <tr key={product.id}>
                        {/* PRODUCT */}

                        <td>
                          <div className="admin-product-cell">
                            <div className="admin-product-image">
                              {imageUrl ? (
                                <img src={imageUrl} alt={product.name} />
                              ) : (
                                <Package size={15} />
                              )}
                            </div>

                            <div className="admin-product-cell-info">
                              <strong>{product.name}</strong>

                              <span>SKU: {product.sku || "—"}</span>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td>
                          <span className="admin-product-category">
                            {product.category?.name || "—"}
                          </span>
                        </td>

                        {/* PRICE */}

                        <td>
                          <div className="admin-product-price">
                            <strong>{formatPrice(finalPrice)}</strong>

                            {hasSale && <span>{formatPrice(price)}</span>}
                          </div>
                        </td>

                        {/* STOCK */}

                        <td>
                          <span
                            className={`admin-product-stock ${
                              stock <= 0 ? "out" : stock <= 10 ? "low" : "good"
                            }`}
                          >
                            {stock}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <div className="admin-product-statuses">
                            <span
                              className={`admin-product-status ${
                                product.is_active ? "active" : "inactive"
                              }`}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </span>

                            {product.is_featured && (
                              <span className="admin-product-featured">
                                <Star size={9} />
                                Featured
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="admin-product-actions">
                            <Link
                              to={`/products/${product.slug}`}
                              className="admin-product-action view"
                              title="View product"
                            >
                              <Eye size={12} />
                            </Link>

                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="admin-product-action edit"
                              title="Edit product"
                            >
                              <Edit3 size={12} />
                            </Link>

                            <button
                              type="button"
                              className="admin-product-action delete"
                              disabled={deletingId === product.id}
                              onClick={() => handleDelete(product)}
                              title="Delete product"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================
                MOBILE CARDS
            ================================== */}

            <div className="admin-products-mobile-grid">
              {filteredProducts.map((product) => {
                const imageUrl = getPrimaryImage(product);

                const finalPrice = getFinalPrice(product);

                const stock = Number(product.stock || 0);

                return (
                  <article
                    className="admin-product-mobile-card"
                    key={product.id}
                  >
                    <div className="admin-product-mobile-top">
                      <div className="admin-product-mobile-image">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} />
                        ) : (
                          <Package size={16} />
                        )}
                      </div>

                      <div className="admin-product-mobile-info">
                        <strong>{product.name}</strong>

                        <span>{product.category?.name || "No category"}</span>

                        <small>SKU: {product.sku || "—"}</small>
                      </div>

                      <strong className="admin-product-mobile-price">
                        {formatPrice(finalPrice)}
                      </strong>
                    </div>

                    <div className="admin-product-mobile-bottom">
                      <div>
                        <span>Stock</span>

                        <strong className={stock <= 10 ? "warning" : ""}>
                          {stock}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>

                        <strong>
                          {product.is_active ? "Active" : "Inactive"}
                        </strong>
                      </div>

                      <div className="admin-product-mobile-actions">
                        <Link to={`/products/${product.slug}`}>
                          <Eye size={11} />
                        </Link>

                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Edit3 size={11} />
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="admin-products-state">
            <Package size={24} />

            <strong>No products found</strong>

            <p>Try changing your search or filters.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminProducts;
