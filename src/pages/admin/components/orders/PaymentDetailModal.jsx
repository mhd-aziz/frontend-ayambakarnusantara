import React from "react";
import { Modal, Button, Table, Badge, Row, Col, Card } from "react-bootstrap";

const PaymentDetailModal = ({
  show,
  onHide,
  paymentData,
  formatCurrency,
  formatDate,
}) => {
  if (!paymentData) return null;

  const { payment, midtransStatus } = paymentData;

  // Render badge status
  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case "pending":
        variant = "warning";
        break;
      case "capture":
      case "settlement":
        variant = "success";
        break;
      case "deny":
      case "cancel":
      case "expire":
        variant = "danger";
        break;
      case "challenge":
        variant = "info";
        break;
      default:
        variant = "secondary";
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detail Pembayaran</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Informasi Pembayaran</h5>
              </Card.Header>
              <Card.Body>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td width="30%">
                        <strong>ID Pembayaran</strong>
                      </td>
                      <td>{payment.id}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>ID Order</strong>
                      </td>
                      <td>{payment.orderId}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Transaction ID</strong>
                      </td>
                      <td>{payment.transactionId}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Jumlah</strong>
                      </td>
                      <td>{formatCurrency(payment.amount)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Status Pembayaran</strong>
                      </td>
                      <td>{renderStatusBadge(payment.status)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Status Order</strong>
                      </td>
                      <td>{renderStatusBadge(payment.statusOrder)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Snap Token</strong>
                      </td>
                      <td>{payment.snapToken || "-"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Waktu Pembuatan</strong>
                      </td>
                      <td>{formatDate(payment.createdAt)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Terakhir Diperbarui</strong>
                      </td>
                      <td>{formatDate(payment.updatedAt)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {payment.order && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Informasi Order</h5>
                </Card.Header>
                <Card.Body>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td width="30%">
                          <strong>ID Order</strong>
                        </td>
                        <td>{payment.order.id}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>ID Pengguna</strong>
                        </td>
                        <td>{payment.order.userId}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Total</strong>
                        </td>
                        <td>{formatCurrency(payment.order.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Status Order</strong>
                        </td>
                        <td>{renderStatusBadge(payment.order.status)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Waktu Pembuatan</strong>
                        </td>
                        <td>{formatDate(payment.order.createdAt)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Pengguna</strong>
                        </td>
                        <td>
                          <ul className="list-unstyled mb-0">
                            <li>
                              <strong>Username:</strong>{" "}
                              {payment.order.user?.username || "-"}
                            </li>
                            <li>
                              <strong>Nama:</strong>{" "}
                              {payment.order.user?.fullName || "-"}
                            </li>
                            <li>
                              <strong>Email:</strong>{" "}
                              {payment.order.user?.email || "-"}
                            </li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {midtransStatus && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Data Midtrans</h5>
                </Card.Header>
                <Card.Body>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td width="30%">
                          <strong>Status Transaksi</strong>
                        </td>
                        <td>
                          {renderStatusBadge(midtransStatus.transaction_status)}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Order ID</strong>
                        </td>
                        <td>{midtransStatus.order_id}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Jumlah</strong>
                        </td>
                        <td>
                          {formatCurrency(
                            parseFloat(midtransStatus.gross_amount)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Metode Pembayaran</strong>
                        </td>
                        <td>
                          {midtransStatus.payment_type?.replace("_", " ") ||
                            "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Waktu Transaksi</strong>
                        </td>
                        <td>
                          {midtransStatus.transaction_time
                            ? formatDate(midtransStatus.transaction_time)
                            : "-"}
                        </td>
                      </tr>
                      {midtransStatus.settlement_time && (
                        <tr>
                          <td>
                            <strong>Waktu Settlement</strong>
                          </td>
                          <td>{formatDate(midtransStatus.settlement_time)}</td>
                        </tr>
                      )}
                      {midtransStatus.expiry_time && (
                        <tr>
                          <td>
                            <strong>Waktu Kadaluarsa</strong>
                          </td>
                          <td>{formatDate(midtransStatus.expiry_time)}</td>
                        </tr>
                      )}
                      {midtransStatus.va_numbers &&
                        midtransStatus.va_numbers.length > 0 && (
                          <tr>
                            <td>
                              <strong>Detail VA</strong>
                            </td>
                            <td>
                              {midtransStatus.va_numbers.map((va, index) => (
                                <div key={index}>
                                  <strong>Bank:</strong> {va.bank.toUpperCase()}{" "}
                                  <br />
                                  <strong>Nomor VA:</strong> {va.va_number}
                                </div>
                              ))}
                            </td>
                          </tr>
                        )}
                      {midtransStatus.payment_amounts &&
                        midtransStatus.payment_amounts.length > 0 && (
                          <tr>
                            <td>
                              <strong>Detail Pembayaran</strong>
                            </td>
                            <td>
                              {midtransStatus.payment_amounts.map(
                                (payment, index) => (
                                  <div key={index}>
                                    <strong>Jumlah:</strong>{" "}
                                    {formatCurrency(parseFloat(payment.amount))}{" "}
                                    <br />
                                    <strong>Dibayar pada:</strong>{" "}
                                    {formatDate(payment.paid_at)}
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        )}
                      {midtransStatus.status_message && (
                        <tr>
                          <td>
                            <strong>Pesan Status</strong>
                          </td>
                          <td>{midtransStatus.status_message}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentDetailModal;
