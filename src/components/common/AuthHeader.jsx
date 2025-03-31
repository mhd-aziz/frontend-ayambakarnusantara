import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

const AuthHeader = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Jika user sudah login, jangan tampilkan header
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-header bg-warning text-dark py-2">
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={8} className="text-center text-md-start">
            <span className="fw-bold">
              Masuk Sekarang! untuk bisa pesan ayam bakar kesukaanmu
            </span>
          </Col>
          <Col xs={12} md={4} className="text-center text-md-end mt-2 mt-md-0">
            <Button
              as={Link}
              to="/login"
              variant="dark"
              size="sm"
              className="me-2"
            >
              Masuk
            </Button>
            <Button as={Link} to="/register" variant="outline-dark" size="sm">
              Daftar
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthHeader;
