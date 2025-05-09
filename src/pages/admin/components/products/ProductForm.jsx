/*
 * Component: ProductForm
 * Deskripsi: Form untuk membuat atau mengedit produk
 * Digunakan di: ManageProducts.jsx
 *
 * Perubahan:
 * - Validasi file yang diupload (tipe dan ukuran)
 * - Penanganan nilai number yang lebih baik
 * - Tambahan validasi input
 * - Debug info (hanya di development mode)
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

const ProductForm = ({ show, onHide, product, onSubmit, loading }) => {
  // State untuk form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    photoProduct: null,
  });

  // State untuk error dan validation
  const [imagePreview, setImagePreview] = useState(null);
  const [validated, setValidated] = useState(false);
  const [fileError, setFileError] = useState("");

  // Reset form saat modal dibuka/ditutup atau product berubah
  useEffect(() => {
    if (show) {
      if (product) {
        // Edit mode - isi dengan data produk
        setFormData({
          name: product.name || "",
          description: product.description || "",
          // Convert ke string untuk input
          price: product.price?.toString() || "",
          stock: product.stock?.toString() || "",
          photoProduct: null, // File input tidak bisa diisi otomatis
        });

        // Set preview image jika ada
        setImagePreview(product.photoProduct || null);
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          photoProduct: null,
        });
        setImagePreview(null);
      }
      // Reset validation state
      setValidated(false);
      setFileError("");
    }
  }, [product, show]);

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
            photoProduct: file,
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

    // Format data for API
    const productData = {
      ...formData,
      // Parse number values correctly
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
    };

    // Log data in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Submitting product data:", {
        ...productData,
        photoProduct: productData.photoProduct
          ? `[File: ${productData.photoProduct.name}]`
          : null,
      });
    }

    onSubmit(productData);
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
        <Modal.Title>
          {product ? "Edit Produk" : "Tambah Produk Baru"}
        </Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3" controlId="productName">
                <Form.Label>Nama Produk*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama produk"
                  required
                  maxLength={100}
                />
                <Form.Control.Feedback type="invalid">
                  Nama produk wajib diisi.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="productDescription">
                <Form.Label>Deskripsi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Deskripsi produk (opsional)"
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {formData.description?.length || 0}/500 karakter
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="productPrice">
                    <Form.Label>Harga (Rp)*</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Harga produk"
                      min="0"
                      step="1000"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Harga produk wajib diisi dan bernilai positif.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="productStock">
                    <Form.Label>Stok*</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="Jumlah stok"
                      min="0"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Stok produk wajib diisi dan bernilai positif.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="productImage">
                <Form.Label>Foto Produk</Form.Label>
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="mb-3 d-flex justify-content-center align-items-center"
                    style={{
                      width: "150px",
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
                        alt="Product Preview"
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
                    name="photoProduct"
                    accept="image/*"
                    className="d-none"
                    id="actual-btn"
                  />
                  <label
                    htmlFor="actual-btn"
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

export default ProductForm;
