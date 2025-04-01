import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiService from "../../services/api";
import "../../assets/styles/rating-page.css";

const RatingPage = () => {
  const { productId } = useParams(); // Get :productId from URL
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  // State for product and rating data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Rating form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await apiService.getProductById(productId);
        console.log("Fetched product data:", productData); // Log the product data
        setProduct(productData); // Set the product data
      } catch (err) {
        console.error(`Error fetching product with id ${productId}:`, err);
        setError(
          "Terjadi kesalahan saat mengambil detail produk. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, isAuthenticated, navigate]);

  // Handle submit rating
  const handleSubmitRating = async (e) => {
    e.preventDefault();

    // Ensure the user selects a rating
    if (rating === 0) {
      setError("Silakan beri rating sebelum mengirim.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // createOrUpdateRating(productId, rating, comment)
      await apiService.createOrUpdateRating(productId, rating, comment);
      setSuccess(true);

      // After successful submission, redirect the user
      setTimeout(() => {
        navigate(`/product/${productId}`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Gagal mengirim penilaian. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render star rating
  const renderStarRating = () => (
    <div className="star-rating-container">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <label key={ratingValue}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              style={{ display: "none" }}
              onClick={() => setRating(ratingValue)}
            />
            <FaStar
              className="star"
              color={
                ratingValue <= (hoverRating || rating) ? "#ffc107" : "#e4e5e9"
              }
              size={40}
              onMouseEnter={() => setHoverRating(ratingValue)}
              onMouseLeave={() => setHoverRating(0)}
            />
          </label>
        );
      })}
    </div>
  );

  return (
    <Container className="py-5 mt-5">
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <FaArrowLeft className="me-2" />
          Kembali
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="mt-2 text-muted">Memuat detail produk...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {/* Rating Form */}
      {!loading && !error && product && (
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm">
              <Card.Header className="bg-warning text-white">
                <h4 className="mb-0">Beri Penilaian</h4>
              </Card.Header>

              <Card.Body>
                {/* Success Message */}
                {success && (
                  <Alert variant="success">
                    Penilaian berhasil dikirim! Anda akan dialihkan dalam
                    beberapa saat...
                  </Alert>
                )}

                <Form onSubmit={handleSubmitRating}>
                  {/* Star Rating */}
                  <Form.Group className="mb-4 text-center">
                    <Form.Label className="rating-label">
                      Berikan Rating
                    </Form.Label>
                    {renderStarRating()}
                  </Form.Group>

                  {/* Comment */}
                  <Form.Group className="mb-4">
                    <Form.Label>Komentar</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Bagikan pengalaman Anda dengan produk ini..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <Button
                      variant="warning"
                      type="submit"
                      disabled={submitting}
                      className="py-2"
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Penilaian"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RatingPage;
