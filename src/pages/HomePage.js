import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getProducts } from "../services/MenuService";
import { getAllRatings } from "../services/RatingService";
import {
  Star,
  StarFill,
  StarHalf,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
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

const RatingCard = ({ rating }) => (
  <div className="rating-card-wrapper">
    <Card className="w-100 h-100 text-center p-3 testimonial-card shadow-sm">
      <Card.Img
        variant="top"
        src={
          rating.userPhotoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            rating.userDisplayName || "U"
          )}&background=C07722&color=fff&size=80`
        }
        alt={rating.userDisplayName}
        className="rounded-circle mx-auto mb-3"
        style={{
          width: "80px",
          height: "80px",
          objectFit: "cover",
          border: "3px solid #C07722",
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h5" className="h6 mb-1">
          {rating.userDisplayName}
        </Card.Title>
        <div className="mb-2">
          <StarRatingDisplay rating={rating.ratingValue} size={18} />
        </div>
        <blockquote className="blockquote mb-0 flex-grow-1 d-flex align-items-center justify-content-center">
          <p className="small fst-italic mb-0">
            "{rating.reviewText || "Pengguna ini tidak memberikan ulasan teks."}
            "
          </p>
        </blockquote>
      </Card.Body>
    </Card>
  </div>
);

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecommendationsLoading, setIsRecommendationsLoading] =
    useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [isRatingsLoading, setIsRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState(null);
  const ratingsContainerRef = useRef(null);

  const fetchFeaturedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProducts({
        limit: 8,
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
        limit: 4,
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

  const fetchRatings = useCallback(async () => {
    setIsRatingsLoading(true);
    setRatingsError(null);
    try {
      const response = await getAllRatings({
        sortBy: "createdAt",
        order: "desc",
      });
      if (
        response &&
        response.success &&
        Array.isArray(response.data.ratings)
      ) {
        setRatings(response.data.ratings);
      } else {
        setRatingsError("Gagal memuat data ulasan.");
      }
    } catch (err) {
      setRatingsError(
        err.message || "Terjadi kesalahan pada server saat mengambil ulasan."
      );
    } finally {
      setIsRatingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchRecommendedProducts();
    fetchRatings();
  }, [fetchFeaturedProducts, fetchRecommendedProducts, fetchRatings]);

  const handleImageError = (e, productName) => {
    e.target.onerror = null;
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      productName || "Ayam"
    )}&background=f0f2f5&color=757575&size=400`;
  };

  const scrollRatings = (direction) => {
    if (ratingsContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ratingsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const ProductCard = ({ product, showRating = false }) => (
    <Col className="d-flex align-items-stretch">
      <Card className="w-100 product-card">
        <Card.Img
          variant="top"
          src={
            product.productImageURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              product.name
            )}&background=f0f2f5&color=757575&size=400`
          }
          onError={(e) => handleImageError(e, product.name)}
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

  const renderProductSection = (loading, error, products, showRating) => {
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
    if (error || products.length === 0) {
      return null;
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

  const renderRatingsSection = (loading, error, ratingsData) => {
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
    if (error || ratingsData.length === 0) {
      return null;
    }
    return (
      <div className="horizontal-scroll-wrapper">
        <div className="horizontal-scroll-container" ref={ratingsContainerRef}>
          <div className="d-flex flex-nowrap">
            {ratingsData.map((rating) => (
              <RatingCard key={rating.ratingId} rating={rating} />
            ))}
          </div>
        </div>
        <div className="scroll-button-container">
          <Button
            className="scroll-button left"
            onClick={() => scrollRatings("left")}
            aria-label="Geser ke kiri"
          >
            <ChevronLeft />
          </Button>
          <Button
            className="scroll-button right"
            onClick={() => scrollRatings("right")}
            aria-label="Geser ke kanan"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
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
        {recommendedProducts.length > 0 && !isRecommendationsLoading && (
          <>
            <h2 className="text-center mb-5">REKOMENDASI UNTUK ANDA</h2>
            {renderProductSection(
              isRecommendationsLoading,
              recommendationsError,
              recommendedProducts,
              true
            )}
          </>
        )}
      </Container>

      <Container className="pt-2 pb-5">
        <h2 className="text-center mb-5">MENU UNGGULAN KAMI</h2>
        {renderProductSection(isLoading, error, featuredProducts, false)}
        <div className="text-center mt-5">
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
      </Container>

      {ratings.length > 0 && !isRatingsLoading && (
        <div className="testimonials-section py-5">
          <Container>
            <h2 className="text-center mb-5">APA KATA PELANGGAN KAMI?</h2>
            {renderRatingsSection(isRatingsLoading, ratingsError, ratings)}
          </Container>
        </div>
      )}
    </>
  );
}

export default HomePage;
