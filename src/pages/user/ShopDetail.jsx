import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Image,
  ListGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  FaShoppingCart,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBox,
  FaCheck,
} from "react-icons/fa";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import "../../assets/styles/shop-detail.css";

const ShopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart: contextAddToCart } = useContext(CartContext);

  // State for shop data and loading
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [addedToCart, setAddedToCart] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      setLoading(true);
      try {
        const response = await apiService.getShopById(id);
        setShop(response.data);
      } catch (err) {
        console.error(`Error fetching shop details for shop ${id}:`, err);
        setError(
          "Terjadi kesalahan saat mengambil detail toko. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopDetails();
    }
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAddingToCart(product.id);

    try {
      await apiService.addToCart(product.id, 1);
      contextAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        photoProduct: product.photoProduct,
        quantity: 1,
        shop: {
          id: shop.id,
          name: shop.name,
          photoShop: shop.photoShop,
        },
      });

      setToastVariant("success");
      setToastMessage(`${product.name} berhasil ditambahkan ke keranjang!`);
      setShowToast(true);

      setAddedToCart(product.id);
      setTimeout(() => {
        setAddedToCart(null);
      }, 1500);
    } catch (err) {
      setToastVariant("danger");
      setToastMessage("Gagal menambahkan ke keranjang. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      setAddingToCart(null);
    }
  };

  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Render Toast notification component
  const renderToastNotification = () => (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        bg={toastVariant}
        text={toastVariant === "light" ? "dark" : "white"}
      >
        <Toast.Header closeButton>
          <strong className="me-auto">
            {toastVariant === "success" ? "Berhasil!" : "Gagal!"}
          </strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
  );

  // Render shop header
  const renderShopHeader = () => (
    <Card className="shop-detail-header mb-4 shadow-sm">
      <Row className="g-0">
        <Col md={4} className="shop-detail-image-container">
          <Image
            src={shop.photoShop}
            alt={shop.name}
            className="shop-detail-image"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        </Col>
        <Col md={8}>
          <Card.Body className="shop-detail-body">
            <Card.Title className="shop-detail-title">{shop.name}</Card.Title>
            <ListGroup variant="flush" className="shop-detail-info">
              <ListGroup.Item>
                <FaMapMarkerAlt className="me-2 text-primary" />
                <span className="text-muted">Alamat:</span> {shop.address}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaUser className="me-2 text-primary" />
                <span className="text-muted">Admin:</span>{" "}
                {shop.admin?.fullName || shop.admin?.username || "Admin"}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaCalendarAlt className="me-2 text-primary" />
                <span className="text-muted">Bergabung:</span>{" "}
                {formatDate(shop.createdAt)}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaBox className="me-2 text-primary" />
                <span className="text-muted">Jumlah Produk:</span>{" "}
                {shop.products?.length || 0} produk
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );

  // Render product card
  const renderProductCard = (product) => (
    <Col key={product.id} md={6} lg={4} xl={3} className="mb-4">
      <Card
        className={`h-100 product-card shadow-sm ${
          addedToCart === product.id ? "added-animation" : ""
        }`}
      >
        <div className="product-image-container">
          <Card.Img
            variant="top"
            src={product.photoProduct}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title className="product-title">{product.name}</Card.Title>

          <Card.Text className="product-description">
            {product.description || "Produk berkualitas tinggi"}
          </Card.Text>

          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="product-price">
                {formatPrice(product.price)}
              </span>
              <Badge
                bg={
                  product.stock > 10
                    ? "success"
                    : product.stock > 0
                    ? "warning"
                    : "danger"
                }
                text={product.stock > 0 ? "dark" : "white"}
                className="stock-badge"
              >
                {product.stock > 10
                  ? "Tersedia"
                  : product.stock > 0
                  ? `Sisa ${product.stock}`
                  : "Stok Habis"}
              </Badge>
            </div>

            <div className="d-grid gap-2">
              <Button
                variant={addedToCart === product.id ? "success" : "warning"}
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0 || addingToCart === product.id}
              >
                {addingToCart === product.id ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Menambahkan...
                  </>
                ) : addedToCart === product.id ? (
                  <>
                    <FaCheck className="me-1" />
                    Ditambahkan
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="me-1" />
                    {product.stock <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                  </>
                )}
              </Button>

              <Link
                to={`/product/${product.id}`}
                className="btn btn-outline-primary detail-btn"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container className="py-5 mt-5">
      {/* Toast notification */}
      {renderToastNotification()}

      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/shop")}
          className="back-button"
        >
          &larr; Kembali ke Daftar Toko
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-container">
            <Spinner animation="border" variant="warning" />
          </div>
          <p className="mt-2 text-muted">Memuat detail toko...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger shadow-sm rounded-3">{error}</div>
      )}

      {/* Shop Detail */}
      {!loading && !error && shop && (
        <>
          {/* Shop Header */}
          {renderShopHeader()}

          {/* Products Section */}
          <div className="shop-products-section">
            <h2 className="section-title mb-4">Produk dari {shop.name}</h2>

            {/* Empty Products State */}
            {(!shop.products || shop.products.length === 0) && (
              <div className="text-center py-5 empty-state">
                <div className="empty-icon mb-3">
                  <span className="display-1 text-muted">🛒</span>
                </div>
                <h3>Belum Ada Produk</h3>
                <p className="text-muted">
                  Toko ini belum memiliki produk yang tersedia
                </p>
              </div>
            )}

            {/* Products Grid */}
            {shop.products && shop.products.length > 0 && (
              <Row>
                {shop.products.map((product) => renderProductCard(product))}
              </Row>
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default ShopDetailPage;
