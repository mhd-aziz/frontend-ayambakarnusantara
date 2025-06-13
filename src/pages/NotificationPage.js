import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/NotificationService";
import { Bell, ExclamationTriangleFill } from "react-bootstrap-icons";

const timeSince = (date) => {
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

function NotificationPage({ onNavigateToChat }) {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
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
    fetchNotifications();
  }, [fetchNotifications]);

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

    if (data?.orderId) {
      navigate(`/pesanan/${data.orderId}`);
    }
    else if (data?.recipientUID && typeof onNavigateToChat === "function") {
      onNavigateToChat(data.recipientUID);
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
    if (loading) {
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
              !notif.isRead ? "bg-light" : ""
            }`}
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold">{notif.title}</div>
              {notif.body}
            </div>
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
      <h1 className="mb-4">Notifikasi</h1>
      <Card className="shadow-sm">
        <Card.Body className="p-0">{renderContent()}</Card.Body>
      </Card>
    </Container>
  );
}

export default NotificationPage;
