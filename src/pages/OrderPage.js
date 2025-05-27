// src/pages/PesananPage.js
import React from "react";
import { Container } from "react-bootstrap";
import { Navigate } from "react-router-dom"; // Untuk proteksi rute
import { useAuth } from "../context/AuthContext"; // Sesuaikan path jika perlu

function OrderPage() {
  const { isLoggedIn } = useAuth();

  // Jika pengguna belum login, arahkan ke halaman login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container className="mt-4">
      <h1>Selamat Datang di Halaman Pesanan Anda!</h1>
      <p>Lihat riwayat pesanan Anda atau lacak pesanan saat ini.</p>
      {/* Konten halaman pesanan akan ditambahkan di sini nanti */}
    </Container>
  );
}

export default OrderPage;