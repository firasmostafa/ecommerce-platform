import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import { FavoritesContext } from "./favorites-context";
import { useAuth } from "./auth-context";

const API_URL =
  "http://127.0.0.1:8000/api";

export function FavoritesProvider({
  children,
}) {
  const {
    token,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [
    favorites,
    setFavorites,
  ] = useState([]);

  const [
    loadedForToken,
    setLoadedForToken,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD FAVORITES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      authLoading ||
      !token ||
      !isAuthenticated
    ) {
      return undefined;
    }

    let cancelled = false;

    axios
      .get(
        `${API_URL}/favorites`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },
        }
      )
      .then((response) => {
        if (cancelled) {
          return;
        }

        const products =
          response.data?.data || [];

        setFavorites(
          Array.isArray(products)
            ? products
            : []
        );

        setLoadedForToken(token);

        setError("");
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load favorites:",
          err
        );

        setFavorites([]);

        setLoadedForToken(token);

        setError(
          "Unable to load favorites."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    token,
    isAuthenticated,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FAVORITES FOR CURRENT USER
  |--------------------------------------------------------------------------
  */

  const currentFavorites =
    isAuthenticated &&
    token &&
    loadedForToken === token
      ? favorites
      : [];

  /*
  |--------------------------------------------------------------------------
  | CHECK FAVORITE
  |--------------------------------------------------------------------------
  */

  const isFavorite =
    useCallback(
      (productId) => {
        return currentFavorites.some(
          (product) =>
            Number(product.id) ===
            Number(productId)
        );
      },
      [currentFavorites]
    );

  /*
  |--------------------------------------------------------------------------
  | ADD FAVORITE
  |--------------------------------------------------------------------------
  */

  const addFavorite =
    useCallback(
      async (product) => {
        if (
          !token ||
          !isAuthenticated ||
          !product?.id
        ) {
          return false;
        }

        try {
          await axios.post(
            `${API_URL}/favorites/${product.id}`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

          setFavorites(
            (current) => {
              const exists =
                current.some(
                  (item) =>
                    Number(item.id) ===
                    Number(product.id)
                );

              if (exists) {
                return current;
              }

              return [
                ...current,
                product,
              ];
            }
          );

          setLoadedForToken(token);

          setError("");

          return true;
        } catch (err) {
          console.error(
            "Failed to add favorite:",
            err
          );

          setError(
            "Unable to add favorite."
          );

          return false;
        }
      },
      [
        token,
        isAuthenticated,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | REMOVE FAVORITE
  |--------------------------------------------------------------------------
  */

  const removeFavorite =
    useCallback(
      async (productId) => {
        if (
          !token ||
          !isAuthenticated ||
          !productId
        ) {
          return false;
        }

        try {
          await axios.delete(
            `${API_URL}/favorites/${productId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

          setFavorites(
            (current) =>
              current.filter(
                (product) =>
                  Number(product.id) !==
                  Number(productId)
              )
          );

          setLoadedForToken(token);

          setError("");

          return true;
        } catch (err) {
          console.error(
            "Failed to remove favorite:",
            err
          );

          setError(
            "Unable to remove favorite."
          );

          return false;
        }
      },
      [
        token,
        isAuthenticated,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | TOGGLE FAVORITE
  |--------------------------------------------------------------------------
  */

  const toggleFavorite =
    useCallback(
      async (product) => {
        if (!product?.id) {
          return false;
        }

        const exists =
          currentFavorites.some(
            (item) =>
              Number(item.id) ===
              Number(product.id)
          );

        if (exists) {
          return removeFavorite(
            product.id
          );
        }

        return addFavorite(product);
      },
      [
        currentFavorites,
        addFavorite,
        removeFavorite,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | RELOAD FAVORITES
  |--------------------------------------------------------------------------
  */

  const loadFavorites =
    useCallback(async () => {
      if (
        !token ||
        !isAuthenticated
      ) {
        return [];
      }

      try {
        const response =
          await axios.get(
            `${API_URL}/favorites`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const products =
          response.data?.data || [];

        const safeProducts =
          Array.isArray(products)
            ? products
            : [];

        setFavorites(
          safeProducts
        );

        setLoadedForToken(token);

        setError("");

        return safeProducts;
      } catch (err) {
        console.error(
          "Failed to reload favorites:",
          err
        );

        setError(
          "Unable to load favorites."
        );

        return [];
      }
    }, [
      token,
      isAuthenticated,
    ]);

  /*
  |--------------------------------------------------------------------------
  | CLEAR FAVORITES
  |--------------------------------------------------------------------------
  */

  const clearFavorites =
    useCallback(async () => {
      if (
        !token ||
        !isAuthenticated ||
        currentFavorites.length === 0
      ) {
        return;
      }

      const productIds =
        currentFavorites.map(
          (product) =>
            product.id
        );

      try {
        await Promise.all(
          productIds.map(
            (productId) =>
              axios.delete(
                `${API_URL}/favorites/${productId}`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,

                    Accept:
                      "application/json",
                  },
                }
              )
          )
        );

        setFavorites([]);

        setLoadedForToken(token);

        setError("");
      } catch (err) {
        console.error(
          "Failed to clear favorites:",
          err
        );

        setError(
          "Unable to clear favorites."
        );
      }
    }, [
      token,
      isAuthenticated,
      currentFavorites,
    ]);

  /*
  |--------------------------------------------------------------------------
  | VALUES
  |--------------------------------------------------------------------------
  */

  const favoritesCount =
    currentFavorites.length;

  const loading =
    authLoading ||
    (
      Boolean(token) &&
      isAuthenticated &&
      loadedForToken !== token
    );

  const value = useMemo(
    () => ({
      favorites:
        currentFavorites,

      favoritesCount,

      loading,
      error,

      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      loadFavorites,
    }),
    [
      currentFavorites,
      favoritesCount,
      loading,
      error,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      loadFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider
      value={value}
    >
      {children}
    </FavoritesContext.Provider>
  );
}