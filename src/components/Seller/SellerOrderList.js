import React from "react";
import { ListGroup, Row, Col, Badge, Button } from "react-bootstrap";
import {
  EyeFill,
  PencilSquare,
  CardChecklist,
  ImageFill,
} from "react-bootstrap-icons"; // Tambahkan ikon baru

function SellerOrderList({
  orders,
  onShowDetailModal,
  onShowUpdateStatusModal,
  onShowConfirmPaymentModal, // Prop baru
  onShowViewProofsModal, // Prop baru
  getStatusBadgeVariant,
  getAvailableNextStatuses,
}) {
  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <ListGroup className="order-list-group">
      {orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((order) => (
          <ListGroup.Item
            key={order.orderId}
            className="mb-3 shadow-sm rounded border order-list-item"
          >
            <Row className="align-items-center gy-2">
              <Col md={3} sm={12}>
                <strong className="d-block">Order ID:</strong>
                <span
                  className="text-muted order-id-text"
                  title={order.orderId}
                >
                  #{order.orderId.substring(0, 12)}...
                </span>
              </Col>
              <Col md={2} sm={6} xs={6}>
                <strong className="d-block">Tanggal:</strong>
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Col>
              <Col md={2} sm={6} xs={6}>
                <strong className="d-block">Total:</strong>
                Rp {order.totalPrice.toLocaleString("id-ID")}
              </Col>
              <Col md={2} sm={4} xs={6}>
                <strong className="d-block">Pembayaran:</strong>
                <Badge
                  bg={
                    order.paymentDetails?.status === "paid"
                      ? "success"
                      : order.paymentDetails?.method === "ONLINE_PAYMENT" &&
                        order.paymentDetails?.status !== "paid"
                      ? "warning"
                      : "secondary"
                  }
                  className="payment-status-badge"
                >
                  {order.paymentDetails?.method === "PAY_AT_STORE"
                    ? "Bayar di Tempat"
                    : "Online"}
                  {order.paymentDetails?.method === "PAY_AT_STORE" &&
                    order.paymentDetails?.status !== "paid" &&
                    " (Belum Dikonfirmasi)"}
                  {order.paymentDetails?.method === "ONLINE_PAYMENT" &&
                    order.paymentDetails?.status === "paid" &&
                    " (Lunas)"}
                  {order.paymentDetails?.method === "ONLINE_PAYMENT" &&
                    order.paymentDetails?.status !== "paid" &&
                    " (Belum Lunas)"}
                </Badge>
              </Col>
              <Col md={1} sm={4} xs={6}>
                <strong className="d-block">Status:</strong>
                <Badge
                  bg={getStatusBadgeVariant(order.orderStatus)}
                  pill
                  className="px-2 py-1 order-status-badge"
                >
                  {order.orderStatus.replace(/_/g, " ")}
                </Badge>
              </Col>
              <Col
                md={2}
                sm={4}
                xs={12}
                className="text-md-end order-actions d-flex flex-wrap justify-content-md-end justify-content-start gap-1"
              >
                <Button
                  variant="outline-info"
                  size="sm"
                  className="action-button"
                  onClick={() => onShowDetailModal(order.orderId)}
                  title="Lihat Detail Pesanan"
                >
                  <EyeFill />
                </Button>
                {getAvailableNextStatuses(order.orderStatus).length > 0 &&
                  order.orderStatus !== "AWAITING_PAYMENT" && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="action-button"
                      onClick={() => onShowUpdateStatusModal(order)}
                      title="Update Status Pesanan"
                    >
                      <PencilSquare />
                    </Button>
                  )}
                {order.paymentDetails?.method === "PAY_AT_STORE" &&
                  order.paymentDetails?.status !== "paid" &&
                  order.orderStatus !== "CANCELLED" && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="action-button"
                      onClick={() => onShowConfirmPaymentModal(order)}
                      title="Konfirmasi Pembayaran (COD)"
                    >
                      <CardChecklist />
                    </Button>
                  )}
                {(order.paymentDetails?.proofImageURLs?.length > 0 ||
                  order.paymentDetails?.confirmationNotes) && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="action-button"
                    onClick={() => onShowViewProofsModal(order.orderId)}
                    title="Lihat Bukti Pembayaran"
                  >
                    <ImageFill />
                  </Button>
                )}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col xs={12}>
                <small className="text-muted">
                  {order.items?.length || 0} item
                  {order.items?.length !== 1 ? "s" : ""}
                  {order.items && order.items.length > 0 && (
                    <>
                      :{" "}
                      {order.items
                        .map((item) => `${item.quantity}x ${item.name}`)
                        .join(", ")
                        .substring(0, 100)}
                      {order.items
                        .map((item) => `${item.quantity}x ${item.name}`)
                        .join(", ").length > 100 && "..."}
                    </>
                  )}
                </small>
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
    </ListGroup>
  );
}

export default SellerOrderList;
