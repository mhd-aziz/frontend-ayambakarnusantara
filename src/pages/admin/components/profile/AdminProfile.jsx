/*
 * Component: AdminProfile
 * Deskripsi: Komponen untuk menampilkan dan mengedit profil admin
 * Digunakan di: Dashboard.jsx
 *
 * Fitur:
 * - Menampilkan data profil admin
 * - Mengupdate data profil admin (username, email, fullName, birthDate, address)
 * - Upload foto profil
 * - Validasi form
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Alert,
  Row,
  Col,
  Form,
  Image,
  Spinner,
} from "react-bootstrap";
import { FaUser, FaCamera, FaSave } from "react-icons/fa";
import profileService from "../../../../services/profileServices";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
];

const AdminProfile = () => {
  // State untuk data profil
  const [profileData, setProfileData] = useState({
    id: null,
    username: "",
    email: "",
    fullName: "",
    address: "",
    birthDate: "",
    photoAdmin: null,
    createdAt: "",
  });

  // State untuk file upload
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState("");

  // State untuk validasi & pesan
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    variant: "success",
    message: "",
  });

  // Fungsi helper untuk menampilkan alert
  const showAlert = useCallback((variant, message) => {
    setAlert({ show: true, variant, message });

    // Hide alert after 5 seconds
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  // Load profile data saat komponen dimount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await profileService.getAdminProfile();

        // Format tanggal lahir untuk input date
        let formattedBirthDate = "";
        if (data.birthDate) {
          const date = new Date(data.birthDate);
          formattedBirthDate = date.toISOString().split("T")[0];
        }

        setProfileData({
          ...data,
          birthDate: formattedBirthDate,
        });

        // Set preview image jika ada
        if (data.photoAdmin) {
          setImagePreview(data.photoAdmin);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Gunakan alert langsung tanpa showAlert callback
        setAlert({
          show: true,
          variant: "danger",
          message: "Gagal memuat data profil admin. Silakan coba lagi.",
        });

        // Set timeout untuk menutup alert
        setTimeout(() => {
          setAlert((prev) => ({ ...prev, show: false }));
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Hilangkan showAlert dari dependency array
  }, []);
  // Validate file type and size
  const validateFile = (file) => {
    setFileError("");

    if (file) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError("Format file tidak didukung. Gunakan JPG, PNG, atau GIF.");
        return false;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `Ukuran file terlalu besar. Maksimum ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB.`
        );
        return false;
      }
    }

    return true;
  };

  // Handle perubahan input profil
  const handleProfileChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      // Handle file upload
      if (files.length > 0) {
        const file = files[0];

        if (validateFile(file)) {
          setProfileData({
            ...profileData,
            photoAdmin: file,
          });

          // Create preview URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          // Reset file input on error
          e.target.value = "";
        }
      }
    } else {
      // Handle text input
      setProfileData({
        ...profileData,
        [name]: value,
      });
    }
  };

  // Handle submit form profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validate form
    if (form.checkValidity() === false || fileError) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setUpdating(true);

      // Persiapkan data untuk update
      const updateData = {
        username: profileData.username,
        email: profileData.email,
        fullName: profileData.fullName || "",
        address: profileData.address || "",
      };

      // Tambahkan tanggal lahir jika ada
      if (profileData.birthDate) {
        updateData.birthDate = profileData.birthDate;
      }

      // Tambahkan file foto jika ada yang baru
      // Pastikan ini adalah objek File, bukan string atau null
      if (profileData.photoAdmin && profileData.photoAdmin instanceof File) {
        updateData.photoAdmin = profileData.photoAdmin;
        console.log("Including photo in update:", profileData.photoAdmin.name);
      } else {
        console.log("No new photo to upload");
      }

      // Update profil
      const updatedProfile = await profileService.updateAdminProfile(
        updateData
      );

      // Format tanggal lahir untuk input date
      let formattedBirthDate = "";
      if (updatedProfile.birthDate) {
        const date = new Date(updatedProfile.birthDate);
        formattedBirthDate = date.toISOString().split("T")[0];
      }

      // Update state dengan data yang baru
      setProfileData({
        ...updatedProfile,
        birthDate: formattedBirthDate,
      });

      // Update preview image jika ada
      if (updatedProfile.photoAdmin) {
        setImagePreview(updatedProfile.photoAdmin);
      }

      showAlert("success", "Profil berhasil diperbarui");
      setValidated(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("danger", `Gagal memperbarui profil: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Format tanggal untuk display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="mb-4">Profil Admin</h3>

      {/* Alert Message */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4} className="text-center mb-4 mb-md-0">
              <div className="position-relative mb-4">
                <div
                  style={{
                    width: "180px",
                    height: "180px",
                    margin: "0 auto",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #ddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUser size={80} className="text-secondary" />
                  )}
                </div>
                <div className="mt-3">
                  <Form.Group controlId="formProfileImage">
                    <Form.Control
                      type="file"
                      onChange={handleProfileChange}
                      name="photoAdmin"
                      accept="image/*"
                      className="d-none"
                      id="profile-photo-input"
                    />
                    <label
                      htmlFor="profile-photo-input"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <FaCamera className="me-1" />{" "}
                      {imagePreview ? "Ganti Foto" : "Upload Foto"}
                    </label>
                    {fileError && (
                      <div className="text-danger mt-2 small">{fileError}</div>
                    )}
                  </Form.Group>
                </div>
              </div>
              <div className="text-muted small">
                <p>Anggota sejak: {formatDate(profileData.createdAt)}</p>
                <p>ID: {profileData.id}</p>
              </div>
            </Col>
            <Col md={8}>
              <Form
                noValidate
                validated={validated}
                onSubmit={handleProfileSubmit}
              >
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formUsername">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={profileData.username || ""}
                        onChange={handleProfileChange}
                        required
                        minLength="3"
                      />
                      <Form.Control.Feedback type="invalid">
                        Username harus minimal 3 karakter.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email || ""}
                        onChange={handleProfileChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Email tidak valid.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFullName">
                      <Form.Label>Nama Lengkap</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={profileData.fullName || ""}
                        onChange={handleProfileChange}
                        placeholder="Masukkan nama lengkap"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formBirthDate">
                      <Form.Label>Tanggal Lahir</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={profileData.birthDate || ""}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Alamat</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={profileData.address || ""}
                    onChange={handleProfileChange}
                    placeholder="Masukkan alamat"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={updating || fileError}
                  >
                    {updating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminProfile;
