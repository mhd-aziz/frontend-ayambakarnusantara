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
import { createOrder } from "../services/OrderService"; // Import createOrder
import { Trash, PlusLg, DashLg, CartX } from "react-bootstrap-icons";
import "../css/CartPage.css"; // We will create this CSS file

function CartPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // State for Clear Cart Modal
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  // State for Create Order Modal and Process
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAY_AT_STORE"); // Default payment method
  const [orderNotes, setOrderNotes] = useState("");
  const [orderError, setOrderError] = useState("");

  const fetchCartDetails = useCallback(async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/keranjang" } });
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await getCart();
      if (response.status === "success" || response.success === true) {
        setCart(response.data);
      } else {
        if (response.message === "Keranjang Anda kosong." && response.data) {
          setCart(response.data);
        } else {
          setError(
            response.message || "Gagal memuat keranjang. Respons tidak sesuai."
          );
        }
      }
    } catch (err) {
      if (err.message === "Keranjang Anda kosong." && err.data) {
        setCart(err.data);
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
        // alert(response.message || "Produk berhasil dihapus dari keranjang.");
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

  const handleShowClearConfirmModal = () => setShowClearConfirmModal(true);
  const handleCloseClearConfirmModal = () => setShowClearConfirmModal(false);

  const handleClearCart = async () => {
    handleCloseClearConfirmModal();
    setIsClearingCart(true);
    try {
      const response = await clearCart();
      if (response.status === "success" || response.success === true) {
        setCart(response.data);
        // alert(response.message || "Keranjang berhasil dikosongkan.");
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

  const handleImageError = (e, itemName = "Produk") => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/100x100/EFEFEF/AAAAAA?text=${encodeURIComponent(
      itemName
    )}`;
  };

  // --- Order Creation Logic ---
  const handleOpenPaymentModal = () => {
    if (!cart || cart.items.length === 0) {
      alert("Keranjang Anda kosong. Silakan tambahkan produk terlebih dahulu.");
      return;
    }
    setOrderError("");
    setPaymentMethod("PAY_AT_STORE"); // Reset to default when opening
    setOrderNotes(""); // Reset notes
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleConfirmOrder = async () => {
    setIsCreatingOrder(true);
    setOrderError("");
    try {
      const orderData = {
        paymentMethod,
        notes: orderNotes.trim(),
      };
      const response = await createOrder(orderData);

      if (response.orderId) {
        alert("Pesanan berhasil dibuat! ID Pesanan: " + response.orderId);
        await clearCart();
        setCart(null); // Or refetch to get empty cart state
        handleClosePaymentModal();
        navigate(`/pesanan`); // Navigate to order history page
      } else {
        setOrderError(
          response.message || "Gagal membuat pesanan. Respons tidak sesuai."
        );
      }
    } catch (err) {
      setOrderError(
        err.message || "Terjadi kesalahan pada server saat membuat pesanan."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // --- Render Logic ---
  if (!isLoggedIn && !isLoading) {
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

  if (error && !orderError) {
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
      {/* General order error can be shown here if needed, or within the modal */}
      {/* {orderError && <Alert variant="danger">{orderError}</Alert>} */}
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
                onClick={handleShowClearConfirmModal}
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
                      {item.shopId && (
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
                            item.quantity <= 0
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
                  onClick={handleOpenPaymentModal} // Opens the payment modal
                  disabled={cart.items.length === 0 || isCreatingOrder}
                >
                  {isCreatingOrder ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                  ) : (
                    "Pesan Sekarang"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Clear Cart Confirmation Modal */}
      <Modal
        show={showClearConfirmModal}
        onHide={handleCloseClearConfirmModal}
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
            onClick={handleCloseClearConfirmModal}
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

      {/* Payment Method and Order Notes Modal */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pesanan & Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderError && <Alert variant="danger">{orderError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="paymentMethod">
              <Form.Label>Metode Pembayaran</Form.Label>
              <Form.Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isCreatingOrder}
              >
                <option value="PAY_AT_STORE">Bayar di Tempat</option>
                <option value="ONLINE_PAYMENT">Pembayaran Online</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="orderNotes">
              <Form.Label>Catatan Tambahan (Opsional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Contoh: Tolong siapkan sebelum jam 5 sore."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                disabled={isCreatingOrder}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClosePaymentModal}
            disabled={isCreatingOrder}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            className="btn-brand"
            onClick={handleConfirmOrder} // Changed to handleConfirmOrder
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Memproses Pesanan...
              </>
            ) : (
              "Konfirmasi Pesanan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CartPage;
