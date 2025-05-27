// src/components/Layout/Footer.js
import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Envelope,
  Telephone,
} from "react-bootstrap-icons";
import logoImage from "../../assets/logo.jpg"; // Sesuaikan path ke logo Anda
import "../../css/Footer.css"; // Pastikan CSS diimpor

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="footer-container text-white pt-5 pb-4"
      data-bs-theme="dark"
    >
      <Container>
        <Row className="gy-4">
          {/* Kolom Logo dan Deskripsi Singkat */}
          <Col lg={3} md={6} className="text-center text-md-start">
            <Link
              to="/"
              className="footer-brand d-flex align-items-center justify-content-center justify-content-md-start mb-3"
            >
              <img
                src={logoImage}
                width="45"
                height="45"
                className="d-inline-block align-top me-2"
                alt="Ayam Bakar Nusantara Logo"
              />
              <span className="footer-brand-text">Ayam Bakar Nusantara</span>
            </Link>
            <p className="footer-description small">
              Nikmati kelezatan Ayam Bakar Nusantara dengan resep autentik
              turun-temurun. Kualitas terbaik, rasa tak terlupakan.
            </p>
          </Col>

          {/* Kolom Navigasi Cepat */}
          <Col lg={2} md={6} xs={6}>
            <h5 className="footer-heading">Navigasi</h5>
            <Nav className="flex-column footer-nav">
              <Nav.Link as={Link} to="/" className="footer-link">
                Beranda
              </Nav.Link>
              <Nav.Link as={Link} to="/menu" className="footer-link">
                Menu
              </Nav.Link>
              <Nav.Link as={Link} to="/toko" className="footer-link">
                Outlet Kami
              </Nav.Link>
              <Nav.Link as={Link} to="/cara-pesan" className="footer-link">
                Cara Pesan
              </Nav.Link>
            </Nav>
          </Col>

          {/* Kolom Bantuan & Kebijakan */}
          <Col lg={3} md={6} xs={6}>
            <h5 className="footer-heading">Bantuan & Kebijakan</h5>
            <Nav className="flex-column footer-nav">
              <Nav.Link as={Link} to="/faq" className="footer-link">
                FAQ
              </Nav.Link>
              <Nav.Link as={Link} to="/kontak-kami" className="footer-link">
                Hubungi Kami
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/syarat-ketentuan"
                className="footer-link"
              >
                Syarat & Ketentuan
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/kebijakan-privasi"
                className="footer-link"
              >
                Kebijakan Privasi
              </Nav.Link>
            </Nav>
          </Col>

          {/* Kolom Kontak & Sosial Media */}
          <Col lg={4} md={6}>
            <h5 className="footer-heading">Hubungi & Ikuti Kami</h5>
            <ul className="list-unstyled footer-contact-info">
              <li className="mb-2">
                <Envelope size={18} className="me-2" />
                <a
                  href="mailto:info@ayambakarnusantara.com"
                  className="footer-link"
                >
                  info@ayambakarnusantara.com
                </a>
              </li>
              <li className="mb-3">
                <Telephone size={18} className="me-2" />
                <a href="tel:+622112345678" className="footer-link">
                  +62 21 1234 5678
                </a>
              </li>
            </ul>
            <div className="footer-social-icons">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon me-3"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon me-3"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon me-3"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
              >
                <Youtube size={24} />
              </a>
            </div>
          </Col>
        </Row>
        <hr className="footer-hr" />
        <Row>
          <Col className="text-center">
            <p className="footer-copyright mb-0">
              &copy; {currentYear} Ayam Bakar Nusantara. Semua Hak Dilindungi.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
