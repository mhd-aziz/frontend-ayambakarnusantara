// src/pages/user/components/ProfileInfo.jsx
import React, { useState, useRef } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Image } from "react-bootstrap";
import { updateUserProfile } from "../../../services/authService";

const ProfileInfo = ({ profile, setProfile }) => {
  const [formData, setFormData] = useState({
    username: profile.username,
    email: profile.email,
    fullName: profile.fullName || "",
    address: profile.address || "",
    birthDate: profile.birthDate ? profile.birthDate.split("T")[0] : "",
    phoneNumber: profile.phoneNumber || "",
  });

  // State untuk foto
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // State untuk status form
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle form input changes untuk data profil
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file tidak boleh lebih dari 2MB");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Handle form submission untuk data profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      let dataToSend;

      // Jika ada file yang dipilih, kirim sebagai FormData
      if (selectedFile) {
        // Create FormData object for file upload
        dataToSend = new FormData();

        // Tambahkan file baru
        dataToSend.append("photoUser", selectedFile);

        // Tambahkan data profil lainnya
        Object.keys(formData).forEach((key) => {
          if (formData[key]) {
            dataToSend.append(key, formData[key]);
          }
        });
      } else {
        // Jika tidak ada file baru, kirim data profil saja tanpa mengubah foto
        dataToSend = {
          ...formData,
          // Tidak menyertakan field photoUser sama sekali sehingga backend akan mempertahankan nilai yang sudah ada
        };
      }

      const updatedProfile = await updateUserProfile(dataToSend);
      setProfile(updatedProfile);
      setSuccess("Profil berhasil diperbarui!");

      // Reset selected file after successful upload
      if (selectedFile) {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui profil");
      console.error("Error updating profile:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = async () => {
    if (!profile.photoUser) {
      setError("Tidak ada foto profil untuk dihapus");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      // Send null value for photoUser to remove photo
      const updatedProfile = await updateUserProfile({ photoUser: null });
      setProfile(updatedProfile);
      setSuccess("Foto profil berhasil dihapus!");

      // Clear preview if exists
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus foto profil");
      console.error("Error removing profile photo:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <h3 className="mb-4">Informasi Profil</h3>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Foto Profil Section */}
      <div className="mb-4">
        <h5 className="mb-3">Foto Profil</h5>
        <div className="d-flex align-items-center mb-4">
          <div className="me-4">
            {profile.photoUser ? (
              <Image
                src={profile.photoUser}
                alt="Foto Profil"
                roundedCircle
                className="mb-3"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className="bg-secondary rounded-circle mb-3 d-flex align-items-center justify-content-center"
                style={{ width: "120px", height: "120px" }}
              >
                <span className="text-white font-weight-bold h1">
                  {profile.fullName
                    ? profile.fullName.charAt(0).toUpperCase()
                    : profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div>
            <Form.Group controlId="photoUser" className="mb-3">
              <Form.Label>Ubah Foto Profil</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Form.Text className="text-muted">
                Format yang didukung: JPG, JPEG, PNG. Ukuran maksimal 2MB.
              </Form.Text>
            </Form.Group>

            {profile.photoUser && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={updating}
              >
                Hapus Foto
              </Button>
            )}
          </div>
        </div>

        {/* Preview Foto Baru */}
        {previewUrl && (
          <div className="mb-4">
            <h6 className="mb-2">Preview Foto Baru</h6>
            <Image
              src={previewUrl}
              alt="Preview Foto Profil"
              roundedCircle
              className="mb-3"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>

      {/* Separator */}
      <hr className="my-4" />

      <Form onSubmit={handleSubmit}>
        <h5 className="mb-3">Data Profil</h5>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                disabled
              />
              <Form.Text className="text-muted">
                Username tidak dapat diubah
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                disabled
              />
              <Form.Text className="text-muted">
                Email tidak dapat diubah
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3" controlId="phoneNumber">
              <Form.Label>No. Telepon</Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Alamat</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="birthDate">
          <Form.Label>Tanggal Lahir</Form.Label>
          <Form.Control
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={updating}>
          {updating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </Form>
    </>
  );
};

export default ProfileInfo;
