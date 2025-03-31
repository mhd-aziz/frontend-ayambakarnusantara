import React, { useContext, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Badge,
  Overlay,
  Popover,
} from "react-bootstrap";
import { FaShoppingCart, FaUser, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  
  const location = useLocation();

  // State dan ref untuk dropdown profil
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileIconRef = useRef(null);

  // Cek apakah halaman saat ini adalah homepage
  const isHomePage = location.pathname === "/";

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/");
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      variant="dark"
      className={isHomePage ? "navbar-transparent" : "navbar-dark bg-dark"}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/assets/images/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="Ayam Bakar Nusantara Logo"
          />
          Ayam Bakar Nusantara
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={isHomePage ? "active" : ""}>
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/menu"
              className={location.pathname === "/menu" ? "active" : ""}
            >
              Menu
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/shop"
              className={location.pathname === "/shop" ? "active" : ""}
            >
              Shop
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/order"
              className={location.pathname === "/order" ? "active" : ""}
            >
              Order
            </Nav.Link>
          </Nav>

          <Form className="d-flex mx-lg-4 my-2 my-lg-0 flex-grow-1">
            <FormControl
              type="search"
              placeholder="Cari menu ayam bakar..."
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-warning">
              <FaSearch />
            </Button>
          </Form>

          <Nav>
            <Nav.Link as={Link} to="/cart" className="position-relative me-3">
              <FaShoppingCart size={20} />
              {cartItems && cartItems.length > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {cartItems.length}
                </Badge>
              )}
            </Nav.Link>

            {/* Profile icon with overlay menu */}
            <div className="nav-item">
              <div
                ref={profileIconRef}
                className="nav-link"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => isAuthenticated && setShowProfileMenu(true)}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                  } else {
                    setShowProfileMenu(!showProfileMenu);
                  }
                }}
              >
                <FaUser size={20} />
              </div>

              {isAuthenticated && (
                <Overlay
                  show={showProfileMenu}
                  target={profileIconRef.current}
                  placement="bottom"
                  container={profileIconRef.current}
                  containerPadding={20}
                >
                  <Popover
                    id="profile-popover"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <Popover.Header as="h3" className="bg-dark text-white">
                      {user?.username || "Profile"}
                    </Popover.Header>
                    <Popover.Body className="p-0">
                      <div className="list-group list-group-flush">
                        <Link
                          to="/profile"
                          className="list-group-item list-group-item-action"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <FaUser className="me-2" /> Profile
                        </Link>
                        <Button
                          variant="danger"
                          className="list-group-item list-group-item-action"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="me-2" /> Logout
                        </Button>
                      </div>
                    </Popover.Body>
                  </Popover>
                </Overlay>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
