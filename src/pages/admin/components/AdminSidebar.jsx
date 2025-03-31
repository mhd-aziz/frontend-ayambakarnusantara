/*
 * Component: AdminSidebar
 * Deskripsi: Komponen sidebar navigasi untuk dashboard admin
 * Digunakan di: Dashboard.jsx
 *
 * Perubahan:
 * - Ditambahkan menu "Manage Shop" sebelum "Manage Products"
 */

import React from "react";
import { Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStore,
  FaShoppingBag,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import { adminLogout } from "../../../services/adminService";

const AdminSidebar = ({ activeKey, onSelect }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-sidebar bg-dark text-white">
      <div className="sidebar-header p-3 border-bottom border-secondary">
        <h5 className="mb-0 d-flex align-items-center">
          <FaStore className="me-2" /> Ayam Bakar Admin
        </h5>
      </div>
      <Nav
        className="flex-column py-3"
        activeKey={activeKey}
        onSelect={onSelect}
      >
        <Nav.Link eventKey="dashboard" className="sidebar-link">
          <FaHome className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link eventKey="shop" className="sidebar-link">
          <FaStore className="me-2" /> Manage Shop
        </Nav.Link>
        <Nav.Link eventKey="products" className="sidebar-link">
          <FaShoppingBag className="me-2" /> Manage Products
        </Nav.Link>
        <Nav.Link eventKey="orders" className="sidebar-link">
          <FaClipboardList className="me-2" /> Manage Orders
        </Nav.Link>
        <Nav.Link eventKey="users" className="sidebar-link">
          <FaUsers className="me-2" /> Manage Users
        </Nav.Link>
        <Nav.Link eventKey="profile" className="sidebar-link">
          <FaUser className="me-2" /> Profile
        </Nav.Link>
        <Button
          variant="outline-danger"
          className="mt-3 mx-3"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Button>
      </Nav>
    </div>
  );
};

export default AdminSidebar;
