/*
 * Component: ManageShop
 * Deskripsi: Komponen untuk manajemen toko di dashboard admin
 * Digunakan di: Dashboard.jsx
 *
 * Fitur:
 * - Menampilkan detail toko
 * - Membuat toko baru jika belum ada
 * - Mengupdate toko yang sudah ada
 * - Menghapus toko
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Alert,
  Row,
  Col,
  Image,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaStore, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import shopService from "../../../../services/shopServices";

// Import komponen
import ShopForm from "./ShopForm";

const ManageShop = () => {
  // State untuk data
  const [shop, setShop] = useState(null);

  // State untuk UI
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State untuk pesan alert
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

  // Load shop data saat komponen dimount
  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const data = await shopService.getShop();
        setShop(data);
      } catch (error) {
        console.error("Error fetching shop:", error);

        // Hanya tampilkan alert jika bukan error 404 (toko belum dibuat)
        if (!error.message.includes("not found")) {
          showAlert("danger", "Gagal memuat data toko. Silakan coba lagi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [showAlert]);

  // Handler untuk membuka form tambah/edit toko
  const handleOpenForm = () => {
    setShowForm(true);
  };

  // Handler untuk submit form toko (create/update)
  const handleShopSubmit = async (shopData) => {
    try {
      setFormLoading(true);

      if (shop) {
        // Update existing shop
        const updatedShop = await shopService.updateShop(shopData);
        setShop(updatedShop);
        showAlert("success", "Toko berhasil diperbarui.");
      } else {
        // Create new shop
        const newShop = await shopService.createShop(shopData);
        setShop(newShop);
        showAlert("success", "Toko berhasil dibuat.");
      }

      // Close form
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting shop:", error);
      showAlert(
        "danger",
        `Gagal ${shop ? "memperbarui" : "membuat"} toko. ${error.message}`
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Handler untuk membuka konfirmasi hapus toko
  const handleOpenDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  // Handler untuk menghapus toko
  const handleDeleteShop = async () => {
    try {
      setDeleteLoading(true);

      await shopService.deleteShop();
      showAlert("success", "Toko berhasil dihapus.");

      // Reset shop data
      setShop(null);

      // Close modal
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting shop:", error);
      showAlert("danger", `Gagal menghapus toko. ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Render empty shop state
  const renderEmptyShop = () => (
    <Card className="text-center p-5 border-0 shadow-sm">
      <div className="py-5">
        <FaStore size={50} className="text-secondary mb-3" />
        <h4>Anda belum memiliki toko</h4>
        <p className="text-muted">Buat toko untuk mulai menjual produk Anda.</p>
        <Button variant="primary" className="mt-3" onClick={handleOpenForm}>
          <FaPlus className="me-1" /> Buat Toko
        </Button>
      </div>
    </Card>
  );

  // Render shop details
  const renderShopDetails = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Detail Toko</h5>
        <div>
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={handleOpenForm}
          >
            <FaEdit className="me-1" /> Edit Toko
          </Button>
          <Button variant="danger" size="sm" onClick={handleOpenDeleteConfirm}>
            <FaTrash className="me-1" /> Hapus Toko
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4} className="text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center align-items-center h-100">
              {shop.photoShop ? (
                <Image
                  src={shop.photoShop}
                  alt={shop.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                  }}
                  thumbnail
                />
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center bg-light"
                  style={{
                    width: "200px",
                    height: "150px",
                    borderRadius: "5px",
                  }}
                >
                  <FaStore size={40} className="text-secondary" />
                </div>
              )}
            </div>
          </Col>
          <Col md={8}>
            <h3>{shop.name}</h3>
            <hr />
            <p>
              <strong>Alamat:</strong>
            </p>
            <p>{shop.address}</p>
            {shop.createdAt && (
              <p className="text-muted mt-3">
                <small>
                  Toko dibuat pada:{" "}
                  {new Date(shop.createdAt).toLocaleDateString()}
                </small>
              </p>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Render delete confirmation modal
  const renderDeleteModal = () => (
    <Modal
      show={showDeleteConfirm}
      onHide={() => setShowDeleteConfirm(false)}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Konfirmasi Hapus Toko</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Apakah Anda yakin ingin menghapus toko <strong>{shop?.name}</strong>?
        </p>
        <p className="text-danger">
          <strong>Perhatian:</strong> Menghapus toko akan menghapus semua data
          terkait toko termasuk produk!
        </p>
        <p className="mb-0 text-danger">
          <small>Tindakan ini tidak dapat dibatalkan.</small>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={deleteLoading}
        >
          Batal
        </Button>
        <Button
          variant="danger"
          onClick={handleDeleteShop}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Menghapus...
            </>
          ) : (
            <>Hapus Toko</>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <h3 className="mb-4">Manajemen Toko</h3>

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

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Memuat data toko...</p>
        </div>
      ) : shop ? (
        renderShopDetails()
      ) : (
        renderEmptyShop()
      )}

      {/* Shop Form Modal */}
      <ShopForm
        show={showForm}
        onHide={() => setShowForm(false)}
        shop={shop}
        onSubmit={handleShopSubmit}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      {shop && showDeleteConfirm && renderDeleteModal()}
    </>
  );
};

export default ManageShop;
