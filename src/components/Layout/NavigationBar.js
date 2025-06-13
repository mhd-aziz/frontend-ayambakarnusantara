import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Form,
  InputGroup,
  Button,
  Badge,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import {
  Search,
  Cart,
  PersonCircle,
  ShopWindow,
  Bell,
  BellFill,
} from "react-bootstrap-icons";
import "../../css/Navbar.css";
import logoImage from "../../assets/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../services/NotificationService";

function NotificationItem({ notification, onNotificationClick }) {
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return Math.floor(seconds) + " detik lalu";
  };

  return (
    <Dropdown.Item
      as="div"
      onClick={() => onNotificationClick(notification)}
      className={!notification.isRead ? "notification-unread" : ""}
    >
      <div className="d-flex w-100 justify-content-between">
        <h6 className="mb-1">{notification.title}</h6>
        <small>{timeSince(notification.createdAt)}</small>
      </div>
      <p className="mb-1 small">{notification.body}</p>
    </Dropdown.Item>
  );
}

function NavigationBar() {
  const { isLoggedIn, user, logout: contextLogout } = useAuth();
  const { cartItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingNotif(true);
    try {
      const response = await getMyNotifications();
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setIsLoadingNotif(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    const { notificationId, data } = notification;

    if (data?.orderId) {
      navigate(`/pesanan/${data.orderId}`);
    } else if (data?.conversationId) {
      navigate(`/chat?conversationId=${data.conversationId}`);
    }

    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notificationId);
        fetchNotifications();
      } catch (error) {
        console.error("Gagal menandai notifikasi:", error);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isSolid = window.scrollY > window.innerHeight;
      const isHomePage = location.pathname === "/";

      if (isHomePage) {
        setIsNavbarSolid(isSolid);
      } else {
        setIsNavbarSolid(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const qParam = queryParams.get("q") || "";
    if (qParam !== searchQuery) {
      setSearchQuery(qParam);
    }
  }, [location.search, searchQuery]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const queryParams = new URLSearchParams(location.search);
    const qParam = queryParams.get("q") || "";

    if (trimmedQuery === qParam) {
      return;
    }

    const handler = setTimeout(() => {
      if (trimmedQuery) {
        navigate(`/menu?q=${encodeURIComponent(trimmedQuery)}`);
      } else {
        if (location.pathname === "/menu") {
          navigate("/menu");
        }
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, navigate, location.pathname, location.search]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Anda yakin ingin logout?");
    if (confirmLogout) {
      contextLogout();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    const queryParams = new URLSearchParams(location.search);
    if (trimmedQuery !== (queryParams.get("q") || "")) {
      navigate(`/menu?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <Navbar
      ref={navRef}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      expand="xl"
      sticky="top"
      className={`main-navbar ${
        isNavbarSolid ? "navbar-solid" : "navbar-transparent-effect"
      }`}
    >
      <Container className="align-items-center navbar-content-wrapper d-flex justify-content-between justify-content-xl-start">
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="navbar-toggler-mobile"
        />
        <Navbar.Brand
          as={Link}
          to="/"
          className="navbar-brand-desktop d-none d-xl-flex align-items-center"
        >
          <img
            src={logoImage}
            width="40"
            height="40"
            className="d-inline-block align-top me-2"
            alt="Ayam Bakar Nusantara Logo"
          />
          <span className="navbar-brand-text">Ayam Bakar Nusantara</span>
        </Navbar.Brand>

        <div className="mobile-icons-group d-flex align-items-center d-xl-none">
          {isLoggedIn && (
            <Nav.Link
              as={Link}
              to="/toko-saya"
              className="nav-link-icon-mobile p-1 me-1"
              title="Toko Saya"
            >
              <ShopWindow size={22} />
            </Nav.Link>
          )}
          <Nav.Link
            as={Link}
            to="/keranjang"
            className="nav-link-icon-mobile p-1 me-1 position-relative"
            title="Keranjang"
          >
            <Cart size={22} />
            {isLoggedIn && cartItemCount > 0 && (
              <Badge
                pill
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle-x"
                style={{ fontSize: "0.6em", padding: "0.3em 0.5em" }}
              >
                {cartItemCount}
              </Badge>
            )}
          </Nav.Link>
          {isLoggedIn ? (
            <Nav.Link
              as={Link}
              to="/profile"
              className="nav-link-icon-mobile p-1"
              title={user ? user.displayName || user.email : "Profil"}
            >
              <PersonCircle size={22} />
            </Nav.Link>
          ) : (
            <Nav.Link
              as={Link}
              to="/login"
              className="nav-link-icon-mobile p-1"
              title="Login/Register"
            >
              <PersonCircle size={22} />
            </Nav.Link>
          )}
        </div>

        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-xl-end"
        >
          <Nav className="nav-links-desktop ms-xl-4 me-xl-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              Beranda
            </Nav.Link>
            <Nav.Link as={Link} to="/menu" className="nav-link-custom">
              Menu
            </Nav.Link>
            <Nav.Link as={Link} to="/toko" className="nav-link-custom">
              Toko
            </Nav.Link>
            {isLoggedIn && (
              <Nav.Link as={Link} to="/pesanan" className="nav-link-custom">
                Pesanan
              </Nav.Link>
            )}
          </Nav>

          <Form
            className="search-form-desktop d-flex"
            onSubmit={handleSearchSubmit}
          >
            <InputGroup className="search-input-group-custom">
              <Form.Control
                type="search"
                placeholder="Cari ayam kesukaanmu..."
                aria-label="Search"
                className="search-bar-custom"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="light"
                className="search-icon-button-custom"
                aria-label="Submit Search"
              >
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>

          <Nav className="nav-actions-desktop align-items-center">
            {isLoggedIn && (
              <Nav.Link
                as={Link}
                to="/toko-saya"
                className="nav-link-icon-custom d-none d-xl-flex me-2"
                title="Toko Saya"
              >
                <ShopWindow size={24} />
              </Nav.Link>
            )}
            <Nav.Link
              as={Link}
              to="/keranjang"
              className="nav-link-icon-custom d-none d-xl-flex me-2 position-relative"
              title="Keranjang"
            >
              <Cart size={24} />
              {isLoggedIn && cartItemCount > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="position-absolute top-0 start-100 translate-middle-y"
                  style={{
                    fontSize: "0.65em",
                    padding: "0.35em 0.6em",
                    marginLeft: "-5px",
                  }}
                >
                  {cartItemCount}
                </Badge>
              )}
            </Nav.Link>

            {isLoggedIn && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  as={Nav.Link}
                  className="nav-link-icon-custom d-none d-xl-flex me-2"
                  id="notification-dropdown"
                >
                  <div className="position-relative">
                    {unreadCount > 0 ? (
                      <BellFill size={24} />
                    ) : (
                      <Bell size={24} />
                    )}
                    {unreadCount > 0 && (
                      <Badge
                        pill
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: "0.6em", padding: "0.3em 0.5em" }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="notification-dropdown-menu"
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    minWidth: "350px",
                  }}
                >
                  <Dropdown.Header>Notifikasi</Dropdown.Header>
                  <Dropdown.Divider />
                  {isLoadingNotif ? (
                    <div className="text-center p-2">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications
                      .slice(0, 7)
                      .map((notif) => (
                        <NotificationItem
                          key={notif.notificationId}
                          notification={notif}
                          onNotificationClick={handleNotificationClick}
                        />
                      ))
                  ) : (
                    <Dropdown.ItemText>
                      Tidak ada notifikasi baru.
                    </Dropdown.ItemText>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item
                    as={Link}
                    to="/notifikasi"
                    className="text-center small"
                  >
                    Lihat Semua Notifikasi
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {isLoggedIn ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/profile"
                  className="nav-link-icon-custom d-none d-xl-flex me-2"
                  title={user ? user.displayName || user.email : "Profil"}
                >
                  <PersonCircle size={24} />
                </Nav.Link>
                <Button
                  variant="outline-custom"
                  onClick={handleLogout}
                  size="sm"
                  className="logout-button-custom d-none d-xl-block"
                >
                  Logout
                </Button>
                <Button
                  variant="danger"
                  onClick={handleLogout}
                  size="sm"
                  className="w-100 mt-2 d-xl-none logout-button-mobile-dropdown"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="nav-link-custom login-link-custom d-none d-xl-block"
                >
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary-custom"
                  size="sm"
                  className="register-button-custom d-none d-xl-block"
                >
                  Register
                </Button>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="btn btn-outline-light btn-sm w-100 mb-2 mt-2 d-xl-none"
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="btn btn-light btn-sm w-100 d-xl-none"
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
