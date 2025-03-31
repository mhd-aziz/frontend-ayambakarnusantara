import React from "react";
import { Modal, Button, Row, Col, Table, Badge } from "react-bootstrap";

const OrderDetailModal = ({
  show,
  onHide,
  order,
  formatCurrency,
  formatDate,
}) => {
  if (!order) return null;

  // Render badge status
  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case "pending":
        variant = "warning";
        break;
      case "proses":
        variant = "primary";
        break;
      case "ready":
        variant = "info";
        break;
      case "delivered":
      case "settlement":
        variant = "success";
        break;
      default:
        variant = "secondary";
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detail Order #{order.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h5>Informasi Order</h5>
            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td width="40%">
                    <strong>ID Order</strong>
                  </td>
                  <td>#{order.id}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tanggal Order</strong>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Status Order</strong>
                  </td>
                  <td>{renderStatusBadge(order.status)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col md={6}>
            <h5>Informasi Pelanggan</h5>
            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td width="40%">
                    <strong>Nama</strong>
                  </td>
                  <td>{order.user?.fullName}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Email</strong>
                  </td>
                  <td>{order.user?.email}</td>
                </tr>
                <tr>
                  <td>
                    <strong>No. Telepon</strong>
                  </td>
                  <td>{order.user?.phoneNumber}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Alamat</strong>
                  </td>
                  <td>{order.user?.address || "-"}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        <hr />

        {/* Payment Information */}
        <h5>Informasi Pembayaran</h5>
        {order.payment ? (
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td width="20%">
                  <strong>ID Pembayaran</strong>
                </td>
                <td>{order.payment.id}</td>
              </tr>
              <tr>
                <td>
                  <strong>Status Pembayaran</strong>
                </td>
                <td>{renderStatusBadge(order.payment.status)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Status Order</strong>
                </td>
                <td>{renderStatusBadge(order.payment.statusOrder)}</td>
              </tr>
              {order.payment.snapToken && (
                <tr>
                  <td>
                    <strong>Snap Token</strong>
                  </td>
                  <td>{order.payment.snapToken}</td>
                </tr>
              )}
            </tbody>
          </Table>
        ) : (
          <p>Belum ada informasi pembayaran.</p>
        )}

        <hr />

        {/* Order Items */}
        <h5>Produk yang Dipesan</h5>
        {order.orderItems && order.orderItems.length > 0 ? (
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Produk</th>
                <th>Harga</th>
                <th>Jumlah</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ width: "80px" }}>
                    {item.product?.photoProduct ? (
                      <img
                        src={item.product.photoProduct}
                        alt={item.product.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          background: "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
                  <td>{item.product?.name || "Produk tidak tersedia"}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end">
                  <strong>Total:</strong>
                </td>
                <td>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </td>
              </tr>
            </tfoot>
          </Table>
        ) : (
          <p>Tidak ada data produk yang dipesan.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailModal;
