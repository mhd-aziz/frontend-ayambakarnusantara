// src/App.js
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Alert, Container, Modal, Spinner } from "react-bootstrap";
import "./App.css";
import NavigationBar from "./components/Layout/NavigationBar";
import Footer from "./components/Layout/Footer";
import HomePage from "./pages/HomePage";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ForgotPasswordForm from "./components/Auth/ForgotPasswordForm";
import { useAuth } from "./context/AuthContext"; 
import MenuPage from "./pages/MenuPage";
import DetailMenuPage from "./pages/DetailMenuPage";
import ShopPage from "./pages/ShopPage";
import ShopDetailPage from "./pages/ShopDetailPage";
import OrderPage from "./pages/OrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SellerPage from "./pages/Seller/SellerPage";
import SellerDashboardOverview from "./pages/Seller/SellerDashboardOverview";
import SellerShopInfo from "./pages/Seller/SellerShopInfo";
import SellerProductManagement from "./pages/Seller/SellerProductManagement";
import SellerOrderManagement from "./pages/Seller/SellerOrderManagement";
import CartPage from "./pages/CartPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const { isLoggedIn, isLoading } = useAuth();
  const [showTopBanner, setShowTopBanner] = useState(true);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const location = useLocation(); // location sudah ada
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/login") {
      setShowRegisterModal(false);
      setShowForgotPasswordModal(false);
      setShowLoginModal(true);
    } else if (location.pathname === "/register") {
      setShowLoginModal(false);
      setShowForgotPasswordModal(false);
      setShowRegisterModal(true);
    } else if (location.pathname === "/forgot-password") {
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowForgotPasswordModal(true);
    } else {
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowForgotPasswordModal(false);
    }
  }, [location.pathname]);

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    if (location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  };

  const handleRegisterModalClose = () => {
    setShowRegisterModal(false);
    if (location.pathname === "/register") {
      navigate("/", { replace: true });
    }
  };

  const handleForgotPasswordModalClose = () => {
    setShowForgotPasswordModal(false);
    if (location.pathname === "/forgot-password") {
      navigate("/login", { replace: true });
    }
  };

  // Tentukan path di mana footer akan ditampilkan
  const pathsWithFooter = [
    "/",
    "/menu",
    "/menu/:productId",
    "/toko",
    "/toko/:shopId",
    "/pesanan",
  ];
  const isDynamicPathMatch = (pathname, pattern) => {
    const patternParts = pattern.split("/");
    const pathParts = pathname.split("/");
    if (patternParts.length !== pathParts.length) return false;
    return patternParts.every(
      (part, index) => part.startsWith(":") || part === pathParts[index]
    );
  };
  const shouldShowFooter = pathsWithFooter.some((pattern) =>
    pattern.includes(":")
      ? isDynamicPathMatch(location.pathname, pattern)
      : location.pathname === pattern
  );

  if (isLoading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Memuat...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 app-container">
      {!isLoggedIn && showTopBanner && (
        <Alert
          variant="dark"
          onClose={() => setShowTopBanner(false)}
          dismissible
          className="text-center mb-0 small-banner"
        >
          <Alert.Heading as="span" style={{ fontSize: "0.9rem" }}>
            Daftar Sekarang! untuk bisa pesan ayam bakar kesukaanmu.{" "}
            <Link to="/register" className="alert-link">
              Klik di sini!
            </Link>
          </Alert.Heading>
        </Alert>
      )}
      <NavigationBar />
      <Container fluid className="page-content-container p-0 flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/register" element={<HomePage />} />
          <Route path="/forgot-password" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:productId" element={<DetailMenuPage />} />{" "}
          <Route path="/toko" element={<ShopPage />} />
          <Route path="/toko/:shopId" element={<ShopDetailPage />} />
          <Route
            path="/pesanan"
            element={
              isLoggedIn ? <OrderPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/pesanan/:orderId"
            element={
              isLoggedIn ? (
                <OrderDetailPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/toko-saya/*"
            element={
              isLoggedIn ? (
                <SellerPage />
              ) : (
                <Navigate to="/login" state={{ from: "/toko-saya" }} replace />
              )
            }
          >
            <Route index element={<SellerDashboardOverview />} />
            <Route path="info" element={<SellerShopInfo />} />
            <Route path="produk" element={<SellerProductManagement />} />
            <Route path="pesanan" element={<SellerOrderManagement />} />
          </Route>
          <Route
            path="/keranjang"
            element={
              isLoggedIn ? (
                <CartPage />
              ) : (
                <Navigate to="/login" state={{ from: "/keranjang" }} replace />
              )
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>

      {shouldShowFooter && <Footer />}

      <Modal show={showLoginModal} onHide={handleLoginModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginForm />
        </Modal.Body>
      </Modal>
      <Modal
        show={showRegisterModal}
        onHide={handleRegisterModalClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RegisterForm />
        </Modal.Body>
      </Modal>
      <Modal
        show={showForgotPasswordModal}
        onHide={handleForgotPasswordModalClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Lupa Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ForgotPasswordForm />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
