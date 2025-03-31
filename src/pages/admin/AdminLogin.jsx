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
import { adminLogin } from "../../services/adminService";

const AdminLoginPage = () => {
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { identifier, password } = loginData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Form validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoginError("");
    setLoading(true);

    try {
      console.log("Mencoba login admin dengan", {
        identifier,
        password: "***",
      });

      // Implementasi login admin
      const response = await adminLogin(identifier, password);

      // Simpan token dan data admin
      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminData", JSON.stringify(response.admin));

      // Redirect ke dashboard admin
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

      setLoginError(
        error.message || "Terjadi kesalahan saat login. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle user login redirect
  const handleUserLoginRedirect = () => {
    navigate("/login");
  };

  // Handle admin register redirect
  const handleAdminRegisterRedirect = () => {
    navigate("/admin/register");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-0">Login Admin</h2>
                <p className="text-muted">
                  Masuk ke panel admin untuk mengelola sistem
                </p>
              </div>

              {loginError && (
                <Alert variant="danger" className="mb-4">
                  {loginError}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formIdentifier">
                  <Form.Label>Username atau Email Admin</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan username atau email"
                    name="identifier"
                    value={identifier}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Silakan masukkan username atau email admin.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Masukkan password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Silakan masukkan password.
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
                      Sedang Masuk...
                    </>
                  ) : (
                    "Login Admin"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-2">
                  Belum punya akun admin?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={handleAdminRegisterRedirect}
                  >
                    Daftar disini
                  </Button>
                </p>
                <p className="mb-0 text-muted">
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={handleUserLoginRedirect}
                  >
                    Login sebagai user?{" "}
                    <span className="text-primary">User</span>
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

export default AdminLoginPage;
