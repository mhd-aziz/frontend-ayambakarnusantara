import React from "react";
import {
  Table,
  Form,
  InputGroup,
  Button,
  Badge,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { FaSearch, FaEye, FaEdit, FaCreditCard } from "react-icons/fa";

const OrderTable = ({
  orders,
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  loading,
  searchTerm,
  onSearchChange,
  onPageChange,
  onViewDetail,
  onUpdateStatus,
  onViewPaymentDetail,
  formatCurrency,
  formatDate,
}) => {
  // Fungsi untuk render badge status
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
        variant = "success";
        break;
      default:
        variant = "secondary";
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  // Fungsi untuk render badge status pembayaran
  const renderPaymentStatusBadge = (status) => {
    let variant;
    switch (status) {
      case "settlement":
        variant = "success"; // Hijau untuk settlement
        break;
      case "pending":
        variant = "warning";
        break;
      case "cancel":
        variant = "danger";
        break;
      case "expire":
        variant = "danger";
        break;
      case "deny":
        variant = "danger";
        break;
      default:
        variant = "secondary";
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
    );

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    );

    return (
      <Pagination className="justify-content-end mt-3">{items}</Pagination>
    );
  };

  // Render table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Memuat data...</p>
          </td>
        </tr>
      );
    }

    if (orders.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4">
            Tidak ada order yang ditemukan.
          </td>
        </tr>
      );
    }

    return orders.map((order) => (
      <tr key={order.id}>
        <td>#{order.id}</td>
        <td>{order.user?.fullName || order.user?.username}</td>
        <td>{formatCurrency(order.totalAmount)}</td>
        <td>
          {order.payment ? (
            renderStatusBadge(order.payment.statusOrder)
          ) : (
            <Badge bg="secondary">Tidak ada</Badge>
          )}
        </td>
        <td>
          {order.payment ? (
            renderPaymentStatusBadge(order.payment.status)
          ) : (
            <Badge bg="danger">Tidak ada</Badge>
          )}
        </td>
        <td>{formatDate(order.createdAt)}</td>
        <td>
          <div className="d-flex">
            <Button
              variant="info"
              size="sm"
              className="me-2"
              onClick={() => onViewDetail(order)}
              title="Lihat Detail"
            >
              <FaEye />
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="me-2"
              onClick={() => onUpdateStatus(order)}
              title="Update Status"
            >
              <FaEdit />
            </Button>
            {order.payment && (
              <Button
                variant="success"
                size="sm"
                onClick={() => onViewPaymentDetail(order.payment.id)}
                title="Detail Pembayaran"
              >
                <FaCreditCard />
              </Button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Cari berdasarkan ID atau nama pelanggan..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>
      </div>

      {/* Orders Table */}
      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Pelanggan</th>
              <th>Total</th>
              <th>Status Order</th>
              <th>Status Pembayaran</th>
              <th>Tanggal Pemesanan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>{renderTableContent()}</tbody>
        </Table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Order count */}
      <div className="text-muted mt-2">
        Menampilkan {orders.length} dari {totalItems} order
      </div>
    </>
  );
};

export default OrderTable;
