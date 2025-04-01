import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Table,
  Image,
  Button,
  Spinner,
  Alert,
  Toast,
  ToastContainer,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCreditCard,
  FaReceipt,
  FaUser,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBox,
  FaExclamationTriangle,
  FaStar,
  FaBan,
  FaTruck,
  FaHourglass,
  FaUtensils,
} from "react-icons/fa";
import apiService from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/order-detail.css";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [clientKey, setClientKey] = useState("");

  // State for cancel order modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getOrderById(orderId);
      console.log("Order details API response:", response);
      setOrder(response);
      setError(null);
    } catch (err) {
      console.error(`Error fetching order details for order ${orderId}:`, err);
      setError("Gagal memuat detail pesanan. Silakan coba lagi.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!orderId) {
      setError("ID Pesanan tidak valid.");
      return;
    }

    fetchOrderDetails();
  }, [isAuthenticated, navigate, orderId, fetchOrderDetails]);

  // Fetch Midtrans client key and load Snap.js for continuing payment
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const response = await apiService.getClientKey();
        const key = response.clientKey;
        setClientKey(key);

        // Load Midtrans Snap.js after getting client key
        if (key) {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", key);
          script.setAttribute("id", "midtrans-script");
          document.body.appendChild(script);
        }
      } catch (error) {
        console.error("Failed to fetch Midtrans client key:", error);
        setError("Gagal memuat konfigurasi pembayaran. Silakan coba lagi.");
      }
    };

    fetchClientKey();

    return () => {
      // Clean up when component unmounts
      const script = document.getElementById("midtrans-script");
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Continue payment for pending orders
  const handleContinuePayment = async () => {
    if (!order || !order.payment || !order.payment.snapToken) {
      setToastVariant("danger");
      setToastMessage(
        "Token pembayaran tidak tersedia. Silakan hubungi admin."
      );
      setShowToast(true);
      return;
    }

    try {
      // Continue with Midtrans payment using the stored snap token
      if (window.snap && clientKey) {
        window.snap.pay(order.payment.snapToken, {
          onSuccess: function (result) {
            console.log("Payment success:", result);
            // Refresh order details after successful payment
            fetchOrderDetails();
            setToastVariant("success");
            setToastMessage("Pembayaran berhasil!");
            setShowToast(true);
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            setToastVariant("warning");
            setToastMessage("Pembayaran dalam proses. Silakan cek email Anda.");
            setShowToast(true);
            fetchOrderDetails();
          },
          onError: function (result) {
            console.log("Payment error:", result);
            setToastVariant("danger");
            setToastMessage("Pembayaran gagal. Silakan coba lagi.");
            setShowToast(true);
          },
          onClose: function () {
            console.log("Customer closed the payment popup");
            setToastVariant("warning");
            setToastMessage("Pembayaran dibatalkan.");
            setShowToast(true);
          },
        });
      } else {
        throw new Error(
          !clientKey
            ? "Client key Midtrans tidak ditemukan."
            : "Snap.js tidak terdeteksi. Pastikan tidak ada adblocker yang aktif."
        );
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setToastVariant("danger");
      setToastMessage(
        err.message || "Gagal memproses pembayaran. Silakan coba lagi."
      );
      setShowToast(true);
    }
  };

  // Cancel order function
  const handleCancelOrder = async () => {
    setCancellingOrder(true);
    try {
      const response = await apiService.cancelOrder(orderId);
      console.log("Cancel order response:", response);

      // Update the order in the state with the new status
      setOrder({ ...order, status: response.status });

      // Show success message
      setToastVariant("success");
      setToastMessage("Pesanan telah berhasil dibatalkan.");
      setShowToast(true);

      // Close modal
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error cancelling order:", err);
      setToastVariant("danger");
      setToastMessage("Gagal membatalkan pesanan. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      setCancellingOrder(false);
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

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Get badge variant based on order status
  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "success";
      case "paid":
      case "settlement":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
      case "cancel":
        return "danger";
      case "processing":
      case "proses":
        return "info";
      case "ready":
        return "primary";
      default:
        return "secondary";
    }
  };

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "settlement":
      case "paid":
        return <FaCheckCircle className="me-2" />;
      case "pending":
        return <FaClock className="me-2" />;
      case "cancelled":
      case "cancel":
        return <FaTimesCircle className="me-2" />;
      case "processing":
      case "proses":
        return <FaHourglass className="me-2" />;
      case "ready":
        return <FaUtensils className="me-2" />;
      case "delivered":
        return <FaTruck className="me-2" />;
      default:
        return <FaExclamationTriangle className="me-2" />;
    }
  };

  // Get translated status text
  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Menunggu Pembayaran";
      case "paid":
      case "settlement":
        return "Telah Dibayar";
      case "completed":
        return "Selesai";
      case "processing":
      case "proses":
        return "Sedang Diproses";
      case "cancelled":
      case "cancel":
        return "Dibatalkan";
      case "ready":
        return "Siap Diambil";
      case "delivered":
        return "Telah Diambil";
      default:
        return status;
    }
  };

  // Get serving status from payment.statusOrder
  const getServingStatus = () => {
    if (!order || !order.payment) return "pending";
    return order.payment.statusOrder || "pending";
  };

  return (
    <Container className="py-5 mt-5 order-detail-container">
      {/* Toast notifications */}
      <ToastContainer position="top-end" className="p-3">
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
              {toastVariant === "success"
                ? "Berhasil!"
                : toastVariant === "warning"
                ? "Perhatian!"
                : "Gagal!"}
            </strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pembatalan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin ingin membatalkan pesanan ini?</p>
          <p className="text-danger">
            <FaExclamationTriangle className="me-2" />
            Tindakan ini tidak dapat dibatalkan.
          </p>
          {order && (
            <div className="order-summary p-3 bg-light rounded mt-3">
              <p className="mb-1">
                <strong>Pesanan #:</strong> {order.id}
              </p>
              <p className="mb-1">
                <strong>Tanggal:</strong> {formatDate(order.createdAt)}
              </p>
              <p className="mb-1">
                <strong>Total:</strong> {formatPrice(order.totalAmount)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelOrder}
            disabled={cancellingOrder}
          >
            {cancellingOrder ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Membatalkan...
              </>
            ) : (
              <>
                <FaBan className="me-2" />
                Ya, Batalkan Pesanan
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="page-title-section">
        <Button
          variant="outline-secondary"
          className="back-button"
          onClick={() => navigate("/order")}
        >
          <FaArrowLeft className="me-2" />
          Kembali ke Daftar Pesanan
        </Button>
        <h2 className="page-title">Detail Pesanan</h2>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <Spinner
            animation="border"
            variant="warning"
            className="loading-spinner"
          />
          <p className="mt-3 text-muted">Memuat detail pesanan...</p>
        </div>
      )}

      {/* Order details */}
      {!loading && order && (
        <div className="order-detail">
          {/* Order Info Card */}
          <Card className="mb-4 order-info-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaReceipt className="card-header-icon" />
                <h5 className="mb-0">Informasi Pesanan</h5>
              </div>
              <Badge
                bg={getStatusBadgeVariant(order.status)}
                className={`status-badge status-${order.status.toLowerCase()}`}
                pill
              >
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Nomor Pesanan:</span>
                        <span className="fw-bold">#{order.id}</span>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">
                          <FaCalendarAlt className="info-icon" />
                          Tanggal Pesanan:
                        </span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Pembayaran:</span>
                        <span className="fw-bold">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Status Pembayaran:</span>
                        <Badge
                          bg={getStatusBadgeVariant(
                            order.payment?.status || "pending"
                          )}
                          className={`status-${(
                            order.payment?.status || "pending"
                          ).toLowerCase()}`}
                          pill
                        >
                          {getStatusIcon(order.payment?.status || "pending")}
                          {getStatusText(order.payment?.status || "pending")}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Status Penyajian:</span>
                        <Badge
                          bg={getStatusBadgeVariant(getServingStatus())}
                          className={`status-${getServingStatus().toLowerCase()}`}
                          pill
                        >
                          {getStatusIcon(getServingStatus())}
                          {getStatusText(getServingStatus())}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      {order.status === "pending" && (
                        <div className="d-flex flex-column">
                          <Button
                            variant="warning"
                            className="payment-button mb-2"
                            onClick={handleContinuePayment}
                          >
                            <FaCreditCard className="me-2" />
                            Lanjutkan Pembayaran
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="cancel-button"
                            onClick={() => setShowCancelModal(true)}
                          >
                            <FaBan className="me-2" />
                            Batalkan Pesanan
                          </Button>
                        </div>
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Customer Info Card */}
          <Card className="mb-4 customer-info-card">
            <Card.Header>
              <div className="d-flex align-items-center">
                <FaUser className="card-header-icon" />
                <h5 className="mb-0">Informasi Pelanggan</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="info-label">
                          <FaUser className="info-icon" />
                          Nama Lengkap:
                        </span>
                        <span className="info-value">
                          {order.user?.fullName}
                        </span>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="info-label">
                          <FaEnvelope className="info-icon" />
                          Email:
                        </span>
                        <span className="info-value">{order.user?.email}</span>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="info-label">
                          <FaPhoneAlt className="info-icon" />
                          Telepon:
                        </span>
                        <span className="info-value">
                          {order.user?.phoneNumber}
                        </span>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="info-label">
                          <FaMapMarkerAlt className="info-icon" />
                          Alamat:
                        </span>
                        <span className="info-value">
                          {order.user?.address}
                        </span>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Order Items Card */}
          <Card className="mb-4 order-items-card">
            <Card.Header>
              <div className="d-flex align-items-center">
                <FaBox className="card-header-icon" />
                <h5 className="mb-0">
                  Item Pesanan ({order.orderItems.length})
                </h5>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="order-items-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Produk</th>
                      <th style={{ width: "15%" }}>Harga</th>
                      <th style={{ width: "10%" }}>Jumlah</th>
                      <th style={{ width: "15%" }}>Subtotal</th>
                      <th style={{ width: "10%" }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="product-info">
                          <div className="d-flex align-items-center">
                            <Image
                              src={item.product?.photoProduct}
                              alt={item.product?.name}
                              className="order-item-image me-3"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=No+Image";
                              }}
                            />
                            <div>
                              <h6 className="mb-0">{item.product?.name}</h6>
                              <small className="text-muted">
                                {item.product?.description}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td className="fw-bold">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                        <td>
                          {/* Rating Button - Show for delivered or any paid status */}
                          {(order.payment?.statusOrder === "delivered" ||
                            order.status === "completed") && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rating-button"
                              onClick={() =>
                                navigate(`/rating/${item.product.id}`, {
                                  state: { productId: item.product.id },
                                })
                              }
                            >
                              <FaStar className="me-1" />
                              Beri Rating
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer>
              <Row className="justify-content-end">
                <Col md={4}>
                  <div className="price-summary">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal:</span>
                      <span>
                        {formatPrice(
                          order.orderItems.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span className="total-price">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default OrderDetail;
