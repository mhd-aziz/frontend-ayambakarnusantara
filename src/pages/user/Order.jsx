import React, { useState, useEffect, useContext } from "react";
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
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaClipboardList,
  FaSync,
  FaInfoCircle,
  FaShoppingBag,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearchDollar,
  FaStar,
} from "react-icons/fa";
import apiService from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/order.css";
import RatingModal from "./RatingModal";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [clientKey, setClientKey] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatusDetails, setPaymentStatusDetails] = useState({});
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Rating states - moved minimal state needed for coordination
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingProductId, setRatingProductId] = useState(null);
  const [ratingProductName, setRatingProductName] = useState("");

  // Fetch orders data
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserOrders();
      console.log("Orders API response:", response);
      setOrders(response);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Gagal memuat daftar pesanan. Silakan coba lagi.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Check payment status from Midtrans
  const checkPaymentStatus = async (orderId) => {
    setCheckingPayment(true);
    setShowPaymentDetails(false);

    try {
      const response = await apiService.getPaymentStatus(orderId);
      console.log("Payment status response:", response);

      // Store payment details
      setPaymentStatusDetails(response);
      setShowPaymentDetails(true);

      // If payment was successful, refresh orders to update status
      if (
        response.transaction_status === "settlement" ||
        response.transaction_status === "capture" ||
        response.transaction_status === "success"
      ) {
        fetchOrders();
        setToastVariant("success");
        setToastMessage(
          "Pembayaran telah berhasil! Status pesanan telah diperbarui."
        );
        setShowToast(true);
      } else if (response.transaction_status === "pending") {
        setToastVariant("warning");
        setToastMessage(
          "Pembayaran masih dalam proses. Silakan cek kembali nanti."
        );
        setShowToast(true);
      } else {
        setToastVariant("danger");
        setToastMessage(
          "Status pembayaran: " +
            (response.status_message || response.message || "Tidak diketahui")
        );
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setToastVariant("danger");
      setToastMessage("Gagal memeriksa status pembayaran. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      setCheckingPayment(false);
    }
  };

  // Open rating modal for a product
  const openRatingModal = (productId, productName) => {
    console.log("Opening rating modal for:", { productId, productName });
    setRatingProductId(productId);
    setRatingProductName(productName);
    setShowRatingModal(true);
  };

  // Handle successful rating submission
  const handleRatingSuccess = () => {
    setToastVariant("success");
    setToastMessage(
      "Ulasan berhasil disimpan. Terima kasih atas masukan Anda!"
    );
    setShowToast(true);
    setShowRatingModal(false);
  };

  // Handle rating error
  const handleRatingError = () => {
    setToastVariant("danger");
    setToastMessage("Gagal menyimpan ulasan. Silakan coba lagi.");
    setShowToast(true);
  };

  // Load orders data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate]);

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
  const handleContinuePayment = async (order) => {
    if (!order.payment || !order.payment.snapToken) {
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
            // Navigate directly to order detail page
            navigate(`/order/${order.id}?status=success`);
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            setToastVariant("warning");
            setToastMessage("Pembayaran dalam proses. Silakan cek email Anda.");
            setShowToast(true);
            fetchOrders();
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
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      case "processing":
        return "info";
      default:
        return "secondary";
    }
  };

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <FaCheckCircle />;
      case "pending":
        return <FaClock />;
      case "cancelled":
        return <FaTimesCircle />;
      case "processing":
        return <FaBox />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  // Get translated status text
  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Menunggu Pembayaran";
      case "completed":
        return "Selesai";
      case "processing":
        return "Diproses";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  return (
    <Container className="py-5 mt-5 orders-container">
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <FaClipboardList className="me-2" />
          Daftar Pesanan Saya
        </h1>

        <Button
          variant="outline-secondary"
          className="refresh-btn action-button"
          onClick={fetchOrders}
          disabled={loading}
        >
          <FaSync className={loading ? "spinning" : ""} />
          <span className="ms-2 d-none d-md-inline">Refresh</span>
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            <div>{error}</div>
          </div>
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
          <p className="mt-3 text-muted">Memuat daftar pesanan Anda...</p>
        </div>
      )}

      {/* Empty orders */}
      {!loading && orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-orders-icon mb-4">
            <FaShoppingBag className="empty-state-icon" />
          </div>
          <h3 className="empty-state-title">Belum Ada Pesanan</h3>
          <p className="empty-state-text">
            Anda belum melakukan pemesanan. Yuk, mulai berbelanja dan nikmati
            produk terbaik kami!
          </p>
          <Link to="/menu" className="btn btn-warning btn-lg action-button">
            Mulai Berbelanja
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <Card key={order.id} className="mb-4 order-card">
              <Card.Header className="d-flex justify-content-between align-items-center order-header">
                <div>
                  <h5 className="order-number">
                    <FaClipboardList className="me-2" /> Pesanan #{order.id}
                  </h5>
                  <small className="order-date">
                    <FaCalendarAlt className="me-1" />{" "}
                    {formatDate(order.createdAt)}
                  </small>
                </div>
                <Badge
                  bg={getStatusBadgeVariant(order.status)}
                  className="status-badge"
                  pill
                >
                  {getStatusIcon(order.status)}{" "}
                  <span className="ms-1">{getStatusText(order.status)}</span>
                </Badge>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="p-3">
                  <h6 className="mb-3 text-muted">
                    <FaBox className="me-2" /> Detail Produk
                  </h6>
                </div>
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th className="table-header ps-3">Produk</th>
                        <th className="table-header">Harga</th>
                        <th className="table-header">Jumlah</th>
                        <th className="table-header pe-3">Subtotal</th>
                        {order.status.toLowerCase() === "completed" && (
                          <th className="table-header pe-3">Aksi</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center">
                              <Image
                                src={item.product?.photoProduct}
                                alt={item.product?.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/80x80?text=No+Image";
                                }}
                              />
                              <div className="ms-3">
                                <h6 className="product-name">
                                  {item.product?.name}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td className="fw-bold">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                          {order.status.toLowerCase() === "paid" && (
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => {
                                  console.log(
                                    "Rating button clicked for product:",
                                    item.product
                                  );
                                  if (item.product && item.product.id) {
                                    openRatingModal(
                                      item.product.id,
                                      item.product.name || "Product"
                                    );
                                  } else {
                                    console.error(
                                      "Product ID is missing:",
                                      item
                                    );
                                    setToastVariant("danger");
                                    setToastMessage(
                                      "Tidak dapat memberikan penilaian: ID produk tidak ditemukan"
                                    );
                                    setShowToast(true);
                                  }
                                }}
                                className="rate-button"
                              >
                                <FaStar className="me-1" />
                                Nilai
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="p-3">
                  <Row className="mt-3">
                    <Col md={6}>
                      {order.payment && (
                        <div className="payment-info-section">
                          <h6 className="payment-info-title">
                            <FaMoneyBillWave className="me-2" /> Informasi
                            Pembayaran
                          </h6>
                          <p className="mb-1">
                            <span className="text-muted">Status: </span>
                            <Badge
                              bg={getStatusBadgeVariant(order.payment.status)}
                              pill
                            >
                              {getStatusIcon(order.payment.status)}{" "}
                              <span className="ms-1">
                                {order.payment.status}
                              </span>
                            </Badge>
                          </p>

                          {/* Payment status details from Midtrans */}
                          {showPaymentDetails &&
                            paymentStatusDetails &&
                            paymentStatusDetails.order_id &&
                            paymentStatusDetails.order_id.includes(
                              order.id.toString()
                            ) && (
                              <div className="payment-details-modal mt-3 small">
                                <h6 className="border-bottom pb-2 mb-2">
                                  <FaInfoCircle className="me-2" />
                                  Detail Status Pembayaran
                                </h6>

                                {paymentStatusDetails.transaction_status && (
                                  <p className="mb-1">
                                    <strong>Status Transaksi: </strong>
                                    <Badge
                                      bg={getStatusBadgeVariant(
                                        paymentStatusDetails.transaction_status ===
                                          "settlement"
                                          ? "completed"
                                          : paymentStatusDetails.transaction_status
                                      )}
                                      pill
                                    >
                                      {paymentStatusDetails.transaction_status}
                                    </Badge>
                                  </p>
                                )}

                                {paymentStatusDetails.payment_type && (
                                  <p className="mb-1">
                                    <strong>Metode Pembayaran: </strong>
                                    {paymentStatusDetails.payment_type.replace(
                                      /_/g,
                                      " "
                                    )}
                                    {paymentStatusDetails.va_numbers &&
                                      paymentStatusDetails.va_numbers.length >
                                        0 &&
                                      ` (${paymentStatusDetails.va_numbers[0].bank.toUpperCase()})`}
                                  </p>
                                )}

                                {paymentStatusDetails.gross_amount && (
                                  <p className="mb-1">
                                    <strong>Total: </strong>
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                    }).format(
                                      paymentStatusDetails.gross_amount
                                    )}
                                  </p>
                                )}

                                {paymentStatusDetails.transaction_time && (
                                  <p className="mb-1">
                                    <strong>Waktu Transaksi: </strong>
                                    {new Date(
                                      paymentStatusDetails.transaction_time
                                    ).toLocaleString("id-ID")}
                                  </p>
                                )}

                                {paymentStatusDetails.settlement_time && (
                                  <p className="mb-1">
                                    <strong>Waktu Penyelesaian: </strong>
                                    {new Date(
                                      paymentStatusDetails.settlement_time
                                    ).toLocaleString("id-ID")}
                                  </p>
                                )}

                                {paymentStatusDetails.status_message && (
                                  <p className="mb-1">
                                    <strong>Pesan: </strong>
                                    {paymentStatusDetails.status_message}
                                  </p>
                                )}

                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setShowPaymentDetails(false)}
                                >
                                  Tutup Detail
                                </Button>
                              </div>
                            )}
                        </div>
                      )}
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-md-end mt-3 mt-md-0">
                        <div className="text-end">
                          <p className="mb-2">
                            <span className="text-muted me-2">
                              Total Pembayaran:
                            </span>
                            <span className="total-price">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </p>
                          {order.payment &&
                            order.payment.status === "pending" && (
                              <div className="d-flex flex-column mt-2">
                                <Button
                                  variant="warning"
                                  onClick={() => handleContinuePayment(order)}
                                  className="pay-button mb-2"
                                >
                                  <FaCreditCard className="me-2" />
                                  Lanjutkan Pembayaran
                                </Button>

                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => checkPaymentStatus(order.id)}
                                  disabled={checkingPayment}
                                  className="check-status-button"
                                >
                                  {checkingPayment ? (
                                    <>
                                      <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                      />
                                      Memeriksa...
                                    </>
                                  ) : (
                                    <>
                                      <FaSearchDollar className="me-2" />
                                      Cek Status Pembayaran
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>

              <Card.Footer className="text-end bg-white py-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  as={Link}
                  to={`/order/${order.id}`}
                  className="detail-button"
                >
                  <FaInfoCircle className="me-1" />
                  Detail Pesanan
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Modal Component */}
      {showRatingModal && (
        <RatingModal
          show={showRatingModal}
          onHide={() => setShowRatingModal(false)}
          productId={ratingProductId}
          productName={ratingProductName}
          onSuccess={handleRatingSuccess}
          onError={handleRatingError}
        />
      )}
    </Container>
  );
};

export default OrdersPage;
