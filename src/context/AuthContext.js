// src/context/AuthContext.js
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser as apiLogoutUser } from "../services/AuthService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    console.log("AuthContext: Memanggil logout...");

    try {
      await apiLogoutUser();
      console.log("AuthContext: Logout dari backend berhasil.");
    } catch (error) {
      console.error("AuthContext: Error saat logout dari backend:", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const checkAuthStatusFromLocalStorage = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (e) {
          console.error("Error parsing stored user data:", e);
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuthStatusFromLocalStorage();

    const handleStorageChange = (event) => {
      if (event.key === "user") {
        if (event.newValue) {
          try {
            const newUserData = JSON.parse(event.newValue);
            setUser(newUserData);
            setIsLoggedIn(true);
          } catch (e) {
            console.error(
              "Error parsing stored user data on storage event:",
              e
            );
            setUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem("user");
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Setup Axios response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log(
            "AuthContext: API mengembalikan 401, sesi habis. Memanggil logout."
          );
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // Memoize fungsi login menggunakan useCallback
  const login = useCallback(
    (userData, options = { navigateAfterLogin: false, navigateTo: "/" }) => {
      if (typeof userData === "object" && userData !== null) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        console.error("Login function called with invalid userData:", userData);
        return;
      }

      if (options.navigateAfterLogin) {
        navigate(options.navigateTo);
      }
    },
    [navigate]
  );

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      isLoading,
      login,
      logout,
    }),
    [isLoggedIn, user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
