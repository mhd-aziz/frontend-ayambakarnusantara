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

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validated, setValidated] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password match when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        setPasswordMatch(value === confirmPassword);
      } else {
        setPasswordMatch(password === value);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordMatch(false);
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
    setRegisterSuccess(false);
    setDebugInfo(null);

    try {
      console.log("Mencoba register dengan", {
        username,
        email,
        password: "***",
      });

      // Pastikan data yang dikirim sesuai dengan API
      const data = await register(username, email, password);

      // Simpan token ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Simpan data untuk debugging
      setDebugInfo({
        success: true,
        responseData: data,
      });

      // Tampilkan pesan sukses
      setRegisterSuccess(true);

      // Tunggu sebentar sebelum redirect agar user sempat melihat pesan sukses
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      // Tangani error dari API
      let errorMessage = "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      // Simpan data error untuk debugging
      setDebugInfo({
        success: false,
        error: errorMessage,
        errorObject: error.toString(),
        response: error.response ? error.response.data : null,
      });

      setRegisterError(errorMessage);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-0">Daftar Akun</h2>
                <p className="text-muted">Buat akun baru Anda</p>
              </div>

              {registerError && (
                <Alert variant="danger" className="mb-4">
                  {registerError}
                </Alert>
              )}

              {registerSuccess && (
                <Alert variant="success" className="mb-4">
                  Pendaftaran berhasil! Akun Anda telah dibuat. Anda akan
                  dialihkan dalam beberapa detik...
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan username"
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
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Masukkan email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Silakan masukkan alamat email yang valid.
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
                    isInvalid={validated && !passwordMatch}
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
                    "Daftar"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Sudah punya akun?{" "}
                  <Link to="/login" className="text-primary">
                    Masuk disini
                  </Link>
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

export default Register;
