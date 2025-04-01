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
  ProgressBar,
  Form,
  Modal,
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
  FaRegStar,
  FaUser,
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

  // Ratings state
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [ratingPage, setRatingPage] = useState(1);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Rating submission state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [userRatingHover, setUserRatingHover] = useState(0);

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
    }
  }, [productId, isAuthenticated]);

  // Fetch product ratings
  useEffect(() => {
    const fetchProductRatings = async () => {
      if (!productId) return;

      setLoadingRatings(true);
      try {
        const ratingData = await apiService.getProductRatings(productId, {
          page: ratingPage,
          limit: 10,
          sort: "newest",
        });

        setRatings(ratingData.ratings);
        setRatingStats(ratingData.statistics);
      } catch (err) {
        console.error("Error fetching product ratings:", err);
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchProductRatings();
  }, [productId, ratingPage]);

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
    return [product.photoProduct];
  };

  // Render star rating
  const renderStarRating = (value, size = "1em") => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value - fullStars >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`full-${i}`}
          style={{ color: "#FFD700", fontSize: size }}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt
          key="half"
          style={{ color: "#FFD700", fontSize: size }}
        />
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar
          key={`empty-${i}`}
          style={{ color: "#FFD700", fontSize: size }}
        />
      );
    }

    return stars;
  };

  // Load more ratings
  const handleLoadMoreRatings = () => {
    if (ratingStats && ratingPage < ratingStats.pagination?.totalPages) {
      setRatingPage((prevPage) => prevPage + 1);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${productId}` } });
      return;
    }

    if (userRating === 0) {
      setToastVariant("warning");
      setToastMessage("Silakan pilih rating terlebih dahulu.");
      setShowToast(true);
      return;
    }

    setSubmittingRating(true);

    try {
      await apiService.createOrUpdateRating(
        productId,
        userRating,
        ratingComment
      );

      // Reset form
      setUserRating(0);
      setRatingComment("");

      // Close modal
      setShowRatingModal(false);

      // Show success message
      setToastVariant("success");
      setToastMessage("Ulasan berhasil dikirim. Terima kasih!");
      setShowToast(true);

      // Refresh ratings
      const ratingData = await apiService.getProductRatings(productId, {
        page: 1,
        limit: 10,
        sort: "newest",
      });

      setRatings(ratingData.ratings);
      setRatingStats(ratingData.statistics);
      setRatingPage(1);
    } catch (error) {
      console.error("Error submitting rating:", error);
      setToastVariant("danger");
      setToastMessage("Anda belum membeli produk ini");
      setShowToast(true);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle rating star click
  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  // Handle rating hover
  const handleStarHover = (rating) => {
    setUserRatingHover(rating);
  };

  // Reset rating hover
  const handleStarHoverLeave = () => {
    setUserRatingHover(0);
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

                  {/* Product Rating Summary */}
                  {ratingStats && (
                    <div className="product-rating-summary">
                      <div className="rating-number">
                        <span className="average-rating">
                          {ratingStats.averageRating?.toFixed(1)}
                        </span>
                        <span className="total-ratings">
                          ({ratingStats.totalRatings} ulasan)
                        </span>
                      </div>
                      <div className="star-rating">
                        {renderStarRating(ratingStats.averageRating)}
                      </div>
                    </div>
                  )}
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

          {/* Product Ratings Section */}
          <Row className="mt-5">
            <Col xs={12}>
              <div className="ratings-section">
                <div className="section-header">
                  <h3 className="section-title">Ulasan Produk</h3>
                  {isAuthenticated && (
                    <Button
                      variant="warning"
                      className="add-rating-btn"
                      onClick={() => setShowRatingModal(true)}
                    >
                      Tulis Ulasan
                    </Button>
                  )}
                </div>

                {ratingStats && (
                  <div className="rating-summary-container">
                    <Row className="align-items-center">
                      <Col md={4} className="text-center">
                        <div className="overall-rating">
                          <div className="rating-value">
                            {ratingStats.averageRating?.toFixed(1)}
                          </div>
                          <div className="rating-stars">
                            {renderStarRating(
                              ratingStats.averageRating,
                              "1.5em"
                            )}
                          </div>
                          <div className="rating-count">
                            {ratingStats.totalRatings} ulasan
                          </div>
                        </div>
                      </Col>

                      <Col md={8}>
                        <div className="rating-distribution">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const distribution = ratingStats.distribution?.find(
                              (d) => d.value === star
                            );
                            const count = distribution?.count || 0;
                            const percentage =
                              ratingStats.totalRatings > 0
                                ? (count / ratingStats.totalRatings) * 100
                                : 0;

                            return (
                              <div key={star} className="rating-bar">
                                <div className="star-label">
                                  {star} <FaStar style={{ color: "#FFD700" }} />
                                </div>
                                <ProgressBar
                                  now={percentage}
                                  className="rating-progress"
                                  variant="warning"
                                />
                                <div className="rating-count-label">
                                  {count}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Individual Ratings */}
                <div className="individual-ratings mt-4">
                  {loadingRatings && (
                    <div className="text-center py-3">
                      <Spinner animation="border" variant="warning" size="sm" />
                      <span className="ms-2">Memuat ulasan...</span>
                    </div>
                  )}

                  {!loadingRatings && ratings.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        Belum ada ulasan untuk produk ini.
                      </p>
                    </div>
                  )}

                  {ratings.map((rating) => (
                    <Card key={rating.id} className="rating-card mb-3">
                      <Card.Body>
                        <div className="rating-header">
                          <div className="user-info">
                            <div className="user-avatar">
                              {rating.user.photoUser ? (
                                <Image
                                  src={rating.user.photoUser}
                                  roundedCircle
                                  alt={rating.user.username}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/40x40?text=U";
                                  }}
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  <FaUser />
                                </div>
                              )}
                            </div>
                            <div className="user-details">
                              <div className="username">
                                {rating.user.username}
                              </div>
                              <div className="rating-date">
                                {formatDate(rating.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="rating-stars">
                            {renderStarRating(rating.value)}
                          </div>
                        </div>
                        <div className="rating-comment mt-3">
                          {rating.comment ||
                            "Pengguna tidak meninggalkan komentar."}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  {/* Load More Button */}
                  {ratingStats &&
                    ratingPage < ratingStats.pagination?.totalPages && (
                      <div className="text-center mt-3">
                        <Button
                          variant="outline-warning"
                          onClick={handleLoadMoreRatings}
                          disabled={loadingRatings}
                        >
                          {loadingRatings ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Memuat...
                            </>
                          ) : (
                            "Lihat Lebih Banyak Ulasan"
                          )}
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Rating Submission Modal */}
          <Modal
            show={showRatingModal}
            onHide={() => setShowRatingModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Tulis Ulasan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleRatingSubmit}>
                <Form.Group className="mb-4 text-center">
                  <Form.Label>Berikan rating untuk "{product.name}"</Form.Label>
                  <div
                    className="rating-stars-input"
                    onMouseLeave={handleStarHoverLeave}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        className="star-input-icon"
                      >
                        {star <= (userRatingHover || userRating) ? (
                          <FaStar className="star-filled" />
                        ) : (
                          <FaRegStar className="star-empty" />
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="rating-label mt-2">
                    {userRatingHover === 1 && "Sangat Buruk"}
                    {userRatingHover === 2 && "Buruk"}
                    {userRatingHover === 3 && "Biasa Saja"}
                    {userRatingHover === 4 && "Bagus"}
                    {userRatingHover === 5 && "Sangat Bagus"}
                    {userRatingHover === 0 &&
                      userRating === 1 &&
                      "Sangat Buruk"}
                    {userRatingHover === 0 && userRating === 2 && "Buruk"}
                    {userRatingHover === 0 && userRating === 3 && "Biasa Saja"}
                    {userRatingHover === 0 && userRating === 4 && "Bagus"}
                    {userRatingHover === 0 &&
                      userRating === 5 &&
                      "Sangat Bagus"}
                    {userRatingHover === 0 &&
                      userRating === 0 &&
                      "Pilih rating"}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Komentar (Opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Bagikan pengalaman Anda dengan produk ini..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="warning"
                    type="submit"
                    disabled={submittingRating}
                  >
                    {submittingRating ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Ulasan"
                    )}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
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
