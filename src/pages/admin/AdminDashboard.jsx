/*
 * Component: AdminDashboardPage
 * Deskripsi: Komponen utama untuk dashboard admin
 *
 * Perubahan:
 * - Ditambahkan import untuk ManageShop
 * - Ditambahkan case untuk shop di renderContent
 */

import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "../../assets/styles/AdminDashboard.css";

// Import komponen-komponen dashboard
import AdminSidebar from "./components/AdminSidebar";
import DashboardOverview from "./components/DashboardOverview";
import ManageShop from "./components/shop/ManageShop";
import ManageProducts from "./components/products/ManageProducts";
import ManageOrders from "./components/orders/ManageOrders";
import ManageUsers from "./components/users/ManageUsers";
import AdminProfile from "./components/profile/AdminProfile";

const AdminDashboardPage = () => {
  const [activeContent, setActiveContent] = useState("dashboard");
  const [stats, setStats] = useState(null);

  // Dummy stats data - In a real app, this would come from API
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // In a real app, we would call the API
        // const response = await getDashboardStats();
        // setStats(response);

        // Dummy data for demonstration
        const dummyStats = {
          totalRevenue: 15750000,
          totalOrders: 128,
          totalProducts: 45,
          totalUsers: 327,
          recentOrders: [
            {
              id: 1024,
              customerName: "Budi Santoso",
              total: 150000,
              status: "completed",
              date: "2025-03-26T08:30:00Z",
            },
            {
              id: 1023,
              customerName: "Dewi Putri",
              total: 245000,
              status: "processing",
              date: "2025-03-26T07:45:00Z",
            },
            {
              id: 1022,
              customerName: "Ahmad Rahman",
              total: 180000,
              status: "pending",
              date: "2025-03-25T15:20:00Z",
            },
            {
              id: 1021,
              customerName: "Siti Nurhayati",
              total: 320000,
              status: "completed",
              date: "2025-03-25T12:10:00Z",
            },
            {
              id: 1020,
              customerName: "Rudi Hermawan",
              total: 95000,
              status: "cancelled",
              date: "2025-03-25T09:30:00Z",
            },
          ],
          topProducts: [
            { id: 1, name: "Ayam Bakar Kecap", price: 35000, soldCount: 450 },
            {
              id: 2,
              name: "Ayam Bakar Taliwang",
              price: 40000,
              soldCount: 385,
            },
            { id: 3, name: "Ayam Bakar Padang", price: 38000, soldCount: 320 },
            { id: 4, name: "Ayam Bakar Madu", price: 37000, soldCount: 275 },
          ],
        };

        setStats(dummyStats);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      }
    };

    loadDashboardStats();
  }, []);

  // Render content based on active selection
  const renderContent = () => {
    switch (activeContent) {
      case "dashboard":
        return <DashboardOverview stats={stats} />;
      case "shop":
        return <ManageShop />;
      case "products":
        return <ManageProducts />;
      case "orders":
        return <ManageOrders />;
      case "users":
        return <ManageUsers />;
      case "profile":
        return <AdminProfile />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <div className="admin-dashboard d-flex">
      <AdminSidebar
        activeKey={activeContent}
        onSelect={(k) => setActiveContent(k)}
      />
      <div className="admin-content flex-grow-1 p-4">
        <Container fluid>{renderContent()}</Container>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
