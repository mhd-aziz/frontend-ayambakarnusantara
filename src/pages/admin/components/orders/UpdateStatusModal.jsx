import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const UpdateStatusModal = ({ show, onHide, order, onSubmit, loading }) => {
  const [status, setStatus] = useState(order?.status || "pending");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (order) {
      onSubmit(order.id, status);
    }
  };

  if (!order) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Update Status Order #{order.id}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status Order Saat Ini</Form.Label>
            <Form.Control
              type="text"
              value={order.status}
              disabled
              className="bg-light"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status Order Baru</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="pending">Pending</option>
              <option value="proses">Proses</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancel">Cancel</option>
            </Form.Select>
          </Form.Group>
          <div className="alert alert-info">
            <strong>Catatan:</strong>
            <ul className="mb-0 small">
              <li>
                <strong>Pending</strong>: Order baru dibuat, menunggu pembayaran
              </li>
              <li>
                <strong>Proses</strong>: Pembayaran selesai, pesanan sedang
                diproses
              </li>
              <li>
                <strong>Ready</strong>: Pesanan siap untuk dikirim/diambil
              </li>
              <li>
                <strong>Delivered</strong>: Pesanan sudah dikirim/diambil
                pelanggan
              </li>
              <li>
                <strong>Cancel</strong>: Pesanan dibatalkan
              </li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
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
                Memproses...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateStatusModal;
