import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
  Badge,
  Button,
} from "react-bootstrap";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/NotificationService";
import {
  Bell,
  ExclamationTriangleFill,
  ArrowClockwise,
} from "react-bootstrap-icons";

const timeSince = (date) => {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} tahun yang lalu`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} bulan yang lalu`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} hari yang lalu`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} jam yang lalu`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} menit yang lalu`;
  return `${Math.floor(seconds)} detik yang lalu`;
};

const statusTranslations = {
  PENDING_CONFIRMATION: "Menunggu Konfirmasi",
  AWAITING_PAYMENT: "Menunggu Pembayaran",
  CONFIRMED: "Dikonfirmasi",
  PROCESSING: "Sedang Diproses",
  READY_FOR_PICKUP: "Siap Diambil",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  PAYMENT_FAILED: "Pembayaran Gagal",
};

const formatNotificationBody = (body) => {
  if (!body) return "";
  const statusRegex = new RegExp(
    Object.keys(statusTranslations).join("|"),
    "g"
  );
  return body.replace(
    statusRegex,
    (matched) => statusTranslations[matched] || matched
  );
};

function NotificationPage({ onNavigateToChat }) {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await getMyNotifications();
      if (response.success && Array.isArray(response.data)) {
        setNotifications(
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } else {
        setError(response.message || "Gagal memuat data notifikasi.");
      }
    } catch (err) {
      setError(
        err.message ||
          "Terjadi kesalahan pada server saat mengambil notifikasi."
      );
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    const { notificationId, data, isRead } = notification;

    if (!isRead) {
      try {
        await markNotificationAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notificationId ? { ...n, isRead: true } : n
          )
        );
      } catch (err) {
        console.error("Gagal menandai notifikasi sebagai terbaca:", err);
      }
    }

    if (data && data.type) {
      switch (data.type) {
        case "NEW_MESSAGE":
          if (data.conversationId && typeof onNavigateToChat === "function") {
            onNavigateToChat(data.conversationId);
          }
          break;
        case "NEW_ORDER":
        case "ORDER_CANCELLED":
        case "ORDER_STATUS_UPDATE":
        case "PAYMENT_CONFIRMED":
          if (data.orderId) {
            const isNotificationForSeller =
              notification.title.includes("Pesanan Baru") ||
              notification.title.includes("Pesanan Dibatalkan");
            if (user && user.role === "seller" && isNotificationForSeller) {
              navigate("/toko-saya/pesanan");
            } else {
              navigate(`/pesanan/${data.orderId}`);
            }
          }
          break;
        default:
          console.log(
            "Tipe notifikasi tidak memiliki aksi navigasi:",
            data.type
          );
          break;
      }
    }
  };

  if (isAuthLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    if (loading && notifications.length === 0) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Memuat notifikasi...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          <ExclamationTriangleFill className="me-2" />
          {error}
        </Alert>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          <Bell size={40} className="mb-3" />
          <h4>Tidak Ada Notifikasi</h4>
          <p>Semua notifikasi Anda akan muncul di sini.</p>
        </div>
      );
    }

    return (
      <ListGroup variant="flush">
        {notifications.map((notif) => (
          <ListGroup.Item
            key={notif.notificationId}
            action
            onClick={() => handleNotificationClick(notif)}
            className={`d-flex justify-content-between align-items-start p-3 ${
              !notif.isRead ? "bg-light fw-bold" : ""
            }`}
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold">{notif.title}</div>
              <span className={!notif.isRead ? "" : "text-muted"}>
                {formatNotificationBody(notif.body)}
              </span>
            </div>
            {!notif.isRead && (
              <Badge bg="primary" pill className="me-3">
                Baru
              </Badge>
            )}
            <Badge bg="secondary" pill>
              {timeSince(notif.createdAt)}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <Container className="my-4" style={{ maxWidth: "800px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Notifikasi</h1>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={fetchNotifications}
          disabled={loading}
          className="d-flex align-items-center"
        >
          {loading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
          ) : (
            <ArrowClockwise size={16} className="me-2" />
          )}
          <span>{loading ? "Memuat..." : "Refresh"}</span>
        </Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body className="p-0">{renderContent()}</Card.Body>
      </Card>
    </Container>
  );
}

export default NotificationPage;
