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
  FaArrowLeft,
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
} from "react-icons/fa";
import apiService from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/order.css";

// Tambahkan CSS inline untuk mempercantik tampilan
const styles = {
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "1.5rem",
    borderBottom: "3px solid #FFC107",
    paddingBottom: "0.5rem",
    display: "inline-block",
  },
  orderCard: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
    border: "none",
    marginBottom: "1.5rem",
  },
  orderHeader: {
    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
    borderBottom: "1px solid #eee",
    padding: "1rem 1.25rem",
  },
  orderNumber: {
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: 0,
    color: "#495057",
  },
  orderDate: {
    fontSize: "0.85rem",
    color: "#6c757d",
  },
  statusBadge: {
    fontWeight: "500",
    padding: "0.5rem 0.75rem",
    borderRadius: "50px",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableHeader: {
    background: "#f8f9fa",
    color: "#495057",
    fontWeight: "600",
    borderBottomWidth: "2px",
  },
  productImage: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  productName: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "0.2rem",
    color: "#212529",
  },
  paymentInfoSection: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginTop: "1rem",
  },
  paymentInfoTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "0.75rem",
    color: "#495057",
  },
  totalPrice: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#212529",
  },
  emptyState: {
    background: "#f8f9fa",
    padding: "3rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  emptyStateIcon: {
    fontSize: "4rem",
    color: "#FFC107",
    marginBottom: "1.5rem",
  },
  emptyStateTitle: {
    fontSize: "1.75rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#343a40",
  },
  emptyStateText: {
    fontSize: "1.1rem",
    color: "#6c757d",
    marginBottom: "1.5rem",
  },
  actionButton: {
    borderRadius: "50px",
    padding: "0.5rem 1.5rem",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  payButton: {
    background: "#FFC107",
    borderColor: "#FFC107",
    color: "#212529",
    fontWeight: "600",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    padding: "0.5rem 1.25rem",
    borderRadius: "50px",
    transition: "all 0.3s ease",
  },
  checkStatusButton: {
    borderRadius: "50px",
    fontSize: "0.85rem",
    transition: "all 0.3s ease",
  },
  paymentDetailsModal: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "1rem",
    border: "1px solid #dee2e6",
  },
  detailButton: {
    borderRadius: "50px",
    padding: "0.4rem 1rem",
    fontWeight: "500",
    borderColor: "#6c757d",
    color: "#6c757d",
    transition: "all 0.3s ease",
  },
  backButton: {
    borderRadius: "50px",
    padding: "0.5rem 1.5rem",
    fontWeight: "500",
    margin: "1.5rem 0",
  },
  loadingSpinner: {
    color: "#FFC107",
    width: "3rem",
    height: "3rem",
  },
};

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
        <h1 style={styles.pageTitle}>
          <FaClipboardList className="me-2" />
          Daftar Pesanan Saya
        </h1>

        <Button
          variant="outline-secondary"
          className="refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
          style={styles.actionButton}
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
            style={styles.loadingSpinner}
          />
          <p className="mt-3 text-muted">Memuat daftar pesanan Anda...</p>
        </div>
      )}

      {/* Empty orders */}
      {!loading && orders.length === 0 && (
        <div style={styles.emptyState}>
          <div className="empty-orders-icon mb-4">
            <FaShoppingBag style={styles.emptyStateIcon} />
          </div>
          <h3 style={styles.emptyStateTitle}>Belum Ada Pesanan</h3>
          <p style={styles.emptyStateText}>
            Anda belum melakukan pemesanan. Yuk, mulai berbelanja dan nikmati
            produk terbaik kami!
          </p>
          <Link
            to="/menu"
            className="btn btn-warning btn-lg"
            style={styles.actionButton}
          >
            Mulai Berbelanja
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="mb-4 order-card"
              style={styles.orderCard}
            >
              <Card.Header
                className="d-flex justify-content-between align-items-center"
                style={styles.orderHeader}
              >
                <div>
                  <h5 style={styles.orderNumber}>
                    <FaClipboardList className="me-2" /> Pesanan #{order.id}
                  </h5>
                  <small style={styles.orderDate}>
                    <FaCalendarAlt className="me-1" />{" "}
                    {formatDate(order.createdAt)}
                  </small>
                </div>
                <Badge
                  bg={getStatusBadgeVariant(order.status)}
                  style={styles.statusBadge}
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
                        <th style={styles.tableHeader} className="ps-3">
                          Produk
                        </th>
                        <th style={styles.tableHeader}>Harga</th>
                        <th style={styles.tableHeader}>Jumlah</th>
                        <th style={styles.tableHeader} className="pe-3">
                          Subtotal
                        </th>
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
                                style={styles.productImage}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/80x80?text=No+Image";
                                }}
                              />
                              <div className="ms-3">
                                <h6 style={styles.productName}>
                                  {item.product?.name}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td className="fw-bold pe-3">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="p-3">
                  <Row className="mt-3">
                    <Col md={6}>
                      {order.payment && (
                        <div style={styles.paymentInfoSection}>
                          <h6 style={styles.paymentInfoTitle}>
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
                              <div
                                style={styles.paymentDetailsModal}
                                className="mt-3 small"
                              >
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
                            <span style={styles.totalPrice}>
                              {formatPrice(order.totalAmount)}
                            </span>
                          </p>
                          {order.payment &&
                            order.payment.status === "pending" && (
                              <div className="d-flex flex-column mt-2">
                                <Button
                                  variant="warning"
                                  onClick={() => handleContinuePayment(order)}
                                  style={styles.payButton}
                                  className="mb-2"
                                >
                                  <FaCreditCard className="me-2" />
                                  Lanjutkan Pembayaran
                                </Button>

                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => checkPaymentStatus(order.id)}
                                  disabled={checkingPayment}
                                  style={styles.checkStatusButton}
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
                  style={styles.detailButton}
                >
                  <FaInfoCircle className="me-1" />
                  Detail Pesanan
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <Button
          variant="outline-secondary"
          className="back-btn"
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          <FaArrowLeft className="me-2" />
          Kembali
        </Button>
      </div>
    </Container>
  );
};

export default OrdersPage;
