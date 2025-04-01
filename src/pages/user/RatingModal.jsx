import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import apiService from "../../services/api";

const RatingModal = ({
  show,
  onHide,
  productId,
  productName,
  onSuccess,
  onError,
}) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Handle form reset when modal closes
  const handleClose = () => {
    setRatingValue(5);
    setRatingComment("");
    onHide();
  };

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!productId) {
      console.error("No product ID provided for rating");
      if (onError) onError();
      return;
    }

    setSubmittingRating(true);
    try {
      console.log("Submitting rating:", {
        productId,
        ratingValue,
        ratingComment,
      });

      // Call the API with individual parameters to match your apiService implementation
      const response = await apiService.createOrUpdateRating(
        productId,
        ratingValue,
        ratingComment
      );
      console.log("Rating submitted successfully:", response);

      // Reset form
      setRatingValue(5);
      setRatingComment("");

      // Notify parent component
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error submitting rating:", err);
      if (onError) onError();
    } finally {
      setSubmittingRating(false);
    }
  };

  // Render star rating component
  const renderStars = (value, onStarClick = null) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={star <= value ? "star-active" : "star-inactive"}
        style={{
          fontSize: "1.5rem",
          cursor: "pointer",
          color: star <= value ? "#FFD700" : "#e4e5e9",
        }}
        onClick={onStarClick ? () => onStarClick(star) : undefined}
      />
    ));
  };

  // Get rating text based on value
  const getRatingText = (value) => {
    switch (value) {
      case 1:
        return "Sangat Buruk";
      case 2:
        return "Buruk";
      case 3:
        return "Cukup";
      case 4:
        return "Baik";
      case 5:
        return "Sangat Baik";
      default:
        return "";
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaStar className="me-2 text-warning" />
          Beri Penilaian Produk
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">
          Berikan penilaian Anda untuk produk{" "}
          <strong>{productName || "ini"}</strong>
        </p>

        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-2">
            {renderStars(ratingValue, setRatingValue)}
          </div>
          <div className="text-muted small mt-1">
            {getRatingText(ratingValue)}
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Komentar (Opsional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Bagikan pengalaman Anda dengan produk ini..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Batal
        </Button>
        <Button
          variant="warning"
          onClick={handleSubmitRating}
          disabled={submittingRating}
        >
          {submittingRating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Menyimpan...
            </>
          ) : (
            <>
              <FaStar className="me-2" />
              Kirim Penilaian
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RatingModal;
