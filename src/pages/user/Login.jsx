import React, { useState, useContext } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);

  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const { identifier, password } = formData;

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

    // Form validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoginError("");
    setDebugInfo(null);

    try {
      console.log("Mencoba login dengan", {
        identifier,
        password: "***",
      });
      const data = await login(identifier, password);

      // Simpan data untuk debugging
      setDebugInfo({
        success: true,
        responseData: data,
      });

      // Redirect setelah login berhasil
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      // Simpan data error untuk debugging
      setDebugInfo({
        success: false,
        error: error.toString(),
      });

      setLoginError(
        error.message || "Terjadi kesalahan saat login. Silakan coba lagi."
      );
    }
  };

  // Handle admin login redirect
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
                <h2 className="mb-0">Masuk ke Akun</h2>
                <p className="text-muted">
                  Masuk untuk memesan dan melihat riwayat pesanan Anda
                </p>
              </div>

              {loginError && (
                <Alert variant="danger" className="mb-4">
                  {loginError}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formIdentifier">
                  <Form.Label>Email atau Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan email atau username"
                    name="identifier"
                    value={identifier}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Silakan masukkan email atau username Anda.
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
                    Silakan masukkan password Anda.
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
                    "Masuk"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-2">
                  Belum punya akun?{" "}
                  <Link to="/register" className="text-primary">
                    Daftar disini
                  </Link>
                </p>
                <p className="mb-0 text-muted">
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={handleAdminLoginRedirect}
                  >
                    Login sebagai admin?{" "}
                    <span className="text-primary">Admin</span>
                  </Button>
                </p>
              </div>

              {/* Debug information - hanya tampil pada development */}
              {process.env.NODE_ENV === "development" && debugInfo && (
                <div className="mt-4 p-3 border border-light bg-light">
                  <h6>Debug Information:</h6>
                  <pre
                    className="small"
                    style={{ maxHeight: "200px", overflow: "auto" }}
                  >
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
