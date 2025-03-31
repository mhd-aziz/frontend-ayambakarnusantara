/*
 * Component: DashboardOverview
 * Deskripsi: Komponen untuk menampilkan overview/ringkasan dashboard admin
 * Digunakan di: Dashboard.jsx
 *
 * Fitur:
 * - Menampilkan statistik utama (total pendapatan, pesanan, produk, pengguna)
 * - Menampilkan daftar pesanan terbaru
 * - Menampilkan produk terlaris
 * - Loading state
 */

import React from "react";
import { Row, Col, Card, Button, Alert, Badge } from "react-bootstrap";
import {
  FaClipboardList,
  FaShoppingBag,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";

const DashboardOverview = ({ stats }) => {
  return (
    <>
      <h3 className="mb-4">Dashboard</h3>

      {!stats ? (
        <Alert variant="info">Loading dashboard data...</Alert>
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col md={6} xl={3}>
              <Card className="dashboard-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="icon-box bg-primary text-white rounded p-3 me-3">
                    <FaDollarSign size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 text-muted">Total Pendapatan</h6>
                    <h3 className="mt-2 mb-0">
                      Rp {stats.totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} xl={3}>
              <Card className="dashboard-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="icon-box bg-success text-white rounded p-3 me-3">
                    <FaClipboardList size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 text-muted">Total Pesanan</h6>
                    <h3 className="mt-2 mb-0">{stats.totalOrders}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} xl={3}>
              <Card className="dashboard-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="icon-box bg-warning text-white rounded p-3 me-3">
                    <FaShoppingBag size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 text-muted">Total Produk</h6>
                    <h3 className="mt-2 mb-0">{stats.totalProducts}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} xl={3}>
              <Card className="dashboard-card h-100 border-0 shadow-sm">
                <Card.Body className="d-flex align-items-center">
                  <div className="icon-box bg-info text-white rounded p-3 me-3">
                    <FaUsers size={24} />
                  </div>
                  <div>
                    <h6 className="mb-0 text-muted">Total User</h6>
                    <h3 className="mt-2 mb-0">{stats.totalUsers}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={8}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Pesanan Terbaru</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Pelanggan</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customerName}</td>
                            <td>Rp {order.total.toLocaleString()}</td>
                            <td>
                              {order.status === "pending" && (
                                <Badge bg="warning">Pending</Badge>
                              )}
                              {order.status === "processing" && (
                                <Badge bg="info">Processing</Badge>
                              )}
                              {order.status === "completed" && (
                                <Badge bg="success">Completed</Badge>
                              )}
                              {order.status === "cancelled" && (
                                <Badge bg="danger">Cancelled</Badge>
                              )}
                            </td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white text-end">
                  <Button variant="outline-primary" size="sm">
                    Lihat Semua Pesanan
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Produk Terlaris</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-group list-group-flush">
                    {stats.topProducts.map((product) => (
                      <li key={product.id} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0">{product.name}</h6>
                            <small className="text-muted">
                              Rp {product.price.toLocaleString()}
                            </small>
                          </div>
                          <Badge bg="success" pill>
                            {product.soldCount} terjual
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
                <Card.Footer className="bg-white text-end">
                  <Button variant="outline-primary" size="sm">
                    Lihat Semua Produk
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DashboardOverview;
