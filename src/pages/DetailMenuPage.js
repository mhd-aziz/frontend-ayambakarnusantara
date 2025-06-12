import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
  Card,
} from "react-bootstrap";
import { getProductById } from "../services/MenuService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  Search,
  ArrowLeftCircleFill,
  DashLg,
  PlusLg,
  CartPlusFill,
  XCircleFill,
  ArrowLeft,
} from "react-bootstrap-icons";
import "../css/DetailMenuPage.css";

function DetailMenuPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { addItem: addItemToCartContext, isLoading: isCartLoading } = useCart();

  const [menuItem, setMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartSuccessMessage, setAddToCartSuccessMessage] = useState("");
  const [isProcessingCartAction, setIsProcessingCartAction] = useState(false);

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
      const currentProduct = menuItem?.data || menuItem;
      if (currentProduct && newQuantity > currentProduct.stock) {
        alert(
          `Stok produk tersisa ${currentProduct.stock}. Kuantitas diatur ke ${currentProduct.stock}.`
        );
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
      setQuantity(currentProduct.stock);
      return;
    }

    setIsProcessingCartAction(true);
    setError("");
    setAddToCartSuccessMessage("");

    try {
      const itemData = {
        productId: productId,
        quantity: quantity,
      };
      const response = await addItemToCartContext(itemData);
      if (response.status === "success" || response.success === true) {
        setAddToCartSuccessMessage(
          response.message ||
            `${currentProduct.name} berhasil ditambahkan ke keranjang!`
        );
        setTimeout(() => {
          setAddToCartSuccessMessage("");
        }, 3000);
      } else {
        setError(response.message || "Gagal menambahkan produk ke keranjang.");
      }
    } catch (err) {
      setError(
        err.message || "Terjadi kesalahan saat menambahkan ke keranjang."
      );
      console.error("Error adding to cart from DetailMenuPage:", err);
    } finally {
      setIsProcessingCartAction(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    const nameForAvatar = e.target.alt || "Produk";
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameForAvatar
    )}&size=600&background=efefef&color=757575&font-size=0.33&length=2`;
  };

  if (isLoading) {
    return (
      <Container fluid className="py-5 detail-menu-page-container-fluid">
        <Container className="text-center loading-spinner-container">
          <Spinner
            animation="border"
            style={{
              width: "4rem",
              height: "4rem",
              color: "var(--brand-primary, #c0392b)",
            }}
          />
          <p
            className="mt-3 lead"
            style={{ color: "var(--brand-primary, #c0392b)" }}
          >
            Memuat detail produk...
          </p>
        </Container>
      </Container>
    );
  }

  const pageError = error && !addToCartSuccessMessage;

  if (pageError && !menuItem) {
    return (
      <Container fluid className="py-5 detail-menu-page-container-fluid">
        <Container>
          <Alert variant="danger" className="text-center lead py-4 shadow-sm">
            <Alert.Heading as="h3">
              <ExclamationTriangleFill className="me-2" />
              Gagal Memuat Data
            </Alert.Heading>
            <p>{error}</p>
            <Button
              as={Link}
              to="/menu"
              variant="outline-primary"
              className="fw-semibold"
            >
              <ArrowLeftCircleFill className="me-2" />
              Kembali ke Menu
            </Button>
          </Alert>
        </Container>
      </Container>
    );
  }

  const currentProduct = menuItem && menuItem.data ? menuItem.data : menuItem;

  if (!currentProduct || Object.keys(currentProduct).length === 0) {
    return (
      <Container fluid className="py-5 detail-menu-page-container-fluid">
        <Container>
          <Alert variant="warning" className="text-center lead py-4 shadow-sm">
            <Alert.Heading as="h3">
              <Search className="me-2" />
              Produk Tidak Ditemukan
            </Alert.Heading>
            <p>Detail untuk produk ini tidak dapat ditemukan.</p>
            <Button
              as={Link}
              to="/menu"
              variant="outline-primary"
              className="fw-semibold"
            >
              <ArrowLeftCircleFill className="me-2" />
              Kembali ke Menu
            </Button>
          </Alert>
        </Container>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-lg-5 detail-menu-page-container-fluid">
      <Container>
        {addToCartSuccessMessage && (
          <Alert
            variant="success"
            onClose={() => setAddToCartSuccessMessage("")}
            dismissible
            className="position-fixed top-0 start-50 translate-middle-x mt-3 z-index-toast shadow-lg"
            style={{ zIndex: 1055 }}
          >
            <CheckCircleFill className="me-2" />
            {addToCartSuccessMessage}
          </Alert>
        )}
        {error && !addToCartSuccessMessage && (
          <Alert
            variant="danger"
            onClose={() => setError(null)}
            dismissible
            className="mt-3 mb-4 shadow-sm"
          >
            {error}
          </Alert>
        )}
        <Breadcrumb
          listProps={{
            className: "bg-transparent px-0 py-2 mb-3",
          }}
          className="breadcrumb-custom"
        >
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/menu" }}>
            Menu
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{currentProduct.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Card className="border-0 shadow-sm detail-menu-card-wrapper">
          <Card.Body>
            <Row className="detail-menu-card">
              <Col lg={6} md={5} className="mb-4 mb-md-0 detail-menu-image-col">
                <Image
                  src={
                    currentProduct.productImageURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentProduct.name || "Produk"
                    )}&size=600&background=efefef&color=757575&font-size=0.33&length=2`
                  }
                  alt={currentProduct.name}
                  className="detail-menu-image rounded"
                  onError={handleImageError}
                  fluid
                />
              </Col>
              <Col lg={6} md={7} className="detail-menu-info-col ps-md-4">
                <Badge
                  bg="light"
                  text="dark"
                  className="mb-2 px-2 py-1 category-badge shadow-sm"
                >
                  {currentProduct.category}
                </Badge>
                <h1 className="h2 detail-menu-title mb-3">
                  {currentProduct.name}
                </h1>

                <p className="detail-menu-description lead text-muted mb-3">
                  {currentProduct.description ||
                    "Deskripsi produk tidak tersedia."}
                </p>

                <div className="mb-3 detail-menu-stock-info">
                  {currentProduct.stock > 0 ? (
                    <Badge
                      bg="success-light"
                      text="success"
                      pill
                      className="stock-badge px-3 py-2"
                    >
                      <CheckCircleFill className="me-1" />
                      Stok Tersedia: {currentProduct.stock}
                    </Badge>
                  ) : (
                    <Badge
                      bg="danger-light"
                      text="danger"
                      pill
                      className="stock-badge px-3 py-2"
                    >
                      <XCircleFill className="me-1" />
                      Stok Habis
                    </Badge>
                  )}
                </div>

                <div
                  className="detail-menu-price h3 mb-3 fw-bold"
                  style={{ color: "var(--brand-primary, #c0392b)" }}
                >
                  Rp {currentProduct.price.toLocaleString("id-ID")}
                </div>

                {currentProduct.stock > 0 && (
                  <Row className="align-items-center mb-3 gx-2">
                    <Col xs="auto">
                      <Form.Label
                        htmlFor="quantity-input"
                        className="mb-0 small text-muted"
                      >
                        Jumlah:
                      </Form.Label>
                    </Col>
                    <Col xs="auto">
                      <InputGroup
                        className="quantity-selector shadow-sm"
                        size="sm"
                      >
                        <Button
                          variant="outline-secondary"
                          className="rounded-start"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={
                            quantity <= 1 ||
                            isProcessingCartAction ||
                            isCartLoading
                          }
                        >
                          <DashLg />
                        </Button>
                        <Form.Control
                          id="quantity-input"
                          type="text"
                          value={quantity}
                          readOnly
                          className="text-center fw-bold border-start-0 border-end-0"
                          style={{ maxWidth: "50px", backgroundColor: "#fff" }}
                        />
                        <Button
                          variant="outline-secondary"
                          className="rounded-end"
                          onClick={() => handleQuantityChange(1)}
                          disabled={
                            quantity >= currentProduct.stock ||
                            isProcessingCartAction ||
                            isCartLoading
                          }
                        >
                          <PlusLg />
                        </Button>
                      </InputGroup>
                    </Col>
                  </Row>
                )}

                <Row className="mt-4 actions-row gx-2">
                  <Col xs={12} sm={6} className="mb-2 mb-sm-0 d-grid">
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate(-1)}
                      disabled={isProcessingCartAction || isCartLoading}
                      className="btn-action shadow-sm"
                    >
                      <ArrowLeft className="me-1" />
                      Kembali
                    </Button>
                  </Col>
                  {currentProduct.stock > 0 && (
                    <Col xs={12} sm={6} className="d-grid">
                      <Button
                        variant="primary"
                        onClick={handleAddToCartClick}
                        disabled={
                          currentProduct.stock === 0 ||
                          quantity === 0 ||
                          isProcessingCartAction ||
                          isCartLoading
                        }
                        className="btn-add-to-cart btn-action shadow-sm"
                        style={{
                          backgroundColor: "var(--brand-primary, #c0392b)",
                          borderColor: "var(--brand-primary, #c0392b)",
                        }}
                      >
                        {isProcessingCartAction || isCartLoading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CartPlusFill className="me-2" />
                            Tambah Keranjang
                          </>
                        )}
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}

export default DetailMenuPage;
