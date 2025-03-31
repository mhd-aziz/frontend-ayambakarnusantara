/*
 * Component: ManageOrders
 * Deskripsi: Komponen untuk manajemen order di dashboard admin dengan integrasi API
 * Digunakan di: Dashboard.jsx
 *
 * Fitur:
 * - Menampilkan daftar order dari API
 * - Filter order berdasarkan status (pending, proses, ready, delivered)
 * - Mengupdate status order
 * - Melihat detail order
 * - Pagination
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, Alert, Nav } from "react-bootstrap";
import orderService from "../../../../services/orderService"; // Import orderService

// Import komponen-komponen
import OrderTable from "./OrderTable";
import OrderDetailModal from "./OrderDetailModal";
import UpdateStatusModal from "./UpdateStatusModal";
import PaymentDetailModal from "./PaymentDetailModal";

const ManageOrders = () => {
  // State untuk data
  const [orders, setOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStatus, setCurrentStatus] = useState("all");

  // State untuk modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);

  // State untuk modal payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  // Menghapus state paymentLoading yang tidak digunakan

  // State untuk loading
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // State untuk pesan alert
  const [alert, setAlert] = useState({
    show: false,
    variant: "success",
    message: "",
  });

  // Fungsi helper untuk menampilkan alert (dengan useCallback)
  const showAlert = useCallback((variant, message) => {
    setAlert({ show: true, variant, message });

    // Hide alert after 5 seconds
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  // Load orders saat komponen dimount atau ketika status berubah
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let data;

        if (currentStatus === "all") {
          data = await orderService.getAllOrders();
        } else {
          data = await orderService.getOrdersByStatus(currentStatus);
        }

        // Filter by search term if provided
        let filteredData = data;
        if (searchTerm.trim() !== "") {
          const searchLower = searchTerm.toLowerCase();
          filteredData = data.filter(
            (order) =>
              order.id.toString().includes(searchTerm) ||
              order.user?.fullName.toLowerCase().includes(searchLower) ||
              order.user?.email.toLowerCase().includes(searchLower)
          );
        }

        // Manual pagination
        const totalFilteredItems = filteredData.length;
        const calculatedTotalPages = Math.ceil(
          totalFilteredItems / itemsPerPage
        );
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setOrders(paginatedData);
        setTotalItems(totalFilteredItems);
        setTotalPages(calculatedTotalPages);
      } catch (error) {
        console.error("Error fetching orders:", error);
        showAlert("danger", "Gagal memuat data order. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentStatus, currentPage, itemsPerPage, searchTerm, showAlert]);

  // Handler untuk melihat detail order
  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Handler untuk membuka modal update status
  const handleUpdateStatus = (order) => {
    setOrderToUpdate(order);
    setShowUpdateStatusModal(true);
  };

  // Handler untuk submit perubahan status
  const handleStatusSubmit = async (orderId, newStatus) => {
    try {
      setUpdateLoading(true);

      // Panggil API updateOrderStatus
      await orderService.updateOrderStatus(orderId, newStatus);

      showAlert(
        "success",
        `Status order berhasil diubah menjadi "${newStatus}".`
      );

      // Update order in local state - perbaraui payment.statusOrder
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                payment: order.payment
                  ? {
                      ...order.payment,
                      statusOrder: newStatus,
                    }
                  : null,
              }
            : order
        )
      );

      // Close modal
      setShowUpdateStatusModal(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      showAlert("danger", `Gagal mengubah status order. ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handler untuk melihat detail pembayaran
  const handleViewPaymentDetail = async (paymentId) => {
    try {
      const paymentData = await orderService.getPaymentStatus(paymentId);
      setSelectedPayment(paymentData);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      showAlert("danger", "Gagal memuat detail pembayaran. Silakan coba lagi.");
    }
  };

  // Handler untuk perubahan halaman pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler untuk perubahan search term
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handler untuk filter status
  const handleStatusChange = (status) => {
    setCurrentStatus(status);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Fungsi untuk format mata uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <h3 className="mb-4">Manajemen Order</h3>

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

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Daftar Order</h5>
          </div>

          {/* Status filter */}
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link
                active={currentStatus === "all"}
                onClick={() => handleStatusChange("all")}
              >
                Semua Order
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={currentStatus === "pending"}
                onClick={() => handleStatusChange("pending")}
              >
                Pending
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={currentStatus === "proses"}
                onClick={() => handleStatusChange("proses")}
              >
                Proses
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={currentStatus === "ready"}
                onClick={() => handleStatusChange("ready")}
              >
                Ready
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={currentStatus === "delivered"}
                onClick={() => handleStatusChange("delivered")}
              >
                Delivered
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <OrderTable
            orders={orders}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onViewDetail={handleViewOrderDetail}
            onUpdateStatus={handleUpdateStatus}
            onViewPaymentDetail={handleViewPaymentDetail}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </Card.Body>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          order={selectedOrder}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Update Status Modal */}
      {orderToUpdate && (
        <UpdateStatusModal
          show={showUpdateStatusModal}
          onHide={() => setShowUpdateStatusModal(false)}
          order={orderToUpdate}
          onSubmit={handleStatusSubmit}
          loading={updateLoading}
        />
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          paymentData={selectedPayment}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </>
  );
};

export default ManageOrders;
