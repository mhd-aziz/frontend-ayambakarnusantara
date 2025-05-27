// src/pages/OrderDetailPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Image,
  ListGroup,
  Badge,
  Breadcrumb,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import {
  getCustomerOrderDetailById,
  cancelOrderAsCustomer,
} from "../services/OrderService";
import {
  createMidtransTransaction,
  getMidtransTransactionStatus, // Import baru
} from "../services/PaymentService";
import {
  BoxSeam,
  CalendarCheck,
  CreditCardFill,
  GeoAltFill,
  Hash,
  InfoCircleFill,
  ListTask,
  PersonCircle,
  Shop,
  XCircleFill,
  ExclamationTriangleFill,
  ArrowClockwise, // Untuk tombol refresh status
} from "react-bootstrap-icons";
import "../css/OrderDetailPage.css";

const ICON_COLOR = "#C07722";

function OrderDetailPage() {
  const { orderId } = useParams();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [orderDetails, setOrderDetails] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // Untuk pesan status pembayaran

  const fetchOrderDetails = useCallback(async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!orderId) {
      setError("ID Pesanan tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setPaymentError("");
    setStatusMessage("");
    try {
      const response = await getCustomerOrderDetailById(orderId);
      if (
        response &&
        response.success &&
        response.data &&
        response.data.order
      ) {
        setOrderDetails(response.data.order);
        setShopDetails(response.data.shopDetails || {});
      } else {
        setError(
          response?.message ||
            "Gagal memuat detail pesanan. Pesanan tidak ditemukan."
        );
        setOrderDetails(null);
        setShopDetails(null);
      }
    } catch (err) {
      setError(
        err.message || "Terjadi kesalahan saat mengambil detail pesanan."
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isLoggedIn, navigate, location.pathname]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleImageError = (e, itemName = "Produk") => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/80x80/EFEFEF/AAAAAA?text=${encodeURIComponent(
      itemName
    )}`;
  };

  const handleShowCancelModal = () => {
    setCancelError("");
    setShowCancelModal(true);
  };
  const handleCloseCancelModal = () => setShowCancelModal(false);

  const handleConfirmCancelOrder = async () => {
    if (!orderDetails) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      const response = await cancelOrderAsCustomer(orderDetails.orderId);
      if (
        response &&
        response.orderId &&
        response.orderStatus === "CANCELLED"
      ) {
        alert("Pesanan berhasil dibatalkan.");
        setOrderDetails(response);
        handleCloseCancelModal();
      } else if (response && response.orderStatus === "CANCELLED") {
        alert("Pesanan berhasil dibatalkan.");
        setOrderDetails(response);
        handleCloseCancelModal();
      } else {
        setCancelError(response?.message || "Gagal membatalkan pesanan.");
      }
    } catch (err) {
      setCancelError(
        err.message || "Terjadi kesalahan server saat membatalkan pesanan."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayOnline = async () => {
    if (!orderDetails || !orderDetails.orderId) return;
    setIsProcessingPayment(true);
    setPaymentError("");
    setStatusMessage("");
    try {
      const paymentResponse = await createMidtransTransaction(
        orderDetails.orderId
      );
      if (
        paymentResponse &&
        paymentResponse.data &&
        paymentResponse.data.redirect_url
      ) {
        window.open(
          paymentResponse.data.redirect_url,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        setPaymentError(
          paymentResponse?.message ||
            "Gagal memulai pembayaran. URL redirect tidak ditemukan."
        );
      }
    } catch (err) {
      setPaymentError(
        err.message || "Terjadi kesalahan saat memulai pembayaran."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!orderDetails || !orderDetails.orderId) return;
    setIsCheckingStatus(true);
    setPaymentError("");
    setStatusMessage("");
    try {
      const statusResponse = await getMidtransTransactionStatus(
        orderDetails.orderId
      );
      if (statusResponse && statusResponse.success && statusResponse.data) {
        const midtransStatus = statusResponse.data.midtransStatus;
        const internalStatus = statusResponse.data.internalOrderStatus;

        setStatusMessage(
          `Status Midtrans: ${
            midtransStatus?.transaction_status || "N/A"
          }. Status Pesanan Internal: ${internalStatus || "N/A"}. ${
            statusResponse.message
          }`
        );

        // Jika status internal berubah, fetch ulang detail pesanan untuk update UI
        if (orderDetails.orderStatus !== internalStatus) {
          fetchOrderDetails();
        }
      } else {
        setPaymentError(
          statusResponse?.message || "Gagal memeriksa status pembayaran."
        );
      }
    } catch (err) {
      setPaymentError(
        err.message || "Terjadi kesalahan saat memeriksa status pembayaran."
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
      case "AWAITING_PAYMENT":
        return "warning";
      case "CONFIRMED":
        return "info";
      case "PROCESSING":
      case "PREPARING":
        return "primary";
      case "READY_FOR_PICKUP":
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "danger";
      case "PAYMENT_PENDING":
        return "secondary";
      case "PAYMENT_FAILED":
        return "danger";
      default:
        return "light";
    }
  };

  if (!isLoggedIn && !isLoading) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "3rem", height: "3rem" }}
        />
        <p className="mt-3 lead">Memuat Detail Pesanan...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">
          <Alert.Heading>Oops! Terjadi Kesalahan</Alert.Heading>
          <p>{error}</p>
          <Button as={Link} to="/pesanan" variant="primary">
            Kembali ke Daftar Pesanan
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!orderDetails) {
    return (
      <Container className="text-center py-5">
        <Alert variant="warning">Pesanan tidak ditemukan.</Alert>
        <Button as={Link} to="/pesanan" variant="primary">
          Kembali ke Daftar Pesanan
        </Button>
      </Container>
    );
  }

  const cancellableStatusesFromBackend = [
    "AWAITING_PAYMENT",
    "PENDING_CONFIRMATION",
  ];
  const canCancelOrder = cancellableStatusesFromBackend.includes(
    orderDetails.orderStatus
  );

  const showPayNowButton =
    orderDetails.paymentDetails?.method === "ONLINE_PAYMENT" &&
    orderDetails.orderStatus === "AWAITING_PAYMENT";

  const showCheckStatusButton =
    orderDetails.paymentDetails?.method === "ONLINE_PAYMENT" &&
    (orderDetails.orderStatus === "AWAITING_PAYMENT" ||
      orderDetails.paymentDetails?.status === "pending_online_payment" ||
      orderDetails.paymentDetails?.status === "PAYMENT_PENDING");

  return (
    <Container className="my-4 order-detail-page">
      <Breadcrumb
        listProps={{
          className: "bg-light px-3 py-2 rounded-pill shadow-sm border mb-4",
        }}
      >
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/pesanan" }}>
          Pesanan Saya
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Detail Pesanan #
          {orderDetails.orderId ? orderDetails.orderId.substring(0, 8) : "N/A"}
        </Breadcrumb.Item>
      </Breadcrumb>

      {paymentError && (
        <Alert variant="danger" onClose={() => setPaymentError("")} dismissible>
          {paymentError}
        </Alert>
      )}
      {statusMessage && (
        <Alert variant="info" onClose={() => setStatusMessage("")} dismissible>
          {statusMessage}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header
              as="h5"
              className="d-flex justify-content-between align-items-center"
            >
              Detail Pesanan
              <Badge bg={getStatusBadgeVariant(orderDetails.orderStatus)} pill>
                {orderDetails.orderStatus
                  ? orderDetails.orderStatus.replace(/_/g, " ")
                  : "N/A"}
              </Badge>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col sm={4}>
                      <strong>
                        <Hash color={ICON_COLOR} className="me-2" />
                        ID Pesanan:
                      </strong>
                    </Col>
                    <Col sm={8} style={{ wordBreak: "break-all" }}>
                      {orderDetails.orderId}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col sm={4}>
                      <strong>
                        <CalendarCheck color={ICON_COLOR} className="me-2" />
                        Tanggal Pesan:
                      </strong>
                    </Col>
                    <Col sm={8}>
                      {new Date(orderDetails.createdAt).toLocaleString(
                        "id-ID",
                        { dateStyle: "long", timeStyle: "short" }
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col sm={4}>
                      <strong>
                        <PersonCircle color={ICON_COLOR} className="me-2" />
                        Nama Pemesan:
                      </strong>
                    </Col>
                    <Col sm={8}>{user?.displayName || orderDetails.userId}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col sm={4}>
                      <strong>
                        <CreditCardFill color={ICON_COLOR} className="me-2" />
                        Metode Pembayaran:
                      </strong>
                    </Col>
                    <Col sm={8}>
                      {orderDetails.paymentDetails?.method
                        ? orderDetails.paymentDetails.method.replace(/_/g, " ")
                        : "N/A"}
                      <Badge
                        bg={
                          orderDetails.paymentDetails?.status === "paid" ||
                          orderDetails.paymentDetails?.status ===
                            "pay_on_pickup"
                            ? "success"
                            : orderDetails.paymentDetails?.status ===
                                "pending_online_payment" ||
                              orderDetails.paymentDetails?.status ===
                                "AWAITING_PAYMENT"
                            ? "warning"
                            : "secondary"
                        }
                        className="ms-2"
                      >
                        {orderDetails.paymentDetails?.status
                          ? orderDetails.paymentDetails.status.replace(
                              /_/g,
                              " "
                            )
                          : "N/A"}
                      </Badge>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {orderDetails.paymentDetails?.transactionId && (
                  <ListGroup.Item>
                    <Row>
                      <Col sm={4}>
                        <strong>ID Transaksi:</strong>
                      </Col>
                      <Col sm={8}>
                        {orderDetails.paymentDetails.transactionId}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Row>
                    <Col sm={4}>
                      <strong>
                        <BoxSeam color={ICON_COLOR} className="me-2" />
                        Jenis Pesanan:
                      </strong>
                    </Col>
                    <Col sm={8}>{orderDetails.orderType}</Col>
                  </Row>
                </ListGroup.Item>
                {orderDetails.notes && (
                  <ListGroup.Item>
                    <Row>
                      <Col sm={4}>
                        <strong>Catatan:</strong>
                      </Col>
                      <Col sm={8}>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            margin: 0,
                            fontFamily: "inherit",
                          }}
                        >
                          {orderDetails.notes}
                        </pre>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Row>
                    <Col sm={4}>
                      <strong>Total Pembayaran:</strong>
                    </Col>
                    <Col sm={8} className="fw-bold fs-5 text-primary">
                      Rp {orderDetails.totalPrice.toLocaleString("id-ID")}
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer className="text-end d-flex justify-content-end flex-wrap gap-2">
              {canCancelOrder && (
                <Button
                  variant="danger"
                  onClick={handleShowCancelModal}
                  disabled={
                    isCancelling || isProcessingPayment || isCheckingStatus
                  }
                  className="mb-2 mb-md-0"
                >
                  <XCircleFill className="me-2" /> Batalkan Pesanan
                </Button>
              )}
              {showPayNowButton && (
                <Button
                  variant="success"
                  onClick={handlePayOnline}
                  disabled={
                    isProcessingPayment || isCancelling || isCheckingStatus
                  }
                  className="mb-2 mb-md-0"
                >
                  {isProcessingPayment ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                  ) : (
                    <CreditCardFill className="me-2" />
                  )}
                  Bayar Sekarang
                </Button>
              )}
              {showCheckStatusButton && (
                <Button
                  variant="info"
                  onClick={handleCheckPaymentStatus}
                  disabled={
                    isCheckingStatus || isProcessingPayment || isCancelling
                  }
                  className="mb-2 mb-md-0"
                >
                  {isCheckingStatus ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                  ) : (
                    <ArrowClockwise className="me-2" />
                  )}
                  Cek Status Pembayaran
                </Button>
              )}
            </Card.Footer>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Header as="h5">
              <ListTask color={ICON_COLOR} className="me-2" />
              Item Pesanan
            </Card.Header>
            <ListGroup variant="flush">
              {orderDetails.items.map((item) => (
                <ListGroup.Item
                  key={item.productId}
                  className="d-flex align-items-center"
                >
                  <Image
                    src={
                      item.productImageURL ||
                      `https://placehold.co/60x60/EFEFEF/AAAAAA?text=${encodeURIComponent(
                        item.name
                      )}`
                    }
                    onError={(e) => handleImageError(e, item.name)}
                    alt={item.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      marginRight: "15px",
                      borderRadius: "0.25rem",
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{item.name}</h6>
                    <small className="text-muted">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                      {item.shopId && (
                        <>
                          {" "}
                          dari{" "}
                          <Link
                            to={`/toko/${item.shopId}`}
                            className="text-decoration-none"
                          >
                            {shopDetails?.shopName &&
                            orderDetails.items.find(
                              (oItem) => oItem.shopId === item.shopId
                            )
                              ? shopDetails.shopName
                              : item.shopName ||
                                `Toko ID: ${item.shopId.substring(0, 6)}...`}
                          </Link>
                        </>
                      )}
                    </small>
                  </div>
                  <div className="text-end fw-semibold">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4}>
          {shopDetails && shopDetails.shopName ? (
            <Card className="shadow-sm mb-4">
              <Card.Header as="h5">
                <Shop color={ICON_COLOR} className="me-2" />
                Detail Toko
              </Card.Header>
              <Card.Body>
                {shopDetails.bannerImageURL && (
                  <Image
                    src={shopDetails.bannerImageURL}
                    alt={`Banner ${shopDetails.shopName}`}
                    fluid
                    rounded
                    className="mb-3"
                    style={{
                      maxHeight: "150px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => handleImageError(e, shopDetails.shopName)}
                  />
                )}
                <h5>{shopDetails.shopName}</h5>
                {shopDetails.shopAddress && (
                  <p className="mb-1 small">
                    <GeoAltFill className="me-1" />{" "}
                    {shopDetails.shopAddress || "Alamat tidak tersedia"}
                  </p>
                )}
                {shopDetails.description && (
                  <p className="text-muted small mb-2">
                    {shopDetails.description}
                  </p>
                )}
                {orderDetails.items &&
                  orderDetails.items.length > 0 &&
                  orderDetails.items[0].shopId && (
                    <Button
                      as={Link}
                      to={`/toko/${orderDetails.items[0].shopId}`}
                      variant="outline-primary"
                      size="sm"
                      className="w-100"
                    >
                      Kunjungi Toko
                    </Button>
                  )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm mb-4">
              <Card.Header as="h5">
                <Shop color={ICON_COLOR} className="me-2" />
                Detail Toko
              </Card.Header>
              <Card.Body>
                <p className="text-muted small">
                  Detail toko tidak tersedia untuk pesanan ini.
                </p>
              </Card.Body>
            </Card>
          )}
          <Card className="shadow-sm">
            <Card.Header as="h5">
              <InfoCircleFill color={ICON_COLOR} className="me-2" />
              Bantuan
            </Card.Header>
            <Card.Body>
              <p className="small">
                Jika ada masalah dengan pesanan Anda, silakan hubungi layanan
                pelanggan kami.
              </p>
              <Button variant="outline-secondary" size="sm" className="w-100">
                Hubungi Dukungan
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showCancelModal} onHide={handleCloseCancelModal} centered>
        <Modal.Header closeButton className="modal-header-danger">
          <Modal.Title>
            <ExclamationTriangleFill className="me-2" /> Konfirmasi Pembatalan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelError && <Alert variant="danger">{cancelError}</Alert>}
          Anda yakin ingin membatalkan pesanan ini? Tindakan ini mungkin tidak
          dapat diurungkan tergantung pada status pesanan saat ini.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseCancelModal}
            disabled={isCancelling}
          >
            Tidak
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmCancelOrder}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Membatalkan...
              </>
            ) : (
              "Ya, Batalkan Pesanan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderDetailPage;
