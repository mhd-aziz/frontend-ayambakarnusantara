// src/pages/DetailMenuPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
// INGAT: Service Anda bernama MenuService
// Mengubah impor dari getMenuById menjadi getProductById sesuai error
import { getProductById } from "../services/MenuService";
import "../css/DetailMenuPage.css"; // Impor CSS kustom

function DetailMenuPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [menuItem, setMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItem = useCallback(async () => {
    if (!productId) {
      setError("ID Produk tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Menggunakan getProductById yang diimpor
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
          setMenuItem(null);
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
      const currentProduct = menuItem?.data || menuItem;
      if (currentProduct && newQuantity > currentProduct.stock)
        return currentProduct.stock;
      return newQuantity;
    });
  };

  const handleAddToCart = () => {
    const currentProduct = menuItem?.data || menuItem;
    if (!currentProduct) return;
    alert(`${quantity} x ${currentProduct.name} ditambahkan ke keranjang!`);
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

  const currentProduct = menuItem?.data || menuItem;

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
                    disabled={quantity >= currentProduct.stock}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          )}

          <Row className="mt-3 actions-row">
            <Col xs={12} sm="auto" className="mb-2 mb-sm-0 d-grid">
              <Button variant="outline-primary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>Kembali
              </Button>
            </Col>
            {currentProduct.stock > 0 && (
              <Col xs={12} sm className="d-grid">
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  disabled={currentProduct.stock === 0}
                  className="btn-add-to-cart"
                  style={{ backgroundColor: "#c0392b", borderColor: "#c0392b" }}
                >
                  <i className="bi bi-cart-plus-fill me-2"></i>Tambah ke
                  Keranjang
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
