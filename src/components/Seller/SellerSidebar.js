// src/components/Seller/SellerSidebar.js
import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  Speedometer2,
  ShopWindow as ShopIcon,
  BoxSeam,
  ClipboardCheck,
  InfoCircleFill,
} from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import "../../css/SellerSidebar.css";

function SellerSidebar({ shopName }) {
  const { user: authUser } = useAuth();
  const location = useLocation();

  const isActive = (path, isEnd = false) => {
    if (isEnd) {
      return location.pathname === path;
    }
    return path === "/toko-saya"
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/toko-saya", text: "Dashboard", icon: Speedometer2, exact: true },
    { path: "/toko-saya/info", text: "Info Toko", icon: InfoCircleFill },
    { path: "/toko-saya/produk", text: "Kelola Produk", icon: BoxSeam },
    { path: "/toko-saya/pesanan", text: "Pesanan", icon: ClipboardCheck },
  ];

  return (
    <div className="seller-sidebar-wrapper">
      <div className="seller-sidebar-header text-center py-3 mb-3">
        <div className="shop-icon-wrapper">
          {" "}
          {/* Tambahkan wrapper ini untuk styling ikon */}
          <ShopIcon size={24} /> {/* Sesuaikan ukuran jika perlu */}
        </div>
        <h5 className="mb-0">{shopName || "Toko Saya"}</h5>
        {authUser?.displayName && (
          <small className="text-muted">{authUser.displayName}</small>
        )}
      </div>
      <Nav variant="pills" className="flex-column sidebar-nav">
        {navLinks.map((linkItem) => {
          const IconComponent = linkItem.icon;
          return (
            <Nav.Item key={linkItem.path}>
              <Nav.Link
                as={Link}
                to={linkItem.path}
                end={linkItem.exact}
                className={`sidebar-link ${
                  isActive(linkItem.path, linkItem.exact) ? "active" : ""
                }`}
              >
                <IconComponent size={18} className="me-2" /> {linkItem.text}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </div>
  );
}

SellerSidebar.defaultProps = {
  shopName: "Toko Saya",
};

export default SellerSidebar;
