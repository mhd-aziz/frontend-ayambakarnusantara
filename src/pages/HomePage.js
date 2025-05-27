// src/pages/HomePage.js
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../css/HomePage.css";
const heroBackgroundImageUrl = "/images/hero-background.jpg";

function HomePage() {
  return (
    <>
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${heroBackgroundImageUrl})`,
        }}
      >
        <div className="hero-overlay"></div>{" "}
        {/* Lapisan untuk menggelapkan background jika perlu */}
        <Container className="hero-content text-center">
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <h1 className="hero-title">AYAM BAKAR NUSANTARA</h1>
              <p className="hero-subtitle">
                Satu Website, Beragam Rasa: Ayam Bakar Nusantara Menghadirkan
                Keunikan Setiap Daerah!
              </p>
              <p className="hero-description">
                Pesan ayam bakar dengan berbagai rasa khas daerah dan nikmati
                pengalaman kuliner yang tak terlupakan.
              </p>
              <Button variant="primary" size="lg" className="hero-cta-button">
                Pesan Sekarang!
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bagian konten di bawah hero section bisa ditambahkan di sini */}
      <Container className="mt-5 py-5">
        <h2 className="text-center">DAFTAR MENU UNGGULAN</h2>
        {/* Tambahkan konten lain seperti daftar produk, kategori, dll. */}
        <p className="text-center">Konten selanjutnya akan ada di sini...</p>
      </Container>
    </>
  );
}

export default HomePage;
