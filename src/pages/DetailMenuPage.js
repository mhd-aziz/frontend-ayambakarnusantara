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
  ListGroup,
  Modal,
} from "react-bootstrap";
import { getProductById, getProducts } from "../services/MenuService";
import {
  getProductRatings,
  updateRating,
  deleteRating,
} from "../services/RatingService";
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
  Star,
  StarFill,
  StarHalf,
  PencilFill,
  TrashFill,
} from "react-bootstrap-icons";
import "../css/DetailMenuPage.css";

const StarRatingDisplay = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="d-inline-block" style={{ color: "#ffc107" }}>
      {[...Array(fullStars)].map((_, i) => (
        <StarFill key={`full-${i}`} size={size} className="me-1" />
      ))}
      {halfStar && <StarHalf key="half" size={size} className="me-1" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="me-1" />
      ))}
    </div>
  );
};

const StarRatingInput = ({ rating, setRating, size = 24 }) => {
  return (
    <div
      className="d-inline-block"
      style={{ color: "#ffc107", cursor: "pointer" }}
    >
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            onClick={() => setRating(starValue)}
            style={{ marginRight: "5px" }}
          >
            {starValue <= rating ? (
              <StarFill size={size} />
            ) : (
              <Star size={size} />
            )}
          </span>
        );
      })}
    </div>
  );
};

const ProductRatings = ({
  ratingsData,
  isLoading,
  error,
  currentUser,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <Spinner animation="border" size="sm" /> Memuat ulasan...
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">Tidak dapat memuat ulasan saat ini.</Alert>;
  }

  if (
    !ratingsData ||
    !ratingsData.ratings ||
    ratingsData.ratings.length === 0
  ) {
    return <p className="text-muted">Belum ada ulasan untuk produk ini.</p>;
  }

  return (
    <ListGroup variant="flush">
      {ratingsData.ratings.map((rating) => (
        <ListGroup.Item key={rating.ratingId} className="px-0 py-3">
          <Row>
            <Col xs="auto">
              <Image
                src={
                  rating.userPhotoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    rating.userDisplayName || "U"
                  )}&background=C07722&color=fff&size=40`
                }
                roundedCircle
                width="40"
                height="40"
              />
            </Col>
            <Col>
              <div className="d-flex justify-content-between">
                <strong className="mb-1">{rating.userDisplayName}</strong>
                <small className="text-muted">
                  {new Date(rating.createdAt).toLocaleDateString("id-ID")}
                </small>
              </div>
              <div>
                <StarRatingDisplay rating={rating.ratingValue} size={14} />
              </div>
              <p className="mb-0 mt-2">{rating.reviewText}</p>
              {currentUser?.uid === rating.userId && (
                <div className="mt-2 text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(rating)}
                  >
                    <PencilFill /> Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(rating.ratingId)}
                  >
                    <TrashFill /> Hapus
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

const RelatedProducts = ({ products, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <Spinner animation="border" size="sm" /> Memuat produk terkait...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="info">Tidak dapat memuat produk terkait saat ini.</Alert>
    );
  }

  if (!products || products.length === 0) {
    return <p className="text-muted">Tidak ada produk lain dari toko ini.</p>;
  }

  return (
    <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
      {products.map((product) => (
        <Col key={product._id}>
          <Card
            as={Link}
            to={`/menu/${product._id}`}
            className="h-100 text-decoration-none product-card-related shadow-sm"
          >
            <Card.Img
              variant="top"
              src={
                product.productImageURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  product.name
                )}&background=EFEFEF&color=AAAAAA&size=250`
              }
              style={{
                height: "150px",
                objectFit: "cover",
              }}
            />
            <Card.Body>
              <Card.Title className="product-card-title-related">
                {product.name}
              </Card.Title>
              <Card.Text className="product-card-price-related fw-bold">
                Rp {product.price.toLocaleString("id-ID")}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

function DetailMenuPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, isLoggedIn } = useAuth();
  const { addItem: addItemToCartContext, isLoading: isCartLoading } = useCart();

  const [menuItem, setMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartSuccessMessage, setAddToCartSuccessMessage] = useState("");
  const [isProcessingCartAction, setIsProcessingCartAction] = useState(false);

  const [ratingsData, setRatingsData] = useState(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [errorRelated, setErrorRelated] = useState(null);

  const [showEditRatingModal, setShowEditRatingModal] = useState(false);
  const [ratingToEdit, setRatingToEdit] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editReviewText, setEditReviewText] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [ratingToDeleteId, setRatingToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPageData = useCallback(async () => {
    if (!productId) {
      setError("ID Produk tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsLoadingRatings(true);
    setErrorRatings(null);
    setIsLoadingRelated(true);
    setErrorRelated(null);

    try {
      const [productResponse, ratingsResponse, allProductsResponse] =
        await Promise.all([
          getProductById(productId),
          getProductRatings(productId),
          getProducts({ limit: 5 }),
        ]);

      if (productResponse && productResponse.data) {
        let finalProductData = productResponse.data;
        if (
          ratingsResponse &&
          ratingsResponse.success &&
          ratingsResponse.data.productDetails
        ) {
          finalProductData = {
            ...finalProductData,
            ...ratingsResponse.data.productDetails,
          };
        }
        setMenuItem(finalProductData);
      } else {
        const productError = new Error(
          productResponse?.message || "Produk tidak ditemukan."
        );
        productError.response = productResponse;
        throw productError;
      }

      if (ratingsResponse && ratingsResponse.success) {
        setRatingsData(ratingsResponse.data);
      } else {
        setErrorRatings(
          ratingsResponse?.message || "Gagal mengambil data rating."
        );
      }

      if (allProductsResponse && allProductsResponse.data) {
        const filteredProducts = allProductsResponse.data.products
          .filter((p) => p._id !== productId)
          .slice(0, 4);
        setRelatedProducts(filteredProducts);
      } else {
        setErrorRelated("Gagal mengambil produk terkait.");
      }
    } catch (err) {
      setError(err.message || "Gagal mengambil detail produk.");
    } finally {
      setIsLoading(false);
      setIsLoadingRatings(false);
      setIsLoadingRelated(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchPageData();
  }, [productId, fetchPageData]);

  const handleShowEditModal = (rating) => {
    setRatingToEdit(rating);
    setEditRatingValue(rating.ratingValue);
    setEditReviewText(rating.reviewText);
    setEditError("");
    setShowEditRatingModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditRatingModal(false);
    setRatingToEdit(null);
  };

  const handleUpdateRating = async () => {
    if (!ratingToEdit) return;
    if (editRatingValue === 0) {
      setEditError("Rating bintang wajib diisi.");
      return;
    }
    setIsSubmittingEdit(true);
    setEditError("");
    try {
      await updateRating(ratingToEdit.ratingId, {
        ratingValue: editRatingValue,
        reviewText: editReviewText,
      });
      handleCloseEditModal();
      fetchPageData();
    } catch (err) {
      setEditError(err.message || "Terjadi kesalahan saat memperbarui ulasan.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleShowDeleteModal = (id) => {
    setRatingToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setRatingToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!ratingToDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteRating(ratingToDeleteId);
      handleCloseDeleteModal();
      fetchPageData();
    } catch (err) {
      alert("Gagal menghapus ulasan: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + change;
      if (newQuantity < 1) return 1;
      const currentProduct = menuItem;
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
    const currentProduct = menuItem;
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
      const itemData = { productId, quantity };
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
    } finally {
      setIsProcessingCartAction(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    const nameForAvatar = e.target.alt || "Produk";
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nameForAvatar
    )}&background=EFEFEF&color=AAAAAA&size=600`;
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

  const currentProduct = menuItem;

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
        <Breadcrumb className="breadcrumb-custom">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/menu" }}>
            Menu
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{currentProduct.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Card className="border-0 shadow-sm detail-menu-card-wrapper mb-4">
          <Card.Body>
            <Row className="detail-menu-card">
              <Col lg={6} md={5} className="mb-4 mb-md-0 detail-menu-image-col">
                <Image
                  src={
                    currentProduct.productImageURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentProduct.name || "Produk"
                    )}&background=EFEFEF&color=AAAAAA&size=600`
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
                <div className="mb-3">
                  <StarRatingDisplay
                    rating={currentProduct.averageRating || 0}
                  />
                  <span className="ms-2 text-muted">
                    ({currentProduct.ratingCount || 0} ulasan)
                  </span>
                </div>
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
                  <>
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
                            disabled={quantity <= 1}
                          >
                            <DashLg />
                          </Button>
                          <Form.Control
                            id="quantity-input"
                            type="text"
                            value={quantity}
                            readOnly
                            className="text-center fw-bold border-start-0 border-end-0"
                            style={{
                              maxWidth: "50px",
                              backgroundColor: "#fff",
                            }}
                          />
                          <Button
                            variant="outline-secondary"
                            className="rounded-end"
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= currentProduct.stock}
                          >
                            <PlusLg />
                          </Button>
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row className="mt-4 actions-row gx-2">
                      <Col xs={12} sm={6} className="mb-2 mb-sm-0 d-grid">
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate(-1)}
                          className="btn-action shadow-sm"
                        >
                          <ArrowLeft className="me-1" />
                          Kembali
                        </Button>
                      </Col>
                      <Col xs={12} sm={6} className="d-grid">
                        <Button
                          variant="primary"
                          onClick={handleAddToCartClick}
                          disabled={isProcessingCartAction || isCartLoading}
                          className="btn-add-to-cart btn-action shadow-sm"
                          style={{
                            backgroundColor: "var(--brand-primary, #c0392b)",
                            borderColor: "var(--brand-primary, #c0392b)",
                          }}
                        >
                          {isProcessingCartAction || isCartLoading ? (
                            <Spinner as="span" animation="border" size="sm" />
                          ) : (
                            <>
                              {" "}
                              <CartPlusFill className="me-2" /> Tambah Keranjang{" "}
                            </>
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mt-4 border-0 shadow-sm">
          <Card.Header as="h5">Ulasan Produk</Card.Header>
          <Card.Body>
            <ProductRatings
              ratingsData={ratingsData}
              isLoading={isLoadingRatings}
              error={errorRatings}
              currentUser={currentUser}
              onEdit={handleShowEditModal}
              onDelete={handleShowDeleteModal}
            />
          </Card.Body>
        </Card>

        <Card className="mt-4 border-0 shadow-sm">
          <Card.Header as="h5">Mungkin Anda Suka</Card.Header>
          <Card.Body>
            <RelatedProducts
              products={relatedProducts}
              isLoading={isLoadingRelated}
              error={errorRelated}
            />
          </Card.Body>
        </Card>
      </Container>
      <Modal show={showEditRatingModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Ulasan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Form>
            <Form.Group className="mb-3 text-center">
              <Form.Label>Rating Anda</Form.Label>
              <br />
              <StarRatingInput
                rating={editRatingValue}
                setRating={setEditRatingValue}
                size={24}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ulasan Anda</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editReviewText}
                onChange={(e) => setEditReviewText(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateRating}
            disabled={isSubmittingEdit}
          >
            {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showDeleteConfirmModal}
        onHide={handleCloseDeleteModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>Anda yakin ingin menghapus ulasan ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Tidak
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DetailMenuPage;
