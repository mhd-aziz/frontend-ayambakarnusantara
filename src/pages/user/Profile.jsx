// src/pages/user/Profile.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav, Card, Spinner } from "react-bootstrap";
import { getUserProfile } from "../../services/authService";

// Import komponen-komponen profil
import ProfileInfo from "./components/ProfileInfo";
import ChangePassword from "./components/ChangePassword";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data profil");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Render loading spinner
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Memuat data profil...</p>
      </Container>
    );
  }

  // Render error message
  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  // Render the profile page with sidebar
  return (
    <Container className="py-5">
      <h1 className="mb-4">Profil Saya</h1>

      <Row>
        {/* Sidebar */}
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link
                  className={`px-4 py-3 ${
                    activeTab === "profile" ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Informasi Profil
                </Nav.Link>
                <Nav.Link
                  className={`px-4 py-3 ${
                    activeTab === "password" ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => setActiveTab("password")}
                >
                  <i className="bi bi-key me-2"></i>
                  Ubah Password
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>

          {/* User Info Card */}
          <Card className="mt-4">
            <Card.Body className="text-center">
              {profile.photoUser ? (
                <img
                  src={profile.photoUser}
                  alt="Foto Profil"
                  className="img-fluid rounded-circle mb-3"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="bg-secondary rounded-circle mb-3 d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: "100px", height: "100px" }}
                >
                  <span className="text-white font-weight-bold h3">
                    {profile.fullName
                      ? profile.fullName.charAt(0).toUpperCase()
                      : profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h5 className="mb-1">{profile.fullName || profile.username}</h5>
              <p className="text-muted small mb-0">{profile.email}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={9}>
          <Card>
            <Card.Body>
              {activeTab === "profile" && (
                <ProfileInfo profile={profile} setProfile={setProfile} />
              )}
              {activeTab === "password" && <ChangePassword />}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
