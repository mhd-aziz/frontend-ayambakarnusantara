/*
 * Component: ShopForm
 * Deskripsi: Form untuk membuat atau mengedit toko
 * Digunakan di: ManageShop.jsx
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Image,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaUpload, FaSave, FaTimes } from "react-icons/fa";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
];

const ShopForm = ({ show, onHide, shop, onSubmit, loading }) => {
  // State untuk form data
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    photoShop: null,
  });

  // State untuk error dan validation
  const [imagePreview, setImagePreview] = useState(null);
  const [validated, setValidated] = useState(false);
  const [fileError, setFileError] = useState("");

  // Reset form saat modal dibuka/ditutup atau shop berubah
  useEffect(() => {
    if (show) {
      if (shop) {
        // Edit mode - isi dengan data toko
        setFormData({
          name: shop.name || "",
          address: shop.address || "",
          photoShop: null, // File input tidak bisa diisi otomatis
        });

        // Set preview image jika ada
        setImagePreview(shop.photoShop || null);
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          address: "",
          photoShop: null,
        });
        setImagePreview(null);
      }
      // Reset validation state
      setValidated(false);
      setFileError("");
    }
  }, [shop, show]);

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

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      // Handle file upload
      if (files.length > 0) {
        const file = files[0];

        if (validateFile(file)) {
          setFormData({
            ...formData,
            photoShop: file,
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
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validate form
    if (form.checkValidity() === false || fileError) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Submit form data
    onSubmit(formData);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{shop ? "Edit Toko" : "Buat Toko Baru"}</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3" controlId="shopName">
                <Form.Label>Nama Toko*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama toko"
                  required
                  maxLength={100}
                />
                <Form.Control.Feedback type="invalid">
                  Nama toko wajib diisi.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="shopAddress">
                <Form.Label>Alamat Toko*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Masukkan alamat toko"
                  required
                  maxLength={255}
                />
                <Form.Control.Feedback type="invalid">
                  Alamat toko wajib diisi.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.address?.length || 0}/255 karakter
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group className="mb-3" controlId="shopImage">
                <Form.Label>Foto Toko</Form.Label>
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="mb-3 d-flex justify-content-center align-items-center"
                    style={{
                      width: "200px",
                      height: "150px",
                      border: "2px dashed #ddd",
                      borderRadius: "5px",
                      backgroundColor: "#f8f9fa",
                      overflow: "hidden",
                    }}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Shop Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted">
                        <FaUpload size={30} />
                        <p className="mt-2 mb-0">Upload Gambar</p>
                      </div>
                    )}
                  </div>

                  {fileError && (
                    <Alert variant="danger" className="p-2 w-100 mb-3">
                      <small>{fileError}</small>
                    </Alert>
                  )}

                  <Form.Control
                    type="file"
                    onChange={handleChange}
                    name="photoShop"
                    accept="image/*"
                    className="d-none"
                    id="shop-photo-input"
                  />
                  <label
                    htmlFor="shop-photo-input"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <FaUpload className="me-1" />{" "}
                    {imagePreview ? "Ganti Gambar" : "Pilih Gambar"}
                  </label>
                  <Form.Text className="text-muted text-center mt-2">
                    <small>Format: JPG, PNG, GIF. Maks: 5MB</small>
                  </Form.Text>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            <FaTimes className="me-1" /> Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || fileError}
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
                Menyimpan...
              </>
            ) : (
              <>
                <FaSave className="me-1" /> Simpan
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ShopForm;
