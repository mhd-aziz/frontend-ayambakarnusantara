/*
 * Component: DashboardOverview
 * Deskripsi: Komponen untuk menampilkan overview/ringkasan dashboard admin
 * Digunakan di: AdminDashboardPage.jsx
 *
 * Fitur:
 * - Menampilkan statistik utama (total pendapatan, pesanan, produk, rating toko)
 * - Menampilkan daftar pesanan terbaru
 * - Loading state dengan Spinner
 * - Error handling
 * - Refresh data functionality
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Spinner,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaClipboardList,
  FaShoppingBag,
  FaDollarSign,
  FaSync,
  FaInfoCircle,
} from "react-icons/fa";

// Import service
import {
  getOrderStatistics,
  getAllProducts,
} from "../../../../src/services/dashboardOverviewService";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Format status ke badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "processing":
        return <Badge bg="info">Processing</Badge>;
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Fungsi untuk format tanggal
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Fungsi untuk fetch data dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);

      // Fetch data order dan product
      const [orderData, productData] = await Promise.all([
        getOrderStatistics(),
        getAllProducts(),
      ]);

      const totalProducts = productData?.pagination?.total || 0;

      // Mapping data "recentOrders" agar selaras dengan format tampilan
      const mappedRecentOrders = orderData.recentOrders?.map((order) => {
        // Mapping status
        let displayStatus;
        switch (order.status) {
          case "pending":
            displayStatus = "pending";
            break;
          case "paid":
            displayStatus = "completed";
            break;
          case "cancelled":
            displayStatus = "cancelled";
            break;
          default:
            displayStatus = order.status;
        }

        return {
          id: order.id,
          customerName: order.user?.fullName || "Pelanggan",
          total: order.totalAmount,
          status: displayStatus,
          date: order.createdAt,
        };
      });

      // Bentuk data final
      const finalStats = {
        totalRevenue: orderData.totalRevenue || 0,
        totalOrders: orderData.totalOrders || 0,
        totalProducts: totalProducts || 0,
        recentOrders: mappedRecentOrders || [],
      };

      setStats(finalStats);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Render loading state
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Memuat data dashboard...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="danger" className="d-flex align-items-center">
        <FaInfoCircle className="me-2" size={20} />
        <div className="flex-grow-1">{error}</div>
        <Button variant="outline-danger" size="sm" onClick={handleRefresh}>
          Coba Lagi
        </Button>
      </Alert>
    );
  }

  // Render empty state
  if (!stats) {
    return (
      <Alert variant="info" className="d-flex align-items-center">
        <FaInfoCircle className="me-2" size={20} />
        <div className="flex-grow-1">Data dashboard tidak tersedia</div>
        <Button variant="outline-primary" size="sm" onClick={handleRefresh}>
          Muat Ulang
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Dashboard</h3>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Memperbarui...
            </>
          ) : (
            <>
              <FaSync className="me-1" /> Perbarui Data
            </>
          )}
        </Button>
      </div>

      {/* Cards Statistik Utama */}
      <Row className="g-4 mb-4">
        {/* Total Pendapatan */}
        <Col md={6} xl={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary text-white rounded p-3 me-3">
                <FaDollarSign size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Pendapatan</h6>
                <h3 className="mt-2 mb-0">
                  Rp {stats.totalRevenue.toLocaleString("id-ID")}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Pesanan */}
        <Col md={6} xl={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success text-white rounded p-3 me-3">
                <FaClipboardList size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Pesanan</h6>
                <h3 className="mt-2 mb-0">
                  {stats.totalOrders.toLocaleString("id-ID")}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Produk */}
        <Col md={12} xl={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning text-white rounded p-3 me-3">
                <FaShoppingBag size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Produk</h6>
                <h3 className="mt-2 mb-0">
                  {stats.totalProducts.toLocaleString("id-ID")}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row className="g-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pesanan Terbaru</h5>
              <div>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Menampilkan {stats.recentOrders.length} pesanan terbaru
                    </Tooltip>
                  }
                >
                  <span>
                    <FaInfoCircle className="text-muted" />
                  </span>
                </OverlayTrigger>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pelanggan</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.customerName}</td>
                          <td>Rp {order.total.toLocaleString("id-ID")}</td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td>{formatDate(order.date)}</td>
                          <td>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none"
                            >
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-3">
                          Belum ada pesanan terbaru
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Menampilkan {stats.recentOrders.length} pesanan terbaru
              </small>
              <Button variant="outline-primary" size="sm">
                Lihat Semua Pesanan
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardOverview;
