import React from "react";
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import backgroundHero1 from "../../assets/images/background-hero1.svg";

// Komponen untuk bagian Featured Product
const FeaturedProduct = ({ image, name, price, id }) => {
  return (
    <Card className="h-100 shadow-sm featured-card">
      <Card.Img
        variant="top"
        src={image}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Title className="text-primary">{name}</Card.Title>
        <Card.Text className="fw-bold">Rp {price.toLocaleString()}</Card.Text>
        <Button as={Link} to={`/product/${id}`} variant="warning">
          Pesan Sekarang
        </Button>
      </Card.Body>
    </Card>
  );
};

const HomePage = () => {
  // Data dummy untuk contoh
  const featuredProducts = [
    {
      id: 1,
      name: "Ayam Bakar Kecap",
      price: 35000,
      image: "/assets/images/products/ayam-bakar-kecap.jpg",
    },
    {
      id: 2,
      name: "Ayam Bakar Taliwang",
      price: 40000,
      image: "/assets/images/products/ayam-bakar-taliwang.jpg",
    },
    {
      id: 3,
      name: "Ayam Bakar Padang",
      price: 38000,
      image: "/assets/images/products/ayam-bakar-padang.jpg",
    },
    {
      id: 4,
      name: "Ayam Bakar Madu",
      price: 37000,
      image: "/assets/images/products/ayam-bakar-madu.jpg",
    },
  ];

  return (
    <>
      {/* Hero Section dengan background yang terintegrasi dengan navbar */}
      <div className="hero-section">
        <Carousel fade controls={true} indicators={true}>
          <Carousel.Item>
            <div className="hero-background">
              <div className="hero-content">
                <Container>
                  <div className="text-start text-white">
                    <h1 className="display-4 fw-bold">
                      Rasakan Kelezatan Ayam Bakar Nusantara
                    </h1>
                    <p className="lead mb-4">
                      Nikmati citarasa otentik ayam bakar dengan bumbu rempah
                      khas Indonesia
                    </p>
                    <Button
                      as={Link}
                      to="/menu"
                      variant="warning"
                      size="lg"
                      className="px-4 py-2"
                    >
                      Lihat Menu <FaArrowRight className="ms-2" />
                    </Button>
                  </div>
                </Container>
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div
              className="hero-background"
              style={{
                backgroundImage: `url(${backgroundHero1})`,
              }}
            >
              <div className="hero-content">
                <Container>
                  <div className="text-start text-white">
                    <h1 className="display-4 fw-bold">
                      Promo Spesial Bulan Ini
                    </h1>
                    <p className="lead mb-4">
                      Dapatkan diskon 20% untuk pembelian paket keluarga
                    </p>
                    <Button
                      as={Link}
                      to="/shop"
                      variant="warning"
                      size="lg"
                      className="px-4 py-2"
                    >
                      Pesan Sekarang <FaArrowRight className="ms-2" />
                    </Button>
                  </div>
                </Container>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Featured Menu Section */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="fw-bold text-primary">Menu Favorit</h2>
              <Link
                to="/menu"
                className="text-decoration-none text-warning d-flex align-items-center"
              >
                Lihat Semua <FaArrowRight className="ms-1" />
              </Link>
            </div>
          </Col>
        </Row>
        <Row xs={1} sm={2} md={4} className="g-4">
          {featuredProducts.map((product) => (
            <Col key={product.id}>
              <FeaturedProduct {...product} />
            </Col>
          ))}
        </Row>
      </Container>

      {/* About Us Section */}
      <div className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <img
                src="/assets/images/banners/about-us.jpg"
                alt="Tentang Ayam Bakar Nusantara"
                className="img-fluid rounded shadow"
              />
            </Col>
            <Col lg={6}>
              <h2 className="fw-bold text-primary mb-4">Tentang Kami</h2>
              <p className="lead">
                Ayam Bakar Nusantara hadir dengan komitmen untuk menyajikan cita
                rasa ayam bakar asli Indonesia yang otentik dan berkualitas.
              </p>
              <p>
                Kami menggunakan bahan-bahan pilihan dan rempah-rempah segar
                untuk memastikan kelezatan setiap hidangan. Sejak 2015, Ayam
                Bakar Nusantara telah melayani ribuan pelanggan dengan standar
                kualitas yang selalu terjaga.
              </p>
              <Button variant="outline-primary" className="mt-3">
                Selengkapnya
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action */}
      <div className="bg-warning text-dark py-5">
        <Container className="text-center">
          <h2 className="fw-bold mb-3">Pesan Sekarang!</h2>
          <p className="lead mb-4">
            Nikmati pengalaman memesan makanan favorit Anda dengan mudah
          </p>
          <Button
            as={Link}
            to="/shop"
            variant="dark"
            size="lg"
            className="px-4"
          >
            Pesan Online
          </Button>
        </Container>
      </div>
    </>
  );
};

export default HomePage;
