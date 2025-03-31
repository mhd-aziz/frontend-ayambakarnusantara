import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Nav,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { FaShoppingCart, FaStar, FaCheck } from "react-icons/fa";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import "../../assets/styles/menu.css";

const MenuPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart: contextAddToCart } = useContext(CartContext);

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});

  // UI states
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [addedToCart, setAddedToCart] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await apiService.getProducts();
        setProducts(data.products || []);

        // Extract unique categories
        if (data.products && data.products.length > 0) {
          const uniqueCategories = [
            ...new Set(data.products.map((p) => p.category || "Uncategorized")),
          ];
          setCategories(uniqueCategories);
        }

        // Fetch ratings for each product
        for (const product of data.products) {
          const productRatings = await apiService.getProductRatings(product.id);
          setRatings((prevRatings) => ({
            ...prevRatings,
            [product.id]: productRatings.statistics.averageRating,
          }));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          "Terjadi kesalahan saat mengambil data menu. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated]);

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
        shop: product.shop,
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

  // Filter products based on category
  const filteredProducts = products.filter((product) => {
    return activeCategory === "all" || product.category === activeCategory;
  });

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

  // Render category navigation
  const renderCategoryNav = () => (
    <div className="category-nav mb-4">
      <Nav
        variant="pills"
        className="category-pills justify-content-center flex-wrap"
      >
        <Nav.Item>
          <Nav.Link
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className="category-pill"
          >
            Semua Menu
          </Nav.Link>
        </Nav.Item>
        {categories.map((category) => (
          <Nav.Item key={category}>
            <Nav.Link
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className="category-pill"
            >
              {category}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
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
          {product.category && (
            <Badge bg="warning" text="dark" className="category-badge">
              {product.category}
            </Badge>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title className="product-title">{product.name}</Card.Title>

          <div className="mb-2 shop-info">
            <img
              src={product.shop?.photoShop}
              alt={product.shop?.name}
              className="shop-image me-1"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/20x20?text=S";
              }}
            />
            <span className="shop-name">{product.shop?.name}</span>
          </div>

          {/* Rating */}
          <div className="mb-2 product-rating">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.floor(ratings[product.id])
                    ? "text-warning"
                    : "text-muted"
                }
              />
            ))}
            <span className="ms-1 rating-text">
              {ratings[product.id] || "N/A"}
            </span>
          </div>

          <Card.Text className="product-description">
            {product.description || "Ayam bakar dengan cita rasa istimewa"}
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

      <div className="menu-header mb-4">
        <h1 className="menu-title text-center">Menu Ayam Bakar Nusantara</h1>
        <p className="menu-subtitle text-center text-muted">
          Kelezatan autentik dengan bumbu rempah pilihan
        </p>
      </div>

      {/* Category Navigation */}
      {renderCategoryNav()}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-container">
            <Spinner animation="border" variant="warning" />
          </div>
          <p className="mt-2 text-muted">Memuat menu lezat untuk Anda...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger shadow-sm rounded-3">{error}</div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-5 empty-state">
          <div className="empty-icon mb-3">
            <span className="display-1 text-muted">🍽️</span>
          </div>
          <h3>Tidak ada menu yang ditemukan</h3>
          <p className="text-muted">
            Coba pilih kategori lain atau kembali nanti
          </p>
          <Button
            variant="outline-warning"
            onClick={() => setActiveCategory("all")}
          >
            Lihat Semua Menu
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length > 0 && (
        <>
          <p className="mb-4 results-count text-center">
            Menampilkan {filteredProducts.length} menu
            {activeCategory !== "all" && ` dalam kategori ${activeCategory}`}
          </p>

          <Row>
            {filteredProducts.map((product) => renderProductCard(product))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default MenuPage;
