// src/pages/CartPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Image,
  InputGroup,
  Form,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../services/CartService";
import { Trash, PlusLg, DashLg, CartX } from "react-bootstrap-icons";
import "../css/CartPage.css"; // We will create this CSS file

function CartPage() {
  const { isLoggedIn } = useAuth(); // Removed 'user' as it was unused
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const fetchCartDetails = useCallback(async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/keranjang" } });
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await getCart();
      // Assuming the backend response for an empty cart or successful fetch
      // will have a 'success: true' or 'status: "success"' field.
      if (response.status === "success" || response.success === true) {
        setCart(response.data);
      } else {
        // This case handles scenarios where the API call itself was 'successful' (e.g., 200 OK)
        // but the business logic indicates an issue (e.g., cart not found but not a 404 error from service)
        if (response.message === "Keranjang Anda kosong." && response.data) {
          setCart(response.data); // Handles specific empty cart message
        } else {
          setError(
            response.message || "Gagal memuat keranjang. Respons tidak sesuai."
          );
        }
      }
    } catch (err) {
      // This catch block now primarily handles network errors or errors thrown by CartService
      if (err.message === "Keranjang Anda kosong." && err.data) {
        setCart(err.data); // Specific handling for empty cart from CartService's 404 adaptation
      } else {
        setError(
          err.message ||
            "Terjadi kesalahan fatal saat mengambil data keranjang."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchCartDetails();
  }, [fetchCartDetails]);

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      handleRemoveItem(
        productId,
        "Mengurangi kuantitas menjadi 0 akan menghapus item ini. Lanjutkan?"
      );
      return;
    }

    setUpdatingItemId(productId);
    try {
      const response = await updateCartItemQuantity(productId, newQuantity);
      if (response.status === "success" || response.success === true) {
        setCart(response.data);
      } else {
        alert(response.message || "Gagal memperbarui kuantitas.");
        fetchCartDetails();
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat memperbarui kuantitas.");
      fetchCartDetails();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (
    productId,
    confirmMessage = "Anda yakin ingin menghapus item ini dari keranjang?"
  ) => {
    if (!window.confirm(confirmMessage)) return;
    setUpdatingItemId(productId);
    try {
      const response = await removeCartItem(productId);
      if (response.status === "success" || response.success === true) {
        setCart(response.data);
        alert(response.message || "Produk berhasil dihapus dari keranjang.");
      } else {
        alert(response.message || "Gagal menghapus produk dari keranjang.");
        fetchCartDetails();
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat menghapus produk.");
      fetchCartDetails();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    setShowClearConfirmModal(false);
    setIsClearingCart(true);
    try {
      const response = await clearCart();
      if (response.status === "success" || response.success === true) {
        setCart(response.data);
        alert(response.message || "Keranjang berhasil dikosongkan.");
      } else {
        alert(response.message || "Gagal mengosongkan keranjang.");
        fetchCartDetails();
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat mengosongkan keranjang.");
      fetchCartDetails();
    } finally {
      setIsClearingCart(false);
    }
  };

  const openClearConfirmModal = () => setShowClearConfirmModal(true);
  const closeClearConfirmModal = () => setShowClearConfirmModal(false);

  const handleImageError = (e, itemName = "Produk") => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/100x100/EFEFEF/AAAAAA?text=${encodeURIComponent(
      itemName
    )}`;
  };

  if (!isLoggedIn) {
    return (
      <Container className="text-center py-5">
        <Alert variant="warning">
          Silakan{" "}
          <Link to="/login" state={{ from: "/keranjang" }}>
            login
          </Link>{" "}
          untuk melihat keranjang Anda.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5 cart-loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 lead">Memuat Keranjang Anda...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger" className="cart-error-alert">
          <Alert.Heading>Oops! Terjadi Kesalahan</Alert.Heading>
          <p>{error}</p>
          <Button
            onClick={fetchCartDetails}
            variant="danger"
            className="btn-brand-retry"
          >
            Coba Lagi
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!cart || !cart.items) {
    // This can happen if the initial fetchCartDetails leads to an error that doesn't set cart,
    // or if the "empty cart" response from the API doesn't correctly initialize cart.data
    return (
      <Container className="text-center py-5">
        <Alert variant="info" className="cart-empty-alert">
          <CartX size={48} className="mb-3 text-muted" />
          <Alert.Heading as="h4">Keranjang Tidak Dapat Dimuat</Alert.Heading>
          <p>
            Kami tidak dapat memuat keranjang Anda saat ini. Silakan coba lagi.
          </p>
          <div className="mt-3">
            <Button
              as={Link}
              to="/menu"
              variant="primary"
              className="me-2 btn-brand"
            >
              Lihat Menu
            </Button>
            <Button onClick={fetchCartDetails} variant="outline-secondary">
              Muat Ulang Keranjang
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4 cart-page-container">
      <h1 className="mb-4 cart-title">Keranjang Belanja Anda</h1>
      {cart.items.length === 0 ? (
        <Alert
          variant="light"
          className="text-center py-5 cart-empty-alert shadow-sm"
        >
          <CartX size={60} className="mb-3 text-primary-emphasis" />
          <h3 className="text-primary-emphasis">Keranjang Anda Kosong</h3>
          <p className="lead text-muted">
            Sepertinya Anda belum menambahkan produk apapun ke keranjang.
          </p>
          <Button
            as={Link}
            to="/menu"
            variant="primary"
            size="lg"
            className="mt-3 btn-brand"
          >
            Mulai Belanja
          </Button>
        </Alert>
      ) : (
        <Row>
          <Col lg={8} className="cart-items-column mb-4 mb-lg-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                Produk di Keranjang (
                {cart.items.reduce((acc, item) => acc + item.quantity, 0)})
              </h4>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={openClearConfirmModal}
                disabled={isClearingCart || cart.items.length === 0}
                className="btn-clear-cart"
              >
                {isClearingCart ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  <>
                    <Trash className="me-1" /> Kosongkan
                  </>
                )}
              </Button>
            </div>
            <ListGroup variant="flush" className="cart-item-list">
              {cart.items.map((item) => (
                <ListGroup.Item key={item.productId} className="cart-item">
                  <Row className="align-items-center gy-2">
                    <Col xs={3} sm={2} className="text-center">
                      <Image
                        src={
                          item.productImageURL ||
                          `https://placehold.co/80x80/EFEFEF/AAAAAA?text=${encodeURIComponent(
                            item.name
                          )}`
                        }
                        alt={item.name}
                        onError={(e) => handleImageError(e, item.name)}
                        className="cart-item-image"
                      />
                    </Col>
                    <Col xs={9} sm={4} className="cart-item-details">
                      <Link
                        to={`/menu/${item.productId}`}
                        className="cart-item-name text-decoration-none fw-semibold"
                      >
                        {item.name}
                      </Link>
                      {item.shopId && ( // Conditionally render shop link if shopId exists
                        <div className="cart-item-shop">
                          <Link
                            to={`/toko/${item.shopId}`}
                            className="small text-muted text-decoration-none"
                          >
                            Toko: {item.shopName || "Kunjungi Toko"}
                          </Link>
                        </div>
                      )}
                      <div className="cart-item-price-single d-sm-none small text-muted">
                        Rp {item.price.toLocaleString("id-ID")} / item
                      </div>
                    </Col>
                    <Col
                      xs={7}
                      sm={3}
                      className="mt-2 mt-sm-0 cart-item-quantity"
                    >
                      <InputGroup size="sm" className="quantity-input-group">
                        <Button
                          variant="outline-secondary"
                          className="quantity-btn"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity,
                              -1
                            )
                          }
                          disabled={
                            updatingItemId === item.productId ||
                            item.quantity <= 0 // Disable if 0, as it should be removed then
                          }
                        >
                          <DashLg />
                        </Button>
                        <Form.Control
                          type="text"
                          value={item.quantity}
                          readOnly
                          className="text-center quantity-display"
                          aria-label={`Kuantitas untuk ${item.name}`}
                        />
                        <Button
                          variant="outline-secondary"
                          className="quantity-btn"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity,
                              1
                            )
                          }
                          disabled={updatingItemId === item.productId}
                          // Consider adding: || item.quantity >= item.maxStock (if maxStock is available from backend)
                        >
                          <PlusLg />
                        </Button>
                      </InputGroup>
                    </Col>
                    <Col
                      xs={3}
                      sm={2}
                      className="text-end cart-item-subtotal mt-2 mt-sm-0"
                    >
                      <span className="fw-bold">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </span>
                    </Col>
                    <Col
                      xs={2}
                      sm={1}
                      className="text-end cart-item-remove mt-2 mt-sm-0"
                    >
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={updatingItemId === item.productId}
                        title="Hapus item"
                      >
                        {updatingItemId === item.productId ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          <Trash size={20} />
                        )}
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          <Col lg={4} className="cart-summary-column">
            <Card className="shadow-sm summary-card sticky-top">
              <Card.Body>
                <Card.Title as="h3" className="mb-3 summary-title">
                  Ringkasan Pesanan
                </Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between px-0 summary-item">
                    <span>
                      Subtotal (
                      {cart.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                      item)
                    </span>
                    <span>Rp {cart.totalPrice.toLocaleString("id-ID")}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0 fw-bold fs-5 summary-total">
                    <span>Total</span>
                    <span>Rp {cart.totalPrice.toLocaleString("id-ID")}</span>
                  </ListGroup.Item>
                </ListGroup>
                <Button
                  variant="primary"
                  className="w-100 mt-4 btn-brand btn-checkout"
                  size="lg"
                >
                  Pesan Sekarang
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        show={showClearConfirmModal}
        onHide={closeClearConfirmModal}
        centered
      >
        <Modal.Header closeButton className="modal-header-danger">
          <Modal.Title>Konfirmasi Kosongkan Keranjang</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Anda yakin ingin mengosongkan seluruh isi keranjang belanja Anda?
          Tindakan ini tidak dapat diurungkan.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeClearConfirmModal}
            disabled={isClearingCart}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleClearCart}
            disabled={isClearingCart}
          >
            {isClearingCart ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Mengosongkan...
              </>
            ) : (
              "Ya, Kosongkan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CartPage;
