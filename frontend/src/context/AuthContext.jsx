import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { AuthContext } from "./auth-context";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("auth_token");
  });

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem("auth_token"));
  });

  /*
  |--------------------------------------------------------------------------
  | Restore authenticated user
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    axios
      .get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        if (cancelled) {
          return;
        }

        const authenticatedUser =
          response.data.data || response.data.user || response.data;

        setUser(authenticatedUser);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to restore authenticated user:", error);

        localStorage.removeItem("auth_token");

        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login = useCallback(async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const responseData = response.data;

    const newToken = responseData.token || responseData.data?.token;

    const authenticatedUser = responseData.user || responseData.data?.user;

    if (!newToken) {
      throw new Error("The server did not return an authentication token.");
    }

    localStorage.setItem("auth_token", newToken);

    setToken(newToken);

    if (authenticatedUser) {
      setUser(authenticatedUser);
    }

    setLoading(false);

    return responseData;
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

  const register = useCallback(async (data) => {
    const response = await axios.post(`${API_URL}/register`, data, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const responseData = response.data;

    const newToken = responseData.token || responseData.data?.token;

    const registeredUser = responseData.user || responseData.data?.user;

    if (!newToken) {
      throw new Error("The server did not return an authentication token.");
    }

    localStorage.setItem("auth_token", newToken);

    setToken(newToken);

    if (registeredUser) {
      setUser(registeredUser);
    }

    setLoading(false);

    return responseData;
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem("auth_token");

    try {
      if (currentToken) {
        await axios.post(
          `${API_URL}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              Accept: "application/json",
            },
          },
        );
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("auth_token");

      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Context value
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      user,
      token,
      loading,

      isAuthenticated: Boolean(user && token),

      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
