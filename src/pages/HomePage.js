import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getProducts } from "../services/MenuService";
import { Star, StarFill, StarHalf } from "react-bootstrap-icons";
import "../css/HomePage.css";
import "../css/MenuPage.css";

const heroBackgroundImageUrl = "/images/hero-background.jpg";

const StarRatingDisplay = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="d-inline-block" style={{ color: "#ffc107" }}>
      {[...Array(fullStars)].map((_, i) => (
        <StarFill key={`full-${i}`} size={size} className="me-1" />
      ))}
      {halfStar && <StarHalf key="half" size={size} className="me-1" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="me-1" />
      ))}
    </div>
  );
};

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecommendationsLoading, setIsRecommendationsLoading] =
    useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);

  const fetchFeaturedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProducts({
        limit: 8, // Mengambil 8 produk untuk 2 baris
        sortBy: "name",
        order: "asc",
      });
      if (response && response.data && Array.isArray(response.data.products)) {
        setFeaturedProducts(response.data.products);
      } else {
        setError("Gagal memuat data produk unggulan.");
      }
    } catch (err) {
      setError(
        err.message ||
          "Terjadi kesalahan pada server saat mengambil produk unggulan."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecommendedProducts = useCallback(async () => {
    setIsRecommendationsLoading(true);
    setRecommendationsError(null);
    try {
      const response = await getProducts({
        limit: 4, // Mengambil 4 produk untuk 1 baris
        sortBy: "averageRating",
        order: "desc",
      });
      if (response && response.data && Array.isArray(response.data.products)) {
        const productsWithRating = response.data.products.filter(
          (p) => p.averageRating > 0
        );
        setRecommendedProducts(productsWithRating);
      } else {
        setRecommendationsError("Gagal memuat data produk rekomendasi.");
      }
    } catch (err) {
      setRecommendationsError(
        err.message ||
          "Terjadi kesalahan pada server saat mengambil produk rekomendasi."
      );
    } finally {
      setIsRecommendationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchRecommendedProducts();
  }, [fetchFeaturedProducts, fetchRecommendedProducts]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://via.placeholder.com/400x300.png?text=Ayam+Nusantara`;
  };

  const ProductCard = ({ product, showRating = false }) => (
    <Col className="d-flex align-items-stretch">
      <Card className="w-100 product-card">
        <Card.Img
          variant="top"
          src={
            product.productImageURL ||
            `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(
              product.name
            )}`
          }
          onError={handleImageError}
          alt={product.name}
        />
        <Card.Body className="d-flex flex-column p-3">
          {product.category && (
            <Badge
              pill
              bg="light"
              text="dark"
              className="mb-2 badge-category align-self-start"
            >
              {product.category}
            </Badge>
          )}
          <Card.Title as="h3" className="h6 mb-2 flex-grow-1">
            {product.name}
          </Card.Title>

          {showRating && product.averageRating > 0 && (
            <div className="mb-2">
              <StarRatingDisplay rating={product.averageRating} size={15} />
              <span className="ms-2 text-muted" style={{ fontSize: "0.8rem" }}>
                ({product.ratingCount || 0})
              </span>
            </div>
          )}

          <div className="mt-auto">
            <p className="price mb-3">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
            <Button
              variant="outline-secondary"
              size="sm"
              className="w-100 btn-detail"
              as={Link}
              to={`/menu/${product._id}`}
            >
              Lihat Detail
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  const renderProductSection = (
    loading,
    error,
    products,
    noProductMessage,
    showRating
  ) => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner
            animation="border"
            style={{ width: "3rem", height: "3rem", color: "#c07722" }}
          />
        </div>
      );
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    if (products.length === 0) {
      return (
        <Alert variant="light" className="text-center">
          {noProductMessage}
        </Alert>
      );
    }

    return (
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            showRating={showRating}
          />
        ))}
      </Row>
    );
  };

  return (
    <>
      <div
        className="hero-section"
        style={{ backgroundImage: `url(${heroBackgroundImageUrl})` }}
      >
        <div className="hero-overlay"></div>
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
              <Button
                as={Link}
                to="/menu"
                variant="primary"
                size="lg"
                className="hero-cta-button"
              >
                Pesan Sekarang!
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-5 pt-5 pb-4">
        {!isRecommendationsLoading && recommendedProducts.length > 0 && (
          <>
            <h2 className="text-center mb-5">REKOMENDASI UNTUK ANDA</h2>
            {renderProductSection(
              isRecommendationsLoading,
              recommendationsError,
              recommendedProducts,
              "Menu rekomendasi belum tersedia.",
              true
            )}
          </>
        )}
      </Container>

      <Container className="pt-2 pb-5">
        <h2 className="text-center mb-5">MENU UNGGULAN KAMI</h2>
        {renderProductSection(
          isLoading,
          error,
          featuredProducts,
          "Menu unggulan belum tersedia saat ini.",
          false
        )}
      </Container>

      <div className="text-center pb-5">
        <Button
          as={Link}
          to="/menu"
          variant="primary"
          size="lg"
          className="btn-brand"
        >
          Lihat Semua Menu
        </Button>
      </div>
    </>
  );
}

export default HomePage;
