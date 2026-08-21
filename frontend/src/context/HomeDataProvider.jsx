import { useEffect, useState } from "react";
import axios from "axios";

import { HomeDataContext } from "./home-data-context";

const API_URL =
  "https://ecommerce-platform-4vwn.onrender.com/api";

function HomeDataProvider({ children }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homeSettings, setHomeSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
          settingsResponse,
        ] = await Promise.all([
          axios.get(
            `${API_URL}/products?featured=1&per_page=50`,
          ),
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/home-settings`),
        ]);

        if (cancelled) {
          return;
        }

        const products =
          productsResponse.data?.data?.data ||
          productsResponse.data?.data ||
          [];

        const categoryData =
          categoriesResponse.data?.data?.data ||
          categoriesResponse.data?.data ||
          [];

        const settings =
          settingsResponse.data?.data ||
          settingsResponse.data ||
          {};

        setFeaturedProducts(
          Array.isArray(products) ? products : [],
        );

        setCategories(
          Array.isArray(categoryData) ? categoryData : [],
        );

        setHomeSettings(settings);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load homepage data:",
          err,
        );

        setError("Unable to load homepage data.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HomeDataContext.Provider
      value={{
        featuredProducts,
        categories,
        homeSettings,
        loading,
        error,
      }}
    >
      {children}
    </HomeDataContext.Provider>
  );
}

export default HomeDataProvider;