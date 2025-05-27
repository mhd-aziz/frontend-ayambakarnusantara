// src/pages/Seller/SellerDashboardOverview.js
import React from "react";
import { useOutletContext } from "react-router-dom";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { InfoCircleFill } from "react-bootstrap-icons";
import CreateSellerForm from "../../components/Seller/CreateSellerForm";

function SellerDashboardOverview() {
  const outletContext = useOutletContext();
  const { currentUserProfile, userRole, shopData, hasShop, handleShopCreated } =
    outletContext || {};

  if (userRole === "customer" || (userRole === "seller" && !hasShop)) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            {userRole === "customer" && (
              <Alert variant="info" className="mb-4 text-center">
                <InfoCircleFill size={20} className="me-2" />
                Anda saat ini terdaftar sebagai pelanggan. <br />
                Lengkapi form di bawah ini untuk membuka toko Anda!
              </Alert>
            )}
            {userRole === "seller" && !hasShop && (
              <Alert variant="warning" className="mb-4 text-center">
                <InfoCircleFill size={20} className="me-2" />
                Anda terdaftar sebagai penjual, namun data toko tidak ditemukan.{" "}
                <br />
                Silakan buat toko Anda sekarang.
              </Alert>
            )}
            <CreateSellerForm onShopCreated={handleShopCreated} />
          </Col>
        </Row>
      </Container>
    );
  }

  // Jika user adalah seller dan punya toko
  return (
    <div>
      <h3>Dashboard Toko</h3>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>
            Selamat Datang, {currentUserProfile?.displayName || "Penjual"}!
          </Card.Title>
          <Card.Text>
            Ini adalah halaman dashboard toko Anda,{" "}
            <strong>{shopData?.shopName}</strong>. Gunakan sidebar untuk
            mengelola toko dan produk Anda.
          </Card.Text>
          {/* Tambahkan statistik atau ringkasan toko di sini, contoh: */}
          <Row className="mt-4">
            <Col md={6} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Total Produk</Card.Title>
                  <Card.Text className="fs-4 fw-bold">0</Card.Text>{" "}
                  {/* Ganti dengan data aktual */}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Pesanan Baru</Card.Title>
                  <Card.Text className="fs-4 fw-bold">0</Card.Text>{" "}
                  {/* Ganti dengan data aktual */}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SellerDashboardOverview;
