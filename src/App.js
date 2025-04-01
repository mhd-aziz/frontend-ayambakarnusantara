import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Impor komponen Navbar dan AuthHeader
import NavigationBar from "./components/common/Navbar";
import AuthHeader from "./components/common/AuthHeader";

// Impor halaman-halaman user
import HomePage from "./pages/user/Home";
import MenuPage from "./pages/user/Menu";
import ShopPage from "./pages/user/Shop";
import ShopDetail from "./pages/user/ShopDetail";
import OrderPage from "./pages/user/Order";
import OrderDetailPage from "./pages/user/OrderDetail";
import RatingPage from "./pages/user/Rating";
import ProductDetailPage from "./pages/user/ProductDetail";
import CartPage from "./pages/user/Cart";
import CheckoutPage from "./pages/user/Checkout";
import ProfilePage from "./pages/user/Profile";
import LoginPage from "./pages/user/Login";
import RegisterPage from "./pages/user/Register";

// Impor halaman admin
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminRegisterPage from "./pages/admin/AdminRegister";
import AdminDashboardPage from "./pages/admin/AdminDashboard";

// Context Providers
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { isAdminAuthenticated } from "./services/adminService";

// Protected Route for Users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="d-flex justify-content-center py-5">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Protected Route for Admin
const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const checkAdmin = () => {
      const adminAuth = isAdminAuthenticated();
      setIsAdmin(adminAuth);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center py-5">Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/admin/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="d-flex justify-content-center py-5">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Komponen untuk mendeteksi rute dan mengatur class body
const RouteDetector = () => {
  const location = useLocation();

  useEffect(() => {
    // Deteksi apakah user berada di homepage
    const isHomePage = location.pathname === "/";
    const isAdminPage = location.pathname.startsWith("/admin");

    // Reset scroll position ke atas ketika navigasi
    window.scrollTo(0, 0);

    // Tambahkan class ke App container berdasarkan rute saat ini
    const appElement = document.querySelector(".App");
    if (appElement) {
      if (isHomePage) {
        appElement.classList.add("home-page");
        appElement.classList.remove("content-page", "admin-page");
      } else if (isAdminPage) {
        appElement.classList.add("admin-page");
        appElement.classList.remove("home-page", "content-page");
      } else {
        appElement.classList.add("content-page");
        appElement.classList.remove("home-page", "admin-page");
      }
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
};

// Main App Content dengan layout terintegrasi
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdminPage = location.pathname.startsWith("/admin");

  // Jangan render Navbar dan AuthHeader di halaman admin
  const showNavbarAndHeader = !isAdminPage;

  return (
    <div
      className={`App ${
        isHomePage ? "home-page" : isAdminPage ? "admin-page" : "content-page"
      }`}
    >
      {showNavbarAndHeader && <AuthHeader />}
      {showNavbarAndHeader && <NavigationBar />}
      <RouteDetector />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:id" element={<ShopDetail />} />

        {/* Updated Product Detail Route - using productId parameter */}
        <Route path="/product/:productId" element={<ProductDetailPage />} />

        <Route path="/rating/:productId" element={<RatingPage />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Order Routes */}
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />{" "}
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />

        {/* Catch-all route - 404 Page */}
        <Route
          path="*"
          element={
            <div className="container py-5 text-center">
              <h1>404</h1>
              <p>Halaman tidak ditemukan</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// Router provider
function AppWithRouter() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Main App dengan Providers
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppWithRouter />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
