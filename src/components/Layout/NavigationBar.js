import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Form,
  InputGroup,
  Button,
  Badge,
} from "react-bootstrap";
import { Search, Cart, PersonCircle, ShopWindow } from "react-bootstrap-icons";
import "../../css/Navbar.css";
import logoImage from "../../assets/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function NavigationBar() {
  const { isLoggedIn, user, logout: contextLogout } = useAuth();
  const { cartItemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const transparentPaths = ["/", "/login", "/register", "/forgot-password"];
    setIsNavbarSolid(!transparentPaths.includes(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const qParam = queryParams.get("q") || "";
    if (qParam !== searchQuery) {
      setSearchQuery(qParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
                <span className="visually-hidden">item di keranjang</span>
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
                  <span className="visually-hidden">item di keranjang</span>
                </Badge>
              )}
            </Nav.Link>
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
