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
  Alert,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  FaShoppingCart,
  FaMapMarkerAlt,
  FaClock,
  FaArrowLeft,
  FaShareAlt,
  FaCheckCircle,
  FaUtensils,
  FaStar,
  FaStarHalfAlt,
  FaUser,
  FaComment,
  FaCalendarAlt,
} from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import apiService from "../../services/api";
import "../../assets/styles/productDetail.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart: contextAddToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [stockInfo, setStockInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Rating state
  const [userRating, setUserRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);

  // UI state untuk menghandle proses menambahkan ke keranjang
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Fetch product details
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch product details
        const data = await apiService.getProductById(productId);
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);

        // Fetch stock information
        const stockData = await apiService.getProductStock(productId);
        setStockInfo(stockData);

        // Fetch user rating if authenticated
        if (isAuthenticated) {
          try {
            setLoadingRating(true);
            const ratingData = await apiService.getUserProductRating(productId);
            setUserRating(ratingData);
          } catch (err) {
            console.log(
              `No rating found or error fetching rating for product ${productId}`
            );
            setUserRating(null);
          } finally {
            setLoadingRating(false);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(
          "Terjadi kesalahan saat mengambil detail produk. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
      // Reset states when product changes
      setAddedToCart(false);
      setQuantity(1);
      setSelectedImage(0);
      setUserRating(null);
    }
  }, [productId, isAuthenticated]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    // Show loading state
    setAddingToCart(true);

    try {
      // Call API to add to cart
      await apiService.addToCart(product.id, quantity);

      // Also update local context for UI consistency
      contextAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        photoProduct: product.photoProduct,
        quantity: quantity,
        shop: product.shop,
      });

      // Show success toast
      setToastVariant("success");
      setToastMessage(`${product.name} berhasil ditambahkan ke keranjang!`);
      setShowToast(true);

      // Show added to cart indicator
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);

      console.log("Successfully added to cart:", product.name);
    } catch (err) {
      console.error("Error adding product to cart:", err);

      // Show error toast
      setToastVariant("danger");
      setToastMessage("Gagal menambahkan ke keranjang. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      // Remove loading state
      setAddingToCart(false);
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

  // Format datetime
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (product && stockInfo) {
      const max = stockInfo.stock;
      if (newQuantity > 0 && newQuantity <= max) {
        setQuantity(newQuantity);
      }
    }
  };

  // Generate mock images for product gallery (would normally come from API)
  const getProductGallery = () => {
    if (!product) return [];

    // Main product image plus some generated variations for demo
    return [
      product.photoProduct,
      product.photoProduct, // In real app, these would be different angles/views
      product.photoProduct,
    ];
  };

  // Render star rating component
  const renderStarRating = (ratingValue) => {
    // Convert rating to number
    const rating = parseFloat(ratingValue);

    return (
      <div className="user-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => {
          // Full star
          if (star <= Math.floor(rating)) {
            return <FaStar key={star} className="text-warning" />;
          }
          // Half star
          else if (star === Math.ceil(rating) && !Number.isInteger(rating)) {
            return <FaStarHalfAlt key={star} className="text-warning" />;
          }
          // Empty star
          else {
            return <FaStar key={star} className="text-muted" />;
          }
        })}
        <span className="ms-1 rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Render user rating details
  const renderUserRating = () => {
    if (loadingRating) {
      return (
        <div className="user-rating-loading">
          <Spinner animation="border" size="sm" variant="warning" />
          <span className="ms-2">Memuat rating...</span>
        </div>
      );
    }

    if (!userRating) {
      return (
        <div className="user-rating-empty">
          <p className="text-muted">
            Anda belum memberikan rating untuk produk ini
          </p>
        </div>
      );
    }

    return (
      <div className="user-rating-details">
        <div className="user-rating-header">
          <h5>Rating Anda</h5>
          {renderStarRating(userRating.value)}
        </div>

        <div className="user-rating-body">
          <div className="user-rating-comment">
            <FaComment className="me-2 text-secondary" />
            <p>"{userRating.comment}"</p>
          </div>

          <div className="user-rating-meta">
            <div className="user-rating-meta-item">
              <FaUser className="me-1 text-secondary" />
              <span>User ID: {userRating.userId}</span>
            </div>
            <div className="user-rating-meta-item">
              <FaCalendarAlt className="me-1 text-secondary" />
              <span>Dibuat: {formatDateTime(userRating.createdAt)}</span>
            </div>
            {userRating.createdAt !== userRating.updatedAt && (
              <div className="user-rating-meta-item">
                <FaClock className="me-1 text-secondary" />
                <span>Diperbarui: {formatDateTime(userRating.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container className="py-5 mt-5 product-detail-container">
      {/* Toast notification */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1070 }}
      >
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

      {/* Back button */}
      <Button
        variant="link"
        className="mb-4 back-button"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" /> Kembali ke Menu
      </Button>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5 loading-container">
          <Spinner animation="border" variant="warning" className="mb-3" />
          <p>Memuat detail produk...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="danger" className="error-alert">
          <Alert.Heading>Terjadi Kesalahan</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Kembali ke Menu
          </Button>
        </Alert>
      )}

      {/* Product Details */}
      {!loading && !error && product && (
        <div className="product-detail-wrapper">
          <Row>
            {/* Product Image Gallery */}
            <Col md={5} className="mb-4">
              <div className="product-gallery">
                <div className="main-image-container">
                  <Image
                    src={getProductGallery()[selectedImage]}
                    alt={product.name}
                    className="main-product-image"
                    fluid
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x400?text=No+Image";
                    }}
                  />
                  {stockInfo && !stockInfo.isAvailable && (
                    <div className="out-of-stock-overlay">
                      <span>Stok Habis</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail gallery */}
                <div className="thumbnail-gallery">
                  {getProductGallery().map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${
                        selectedImage === index ? "active" : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - view ${index + 1}`}
                        thumbnail
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/100x100?text=No+Image";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Product Information */}
            <Col md={7}>
              <div className="product-info-container">
                <div className="product-header">
                  <h1 className="product-title">{product.name}</h1>
                </div>

                {/* Shop Information */}
                <div className="shop-info">
                  <Image
                    src={product.shop?.photoShop}
                    alt={product.shop?.name}
                    className="shop-logo"
                    roundedCircle
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40x40?text=S";
                    }}
                  />
                  <div className="shop-details">
                    <h5 className="shop-name">{product.shop?.name}</h5>
                    <p className="shop-address">
                      <FaMapMarkerAlt />{" "}
                      {product.shop?.address || "Jakarta, Indonesia"}
                    </p>
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="price-container">
                  <h2 className="product-price">
                    {formatPrice(product.price)}
                  </h2>
                  {stockInfo && (
                    <div className="stock-info">
                      <Badge
                        bg={stockInfo.isAvailable ? "success" : "danger"}
                        className="stock-badge"
                      >
                        {stockInfo.isAvailable ? "Tersedia" : "Stok Habis"}
                      </Badge>
                      <span className="stock-count">
                        Stok: <strong>{stockInfo.stock}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Benefits */}
                <div className="product-benefits">
                  <div className="benefit-item">
                    <FaCheckCircle /> <span>100% Daging Ayam Segar</span>
                  </div>
                  <div className="benefit-item">
                    <FaCheckCircle /> <span>Tanpa Bahan Pengawet</span>
                  </div>
                  <div className="benefit-item">
                    <FaUtensils /> <span>Penyajian Cepat</span>
                  </div>
                </div>

                {/* Description */}
                <div className="product-description">
                  <h5>Deskripsi</h5>
                  <p>
                    {product.description ||
                      "Ayam bakar dengan bumbu rahasia khas Indonesia yang dimasak dengan sempurna untuk menghasilkan cita rasa yang autentik dan lezat."}
                  </p>
                </div>

                {/* User Rating Details */}
                {isAuthenticated && (
                  <div className="user-rating-container">
                    <h5>Rating Pengguna</h5>
                    <Card className="user-rating-card">
                      <Card.Body>{renderUserRating()}</Card.Body>
                    </Card>
                  </div>
                )}

                {/* Add to Cart Section */}
                {stockInfo && stockInfo.isAvailable && (
                  <div className="cart-actions">
                    <div className="quantity-control">
                      <Button
                        variant="outline-secondary"
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="quantity-value">{quantity}</span>
                      <Button
                        variant="outline-secondary"
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= stockInfo.stock}
                      >
                        +
                      </Button>
                    </div>

                    <div className="action-buttons">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Bagikan Produk</Tooltip>}
                      >
                        <Button variant="outline-primary" className="share-btn">
                          <FaShareAlt />
                        </Button>
                      </OverlayTrigger>

                      <Button
                        variant={addedToCart ? "success" : "warning"}
                        className={`add-to-cart-btn ${
                          addedToCart ? "added" : ""
                        }`}
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                      >
                        {addingToCart ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Menambahkan...
                          </>
                        ) : addedToCart ? (
                          <>
                            <FaCheckCircle className="me-2" />
                            Ditambahkan
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="me-2" />
                            Tambah ke Keranjang
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="subtotal">
                      Subtotal:{" "}
                      <strong>{formatPrice(product.price * quantity)}</strong>
                    </div>
                  </div>
                )}

                {/* Product Metadata */}
                <div className="product-metadata">
                  <div className="metadata-item">
                    <FaClock className="metadata-icon" />
                    <span>Ditambahkan: {formatDate(product.createdAt)}</span>
                  </div>
                  <div className="metadata-item">
                    <FaClock className="metadata-icon" />
                    <span>Diperbarui: {formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Related Products */}
      {!loading && !error && relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h3 className="section-title">Produk yang Mungkin Anda Suka</h3>

          <Row>
            {relatedProducts.map((product) => (
              <Col key={product.id} md={6} lg={3} className="mb-4">
                <Card className="related-product-card">
                  <div className="related-product-img-container">
                    <Card.Img
                      variant="top"
                      src={product.photoProduct}
                      alt={product.name}
                      className="related-product-img"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                    <div className="card-overlay">
                      <Link
                        to={`/product/${product.id}`}
                        className="view-details-btn"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>

                  <Card.Body>
                    <Card.Title className="related-product-title">
                      {product.name}
                    </Card.Title>

                    <div className="related-product-shop">
                      <img
                        src={product.shop?.photoShop}
                        alt={product.shop?.name}
                        className="related-shop-img"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/20x20?text=S";
                        }}
                      />
                      <span>{product.shop?.name}</span>
                    </div>

                    <div className="related-product-price">
                      {formatPrice(product.price)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default ProductDetailPage;
