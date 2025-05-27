// src/pages/DetailMenuPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import {
  Container,
  Row,
  Col,
  Image,
  Spinner,
  Alert,
  Button,
  Badge,
  Breadcrumb,
  Form,
  InputGroup,
} from "react-bootstrap";
import { getProductById } from "../services/MenuService";
import { addItemToCart } from "../services/CartService"; // Import CartService
import { useAuth } from "../context/AuthContext"; // Import useAuth
import "../css/DetailMenuPage.css";

function DetailMenuPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // For redirecting to login
  const { isLoggedIn } = useAuth(); // Get auth state

  const [menuItem, setMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Loading state for add to cart

  const fetchMenuItem = useCallback(async () => {
    if (!productId) {
      setError("ID Produk tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProductById(productId);
      if (response && response.data) {
        setMenuItem(response.data);
      } else {
        if (
          response &&
          !response.data &&
          response.statusCode &&
          response.statusCode !== 200
        ) {
          throw new Error(
            response.message || "Format data produk tidak sesuai dari server."
          );
        } else if (!response || !response.data) {
          // This case might indicate product not found by ID, backend might return success false or specific message
          setMenuItem(null);
          setError(response?.message || "Produk tidak ditemukan.");
        }
      }
    } catch (err) {
      setError(
        err.message ||
          "Gagal mengambil detail produk. Item mungkin tidak ditemukan."
      );
      console.error("Error fetching product item:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchMenuItem();
  }, [fetchMenuItem]);

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + change;
      if (newQuantity < 1) return 1;
      const currentProduct = menuItem?.data || menuItem; // menuItem might directly be the product object
      if (currentProduct && newQuantity > currentProduct.stock) {
        return currentProduct.stock;
      }
      return newQuantity;
    });
  };

  const handleAddToCartClick = async () => {
    const currentProduct = menuItem?.data || menuItem;
    if (!currentProduct || !productId) {
      alert("Detail produk tidak tersedia.");
      return;
    }

    if (!isLoggedIn) {
      alert(
        "Anda harus login terlebih dahulu untuk menambahkan item ke keranjang."
      );
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (currentProduct.stock === 0) {
      alert("Maaf, stok produk ini habis.");
      return;
    }

    if (quantity > currentProduct.stock) {
      alert(
        `Maaf, stok produk tidak mencukupi. Tersisa ${currentProduct.stock} item.`
      );
      setQuantity(currentProduct.stock); // Adjust quantity to max available stock
      return;
    }

    setIsAddingToCart(true);
    try {
      const itemData = {
        productId: productId, // productId from useParams
        quantity: quantity,
      };
      const response = await addItemToCart(itemData);
      if (response.status === "success" || response.success === true) {
        alert(
          response.message ||
            `${currentProduct.name} berhasil ditambahkan ke keranjang!`
        );
        // Optionally, update a global cart context or navigate to cart page
      } else {
        alert(response.message || "Gagal menambahkan produk ke keranjang.");
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat menambahkan ke keranjang.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://via.placeholder.com/600x400.png?text=Gambar+Tidak+Tersedia`;
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5 loading-spinner-container">
        <Spinner
          animation="border"
          style={{ width: "4rem", height: "4rem", color: "#c0392b" }}
        />
        <p className="mt-3 lead" style={{ color: "#c0392b" }}>
          Memuat detail produk...
        </p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center lead py-4 shadow-sm">
          <Alert.Heading as="h3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>Gagal Memuat
            Data
          </Alert.Heading>
          <p>{error}</p>
          <Button
            as={Link}
            to="/menu"
            variant="outline-primary"
            className="fw-semibold"
          >
            <i className="bi bi-arrow-left-circle-fill me-2"></i>Kembali ke Menu
          </Button>
        </Alert>
      </Container>
    );
  }

  // Adjust to handle both direct object and nested within 'data' property
  const currentProduct = menuItem && menuItem.data ? menuItem.data : menuItem;

  if (!currentProduct || Object.keys(currentProduct).length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center lead py-4 shadow-sm">
          <Alert.Heading as="h3">
            <i className="bi bi-search me-2"></i>Produk Tidak Ditemukan
          </Alert.Heading>
          <p>Detail untuk produk ini tidak dapat ditemukan.</p>
          <Button
            as={Link}
            to="/menu"
            variant="outline-primary"
            className="fw-semibold"
          >
            <i className="bi bi-arrow-left-circle-fill me-2"></i>Kembali ke Menu
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="detail-menu-page">
      <Breadcrumb
        listProps={{
          className: "bg-light px-3 py-2 rounded-pill shadow-sm border",
        }}
      >
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/menu" }}>
          Menu
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{currentProduct.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mt-4 detail-menu-card">
        <Col md={6} className="mb-4 mb-md-0 detail-menu-image-col">
          <Image
            src={
              currentProduct.productImageURL ||
              `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(
                currentProduct.name
              )}`
            }
            alt={currentProduct.name}
            className="detail-menu-image shadow"
            onError={handleImageError}
          />
        </Col>
        <Col md={6}>
          <Badge
            pill
            bg="light"
            text="dark"
            className="mb-2 detail-menu-category-badge"
          >
            {currentProduct.category}
          </Badge>
          <h1 className="detail-menu-title">{currentProduct.name}</h1>

          <p className="detail-menu-description">
            {currentProduct.description}
          </p>

          <div className="mb-3 detail-menu-stock-info">
            {currentProduct.stock > 0 ? (
              <Badge bg="success" pill>
                <i className="bi bi-check-circle-fill me-1"></i>Stok Tersedia:{" "}
                {currentProduct.stock}
              </Badge>
            ) : (
              <Badge bg="danger" pill>
                <i className="bi bi-x-circle-fill me-1"></i>Stok Habis
              </Badge>
            )}
          </div>

          <div className="detail-menu-price mb-3">
            Rp {currentProduct.price.toLocaleString("id-ID")}
          </div>

          {currentProduct.stock > 0 && (
            <Row className="align-items-center mb-3">
              <Col xs="auto" className="pe-0">
                <Form.Label
                  htmlFor="quantity-input"
                  className="mb-0 me-2 small text-muted"
                >
                  Jumlah:
                </Form.Label>
              </Col>
              <Col xs="auto">
                <InputGroup className="quantity-selector" size="sm">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash-lg"></i>
                  </Button>
                  <Form.Control
                    id="quantity-input"
                    type="text"
                    value={quantity}
                    readOnly
                    className="text-center fw-bold"
                    style={{ maxWidth: "50px" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(1)}
                    disabled={
                      quantity >= currentProduct.stock || isAddingToCart
                    }
                  >
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          )}

          <Row className="mt-3 actions-row">
            <Col xs={12} sm="auto" className="mb-2 mb-sm-0 d-grid">
              <Button
                variant="outline-primary"
                onClick={() => navigate(-1)}
                disabled={isAddingToCart}
              >
                <i className="bi bi-arrow-left me-2"></i>Kembali
              </Button>
            </Col>
            {currentProduct.stock > 0 && (
              <Col xs={12} sm className="d-grid">
                <Button
                  variant="primary"
                  onClick={handleAddToCartClick}
                  disabled={
                    currentProduct.stock === 0 ||
                    quantity === 0 ||
                    isAddingToCart
                  }
                  className="btn-add-to-cart"
                  style={{ backgroundColor: "#c0392b", borderColor: "#c0392b" }}
                >
                  {isAddingToCart ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus-fill me-2"></i>Tambah ke
                      Keranjang
                    </>
                  )}
                </Button>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default DetailMenuPage;
