import React from "react";
import {
  Modal,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  ListGroup,
  Badge,
} from "react-bootstrap";

function SellerOrderDetailModal({
  show,
  onHide,
  orderData,
  isLoading,
  error,
  getStatusBadgeVariant,
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Detail Pesanan #
          {orderData?.order?.orderId
            ? orderData.order.orderId.substring(0, 8)
            : "..."}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Memuat detail...</p>
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {orderData && !isLoading && !error && (
          <>
            <Row>
              <Col md={6}>
                <h5>Informasi Pesanan</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>ID Pesanan:</strong> {orderData.order.orderId}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Tanggal:</strong>{" "}
                    {new Date(orderData.order.createdAt).toLocaleString(
                      "id-ID",
                      { dateStyle: "full", timeStyle: "long" }
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={getStatusBadgeVariant(orderData.order.orderStatus)}
                    >
                      {orderData.order.orderStatus.replace(/_/g, " ")}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Total:</strong> Rp{" "}
                    {orderData.order.totalPrice.toLocaleString("id-ID")}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Metode Pembayaran:</strong>{" "}
                    {orderData.order.paymentDetails?.method?.replace(
                      /_/g,
                      " "
                    ) || "N/A"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Status Pembayaran:</strong>{" "}
                    <Badge
                      bg={
                        orderData.order.paymentDetails?.status === "paid"
                          ? "success"
                          : orderData.order.paymentDetails?.status ===
                            "pending_online_payment"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {orderData.order.paymentDetails?.status?.replace(
                        /_/g,
                        " "
                      ) || "N/A"}
                    </Badge>
                  </ListGroup.Item>
                  {orderData.order.notes && (
                    <ListGroup.Item>
                      <strong>Catatan Pelanggan:</strong>{" "}
                      {orderData.order.notes}
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Col>
              <Col md={6}>
                <h5>Informasi Pelanggan</h5>
                {orderData.customerDetails ? (
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Nama:</strong>{" "}
                      {orderData.customerDetails.displayName || "N/A"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Email:</strong>{" "}
                      {orderData.customerDetails.email || "N/A"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Telepon:</strong>{" "}
                      {orderData.customerDetails.phoneNumber || "N/A"}
                    </ListGroup.Item>
                  </ListGroup>
                ) : (
                  <p>Detail pelanggan tidak tersedia.</p>
                )}
              </Col>
            </Row>
            <h5 className="mt-4">Item Pesanan</h5>
            <ListGroup>
              {orderData.order.items.map((item, index) => (
                <ListGroup.Item key={index}>
                  <Row>
                    <Col xs={2} sm={1}>
                      <img
                        src={
                          item.productImageURL ||
                          `https://placehold.co/50x50/EFEFEF/AAAAAA?text=${encodeURIComponent(
                            item.name[0]
                          )}`
                        }
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{
                          maxWidth: "50px",
                          maxHeight: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </Col>
                    <Col>
                      <strong>{item.name}</strong> <br />
                      <small className="text-muted">
                        {item.quantity} x Rp{" "}
                        {item.price.toLocaleString("id-ID")}
                      </small>
                    </Col>
                    <Col xs={3} className="text-end">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SellerOrderDetailModal;
