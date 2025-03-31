/*
 * Component: DeleteConfirmation
 * Deskripsi: Dialog konfirmasi untuk menghapus produk
 * Digunakan di: ManageProducts.jsx
 */

import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaExclamationTriangle, FaTrash, FaTimes } from "react-icons/fa";

const DeleteConfirmation = ({
  show,
  onHide,
  onConfirm,
  loading,
  productName,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <FaExclamationTriangle className="me-2" />
          Konfirmasi Hapus
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Apakah Anda yakin ingin menghapus produk{" "}
          <strong>{productName}</strong>?
        </p>
        <p className="mb-0 text-danger">
          <small>Tindakan ini tidak dapat dibatalkan.</small>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          <FaTimes className="me-1" /> Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
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
              Menghapus...
            </>
          ) : (
            <>
              <FaTrash className="me-1" /> Hapus
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmation;
