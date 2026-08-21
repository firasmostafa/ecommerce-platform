import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import ProductCard from "../components/ProductCard";
import "./Products.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );

  const [specialFilter, setSpecialFilter] = useState(() => {
    if (searchParams.get("featured") === "1") {
      return "featured";
    }

    if (
      searchParams.get("sale") === "1" ||
      searchParams.get("on_sale") === "1"
    ) {
      return "sale";
    }

    return "";
  });

  const [sortBy, setSortBy] = useState("newest");

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const productsPerPage = 12;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      axios.get(`${API_URL}/products?per_page=100`),

      axios.get(`${API_URL}/categories`),
    ])
      .then(([productsResponse, categoriesResponse]) => {
        if (cancelled) {
          return;
        }

        setProducts(
          productsResponse.data.data?.data || productsResponse.data.data || [],
        );

        setCategories(categoriesResponse.data.data || []);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to load shop:", err);

        setError("We could not load the store products right now.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";

        const description =
          product.short_description?.toLowerCase() ||
          product.description?.toLowerCase() ||
          "";

        const categoryName = product.category?.name?.toLowerCase() || "";

        return (
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          categoryName.includes(normalizedSearch)
        );
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Category Filter
    |--------------------------------------------------------------------------
    |
    | selectedCategory contains the CATEGORY SLUG,
    | for example:
    |
    | electronics
    | fashion
    | home
    |
    */

    if (selectedCategory) {
      result = result.filter(
        (product) => product.category?.slug === selectedCategory,
      );
    }

    if (specialFilter === "featured") {
      result = result.filter(
        (product) => product.is_featured === true || product.is_featured === 1,
      );
    }

    if (specialFilter === "sale") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        const salePrice = Number(product.sale_price || 0);

        return salePrice > 0 && price > 0 && salePrice < price;
      });
    }

    if (minPrice !== "") {
      const minimum = Number(minPrice);

      result = result.filter((product) => getProductPrice(product) >= minimum);
    }

    if (maxPrice !== "") {
      const maximum = Number(maxPrice);

      result = result.filter((product) => getProductPrice(product) <= maximum);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;

      case "price-high":
        result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;

      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;

      case "newest":
      default:
        result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
        break;
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    specialFilter,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * productsPerPage;

  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  const updateUrl = ({
    category = selectedCategory,
    filter = specialFilter,
    searchValue = search,
  } = {}) => {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    if (filter === "featured") {
      params.set("featured", "1");
    }

    if (filter === "sale") {
      params.set("sale", "1");
    }

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }

    setSearchParams(params);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);

    updateUrl({
      searchValue: value,
    });
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);

    updateUrl({
      category: slug,
    });
  };

  const handleSpecialFilterChange = (value) => {
    setSpecialFilter(value);
    setCurrentPage(1);

    updateUrl({
      filter: value,
    });
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSpecialFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setCurrentPage(1);

    setSearchParams({});
  };

  const hasActiveFilters =
    search || selectedCategory || specialFilter || minPrice || maxPrice;

  const selectedCategoryName = categories.find(
    (category) => category.slug === selectedCategory,
  )?.name;

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="shop-container">
          <span className="shop-eyebrow">NOVA COLLECTION</span>

          <h1>
            {selectedCategoryName
              ? selectedCategoryName
              : "Find Your Next Favorite"}
          </h1>

          <p>
            {selectedCategoryName
              ? `Explore products from our ${selectedCategoryName} collection.`
              : "Explore our complete collection and find products that fit your style, needs and everyday life."}
          </p>

          <div className="shop-search">
            <Search size={20} />

            <input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search products, categories..."
              aria-label="Search products"
            />

            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="shop-content">
        <div className="shop-container">
          <div className="shop-toolbar">
            <div>
              <strong>{filteredProducts.length}</strong>

              <span>
                {filteredProducts.length === 1 ? " product" : " products"}
              </span>
            </div>

            <div className="shop-toolbar-actions">
              <button
                type="button"
                className="mobile-filter-button"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(event) => handleSortChange(event.target.value)}
                aria-label="Sort products"
              >
                <option value="newest">Newest</option>

                <option value="price-low">Price: Low to High</option>

                <option value="price-high">Price: High to Low</option>

                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          <div className="shop-layout">
            <aside
              className={`shop-sidebar ${
                filtersOpen ? "shop-sidebar-open" : ""
              }`}
            >
              <div className="shop-sidebar-header">
                <div>
                  <SlidersHorizontal size={18} />

                  <strong>Filters</strong>
                </div>

                <button
                  type="button"
                  className="close-filter-button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="filter-group">
                <h3>Category</h3>

                <button
                  type="button"
                  className={
                    selectedCategory === ""
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() => handleCategoryChange("")}
                >
                  All Categories
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={
                      selectedCategory === category.slug
                        ? "filter-option active"
                        : "filter-option"
                    }
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="filter-group">
                <h3>Collection</h3>

                <button
                  type="button"
                  className={
                    specialFilter === ""
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() => handleSpecialFilterChange("")}
                >
                  All Products
                </button>

                <button
                  type="button"
                  className={
                    specialFilter === "featured"
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() => handleSpecialFilterChange("featured")}
                >
                  Featured
                </button>

                <button
                  type="button"
                  className={
                    specialFilter === "sale"
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() => handleSpecialFilterChange("sale")}
                >
                  On Sale
                </button>
              </div>

              <div className="filter-group">
                <h3>Price Range</h3>

                <div className="price-filter">
                  <label>
                    <span>Min</span>

                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(event) =>
                        handleMinPriceChange(event.target.value)
                      }
                      placeholder="$0"
                    />
                  </label>

                  <span className="price-divider">—</span>

                  <label>
                    <span>Max</span>

                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) =>
                        handleMaxPriceChange(event.target.value)
                      }
                      placeholder="$1000"
                    />
                  </label>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="clear-filters-button"
                  onClick={clearFilters}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </aside>

            {filtersOpen && (
              <button
                type="button"
                className="filter-backdrop"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              />
            )}

            <div className="shop-products-area">
              {loading && (
                <div className="shop-state">
                  <span className="shop-spinner" />

                  <p>Loading products...</p>
                </div>
              )}

              {!loading && error && (
                <div className="shop-state">
                  <strong>Something went wrong</strong>

                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && visibleProducts.length > 0 && (
                <>
                  <div className="shop-products-grid">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="shop-pagination">
                      <button
                        type="button"
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) => Math.max(1, page - 1))
                        }
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from(
                        {
                          length: totalPages,
                        },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          className={page === safeCurrentPage ? "active" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={safeCurrentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1),
                          )
                        }
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}

              {!loading && !error && visibleProducts.length === 0 && (
                <div className="shop-state shop-empty">
                  <Search size={30} />

                  <strong>No products found</strong>

                  <p>There are no products in this category yet.</p>

                  <button type="button" onClick={clearFilters}>
                    View All Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function getProductPrice(product) {
  const price = Number(product.price || 0);

  const salePrice = Number(product.sale_price || 0);

  if (salePrice > 0 && price > 0 && salePrice < price) {
    return salePrice;
  }

  return price;
}

export default Products;
