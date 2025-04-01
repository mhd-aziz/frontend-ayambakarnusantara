// Perbaikan import - hapus Link jika tidak digunakan
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

      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          className="me-3"
          onClick={() => navigate("/order")}
        >
          <FaArrowLeft className="me-2" />
          Kembali ke Daftar Pesanan
        </Button>
        <h2 className="mb-0">Detail Pesanan</h2>
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
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Memuat detail pesanan...</p>
        </div>
      )}

      {/* Order details */}
      {!loading && order && (
        <div className="order-detail">
          {/* Order Info Card */}
          <Card className="mb-4 order-info-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaReceipt className="me-2" />
                <h5 className="mb-0">Informasi Pesanan</h5>
              </div>
              <Badge bg={getStatusBadgeVariant(order.status)}>
                {order.status === "pending"
                  ? "Menunggu Pembayaran"
                  : order.status === "completed"
                  ? "Selesai"
                  : order.status === "processing"
                  ? "Diproses"
                  : order.status === "cancelled"
                  ? "Dibatalkan"
                  : order.status}
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
                          <FaCalendarAlt className="me-2" />
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
                        >
                          {order.payment?.status || "Belum Ada Pembayaran"}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Status Pengiriman:</span>
                        <Badge
                          bg={getStatusBadgeVariant(
                            order.payment?.statusOrder || "pending"
                          )}
                        >
                          {order.payment?.statusOrder || "Menunggu Pembayaran"}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      {order.payment && order.payment.status === "pending" && (
                        <Button
                          variant="warning"
                          className="w-100"
                          onClick={handleContinuePayment}
                        >
                          <FaCreditCard className="me-2" />
                          Lanjutkan Pembayaran
                        </Button>
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
                <FaUser className="me-2" />
                <h5 className="mb-0">Informasi Pelanggan</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="text-muted" style={{ width: "150px" }}>
                          <FaUser className="me-2" />
                          Nama Lengkap:
                        </span>
                        <span className="ms-2">{order.user?.fullName}</span>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="text-muted" style={{ width: "150px" }}>
                          <FaEnvelope className="me-2" />
                          Email:
                        </span>
                        <span className="ms-2">{order.user?.email}</span>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="text-muted" style={{ width: "150px" }}>
                          <FaPhoneAlt className="me-2" />
                          Telepon:
                        </span>
                        <span className="ms-2">{order.user?.phoneNumber}</span>
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-flex">
                        <span className="text-muted" style={{ width: "150px" }}>
                          <FaMapMarkerAlt className="me-2" />
                          Alamat:
                        </span>
                        <span className="ms-2">{order.user?.address}</span>
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
              <h5 className="mb-0">Item Pesanan ({order.orderItems.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="order-items-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Produk</th>
                      <th style={{ width: "20%" }}>Harga</th>
                      <th style={{ width: "15%" }}>Jumlah</th>
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
                          {/* Rating Button */}
                          {order.status === "paid" && (
                            <Button
                              variant="primary"
                              onClick={() =>
                                navigate(`/rating/${item.product.id}`, {
                                  state: { productId: item.product.id },
                                })
                              }
                            >
                              Rate Product
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
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Pajak (10%):</span>
                      <span>
                        {formatPrice(
                          order.orderItems.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          ) * 0.1
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
