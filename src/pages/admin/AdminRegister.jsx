import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { adminRegister } from "../../services/adminService";

const AdminRegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validated, setValidated] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Check if passwords match
    if (password !== confirmPassword) {
      setRegisterError("Password tidak cocok");
      setValidated(true);
      return;
    }

    // Form validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setRegisterError("");
    setLoading(true);
    setRegisterSuccess(false);

    try {
      console.log("Mencoba register admin dengan", {
        username,
        email,
        password: "***",
      });

      // Implementasi register admin
      await adminRegister(username, email, password);

      // Tampilkan pesan sukses
      setRegisterSuccess(true);

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setValidated(false);

      // Redirect ke halaman login admin setelah berhasil mendaftar
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (error) {
      console.error("Admin register error:", error);

      setRegisterError(
        error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle login redirect
  const handleAdminLoginRedirect = () => {
    navigate("/admin/login");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-0">Daftar Admin</h2>
                <p className="text-muted">
                  Buat akun admin baru untuk mengelola sistem
                </p>
              </div>

              {registerError && (
                <Alert variant="danger" className="mb-4">
                  {registerError}
                </Alert>
              )}

              {registerSuccess && (
                <Alert variant="success" className="mb-4">
                  Pendaftaran admin berhasil! Anda akan dialihkan ke halaman
                  login.
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username Admin</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan username admin"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    required
                    minLength="3"
                  />
                  <Form.Control.Feedback type="invalid">
                    Username harus minimal 3 karakter.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email Admin</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Masukkan email admin"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Silakan masukkan email yang valid.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Masukkan password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                  <Form.Control.Feedback type="invalid">
                    Password harus minimal 6 karakter.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formConfirmPassword">
                  <Form.Label>Konfirmasi Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Konfirmasi password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    isInvalid={validated && password !== confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    Password tidak cocok.
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Sedang Mendaftar...
                    </>
                  ) : (
                    "Daftar Admin"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Sudah punya akun admin?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={handleAdminLoginRedirect}
                  >
                    Login disini
                  </Button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRegisterPage;
