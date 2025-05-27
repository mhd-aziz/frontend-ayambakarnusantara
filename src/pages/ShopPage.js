// src/pages/ShopPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAllShops } from "../services/ShopService";
import "../css/ShopPage.css";

function ShopPage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllShops();
      if (response && response.success && response.data) {
        setShops(response.data);
      } else {
        setShops([]);
        setError(
          response?.message ||
            "Gagal mengambil data toko (format respons tidak sesuai)."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Terjadi kesalahan pada server saat mengambil daftar toko."
      );
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleImageError = (e, shopName = "Toko") => {
    e.target.onerror = null;
    // Menggunakan placehold.co sebagai fallback
    e.target.src = `https://placehold.co/400x200/EFEFEF/AAAAAA?text=${encodeURIComponent(
      shopName
    )}`;
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat daftar toko...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">
          <Alert.Heading>Oops! Terjadi Kesalahan</Alert.Heading>
          <p>{error}</p>
          <Button onClick={fetchShops} variant="primary">
            Coba Lagi
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4 shop-page-container">
      {" "}
      {/* my-4 untuk margin atas-bawah */}
      <div className="shop-page-header text-center mb-4 mb-md-5">
        {" "}
        {/* mb lebih besar di layar md ke atas */}
        <h1>Temukan Toko Ayam Bakar Nusantara</h1>
        <p className="lead text-muted">
          Jelajahi berbagai pilihan toko Ayam Bakar Nusantara di dekat Anda.
        </p>
      </div>
      {shops.length === 0 && !isLoading && (
        <Alert variant="info" className="text-center">
          Saat ini belum ada toko yang terdaftar.
        </Alert>
      )}
      <Row xs={1} sm={2} lg={3} className="g-4">
        {shops.map((shop) => (
          <Col key={shop.shopId} className="d-flex align-items-stretch">
            <Card className="h-100 shop-card shadow-sm">
              {/* Wrapper untuk gambar agar bisa lebih dikontrol jika perlu */}
              <div className="shop-card-img-wrapper">
                <Card.Img
                  variant="top"
                  src={
                    shop.bannerImageURL ||
                    `https://placehold.co/400x200/EFEFEF/AAAAAA?text=${encodeURIComponent(
                      shop.shopName || "Toko"
                    )}`
                  }
                  alt={`Foto Toko ${shop.shopName}`}
                  className="shop-card-img" // Diterapkan pada Card.Img
                  onError={(e) => handleImageError(e, shop.shopName)}
                />
              </div>
              <Card.Body className="d-flex flex-column p-3">
                {" "}
                {/* Padding konsisten */}
                <Card.Title className="shop-card-title h5">
                  {" "}
                  {/* h5 untuk konsistensi hierarki */}
                  {shop.shopName}
                </Card.Title>
                <Card.Text className="shop-card-description small flex-grow-1">
                  {" "}
                  {/* flex-grow-1 agar deskripsi bisa mengisi ruang */}
                  {shop.description || "Tidak ada deskripsi."}
                </Card.Text>
                <Card.Text className="shop-card-owner mb-2 small">
                  <small className="text-muted">
                    Pemilik: {shop.ownerName || "Tidak diketahui"}
                  </small>
                </Card.Text>
                <Button
                  as={Link}
                  to={`/toko/${shop.shopId}`}
                  variant="primary"
                  className="mt-auto btn-brand" // mt-auto dan btn-brand
                >
                  Lihat Toko & Menu
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ShopPage;
