import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Image,
  InputGroup,
  Form,
  Spinner,
  Alert,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaArrowLeft,
  FaShoppingCart,
  FaCreditCard,
  FaStore,
  FaSync,
} from "react-icons/fa";
import apiService from "../../services/api";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/cart.css";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // State for checkout process
  const [checkingOut, setCheckingOut] = useState(false);

  // State for Midtrans client key
  const [clientKey, setClientKey] = useState("");

  // Fetch cart data from the API
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart();

      // Log the response for debugging
      console.log("Cart API response:", response);

      // Handle the correct structure from your API
      if (response.allItems && Array.isArray(response.allItems)) {
        setCartItems(response.allItems);
      } else {
        console.error("Unexpected cart response structure:", response);
        setCartItems([]);
        setError(
          "Format data keranjang tidak sesuai. Silakan hubungi administrator."
        );
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Gagal memuat keranjang belanja. Silakan coba lagi.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [isAuthenticated, navigate]);

  // Fetch Midtrans client key and load Snap.js
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const response = await apiService.getClientKey();
        const key = response.clientKey;
        setClientKey(key);

        // Load Midtrans Snap.js after getting client key
        if (key) {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", key);
          script.setAttribute("id", "midtrans-script");
          document.body.appendChild(script);
        }
      } catch (error) {
        console.error("Failed to fetch Midtrans client key:", error);
        setError("Gagal memuat konfigurasi pembayaran. Silakan coba lagi.");
      }
    };

    fetchClientKey();

    return () => {
      // Clean up when component unmounts
      const script = document.getElementById("midtrans-script");
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Custom function to update cart item quantity
  // This correctly uses the API_URL/api/user/cart/update endpoint
  const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.put(
        `${API_URL}/api/user/cart/update`,
        { cartItemId, quantity },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  };

  // Handle quantity update
  const handleQuantityChange = async (id, currentQty, newQty) => {
    if (newQty < 1 || newQty > 99) return;
    if (newQty === currentQty) return;

    // Track which item is being updated
    setUpdating(id);

    try {
      console.log(`Attempting to update cart item ${id} to quantity ${newQty}`);

      // Temporarily update the UI for immediate feedback
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );

      // Use our custom function that calls the correct endpoint
      await updateCartItemQuantity(id, newQty);

      // Show success message
      setToastVariant("success");
      setToastMessage("Jumlah berhasil diperbarui");
      setShowToast(true);

      // Refresh cart to ensure data consistency
      fetchCart();
    } catch (err) {
      console.error("Error updating cart item:", err);

      // Revert the UI back to the original quantity
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: currentQty } : item
        )
      );

      // Show error message
      setToastVariant("danger");
      setToastMessage("Gagal mengubah jumlah item. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  // Handle remove item - special case: set quantity to 0
  const handleRemoveItem = async (id) => {
    setRemovingItem(id);
    try {
      // We'll use our custom function but with quantity 0 to remove the item
      await updateCartItemQuantity(id, 0);

      // Update local state
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

      // Show success message
      setToastVariant("success");
      setToastMessage("Item berhasil dihapus dari keranjang");
      setShowToast(true);
    } catch (err) {
      console.error("Error removing cart item:", err);

      // Show error message
      setToastVariant("danger");
      setToastMessage("Gagal menghapus item. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      setRemovingItem(null);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      setUpdating(true);
      try {
        // Use apiService to clear cart
        await apiService.clearCart();
        setCartItems([]);

        // Show success message
        setToastVariant("success");
        setToastMessage("Keranjang berhasil dikosongkan");
        setShowToast(true);
      } catch (err) {
        console.error("Error clearing cart:", err);

        // Show error message
        setToastVariant("danger");
        setToastMessage("Gagal mengosongkan keranjang. Silakan coba lagi.");
        setShowToast(true);
      } finally {
        setUpdating(false);
      }
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setToastVariant("warning");
      setToastMessage("Keranjang belanja Anda kosong");
      setShowToast(true);
      return;
    }

    setCheckingOut(true);

    try {
      // Membuat order yang juga menghasilkan data pembayaran
      const response = await apiService.createOrder();
      console.log("Order created:", response);

      // Ekstrak orderId dan snapToken dari struktur respons
      const orderId = response.order?.id;
      const snapToken = response.payment?.snapToken;

      if (!orderId) {
        throw new Error("ID Pesanan tidak ditemukan dalam respons");
      }

      if (!snapToken) {
        throw new Error("Token pembayaran tidak ditemukan dalam respons");
      }

      // Simpan ID order di localStorage
      localStorage.setItem("currentOrderId", orderId.toString());

      // Show success message
      setToastVariant("success");
      setToastMessage("Siap melakukan pembayaran!");
      setShowToast(true);

      // 3. Membuka Snap popup untuk pembayaran
      if (window.snap && clientKey) {
        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            console.log("Payment success:", result);
            // Arahkan ke halaman sukses
            navigate(`/order/${orderId}`, {
              state: {
                orderId: orderId.toString(),
                paymentStatus: "success",
              },
            });
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            // Arahkan ke halaman order dengan status pending
            navigate(`/order/${orderId}`, {
              state: {
                orderId: orderId.toString(),
                paymentStatus: "pending",
              },
            });
          },
          onError: function (result) {
            console.log("Payment error:", result);
            setToastVariant("danger");
            setToastMessage("Pembayaran gagal. Silakan coba lagi.");
            setShowToast(true);
            setCheckingOut(false);
          },
          onClose: function () {
            console.log("Customer closed the payment popup");
            setToastVariant("warning");
            setToastMessage("Pembayaran dibatalkan.");
            setShowToast(true);
            setCheckingOut(false);
          },
        });
      } else {
        if (!clientKey) {
          throw new Error(
            "Client key Midtrans tidak ditemukan. Silakan refresh halaman."
          );
        } else {
          throw new Error(
            "Snap.js tidak terdeteksi. Pastikan tidak ada adblocker yang aktif."
          );
        }
      }
    } catch (err) {
      console.error("Error during checkout process:", err);

      // Show error message
      setToastVariant("danger");
      setToastMessage(
        err.message || "Gagal memproses pembayaran. Silakan coba lagi."
      );
      setShowToast(true);

      setCheckingOut(false);
    }
  };

  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // Calculate tax (10%)
  const tax = subtotal * 0.1;

  // Calculate total
  const total = subtotal + tax;

  return (
    <Container className="py-5 mt-5 cart-container">
      {/* Toast notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
          text={toastVariant === "light" ? "dark" : "white"}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toastVariant === "success"
                ? "Berhasil!"
                : toastVariant === "warning"
                ? "Perhatian!"
                : "Gagal!"}
            </strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="cart-title">
          <FaShoppingCart className="me-2" />
          Keranjang Belanja
        </h1>

        <Button
          variant="outline-secondary"
          className="refresh-btn"
          onClick={fetchCart}
          disabled={loading}
        >
          <FaSync className={loading ? "spinning" : ""} />
          <span className="ms-2 d-none d-md-inline">Refresh</span>
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Memuat keranjang belanja...</p>
        </div>
      )}

      {/* Empty cart */}
      {!loading && cartItems.length === 0 && (
        <div className="empty-cart text-center py-5">
          <div className="empty-cart-icon mb-4">
            <FaShoppingCart size={60} />
          </div>
          <h3>Keranjang Belanja Anda Kosong</h3>
          <p className="text-muted mb-4">
            Anda belum menambahkan menu apapun ke keranjang belanja.
          </p>
          <Link to="/menu" className="btn btn-warning btn-lg">
            <FaStore className="me-2" />
            Jelajahi Menu
          </Link>
        </div>
      )}

      {/* Cart with items */}
      {!loading && cartItems.length > 0 && (
        <Row>
          {/* Cart Items */}
          <Col lg={8} className="mb-4">
            <Card className="cart-items-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Item dalam Keranjang ({cartItems.length})
                </h5>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={updating}
                >
                  Kosongkan Keranjang
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="cart-table mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Produk</th>
                        <th style={{ width: "20%" }}>Harga</th>
                        <th style={{ width: "20%" }}>Jumlah</th>
                        <th style={{ width: "15%" }}>Subtotal</th>
                        <th style={{ width: "5%" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr
                          key={item.id}
                          className={
                            removingItem === item.id ? "removing-item" : ""
                          }
                        >
                          <td className="product-info">
                            <div className="d-flex align-items-center">
                              <Image
                                src={item.product?.photoProduct}
                                alt={item.product?.name}
                                className="cart-item-image me-3"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/80x80?text=No+Image";
                                }}
                              />
                              <div>
                                <h6 className="mb-1">{item.product?.name}</h6>
                                <small className="text-muted">
                                  {item.product?.shop?.name}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{formatPrice(item.product?.price)}</td>
                          <td>
                            <InputGroup size="sm" className="quantity-control">
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    item.quantity - 1
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  updating === item.id ||
                                  removingItem === item.id
                                }
                              >
                                -
                              </Button>
                              <Form.Control
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity,
                                      val
                                    );
                                  }
                                }}
                                className="text-center"
                                disabled={
                                  updating === item.id ||
                                  removingItem === item.id
                                }
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  updating === item.id ||
                                  removingItem === item.id
                                }
                              >
                                +
                              </Button>
                            </InputGroup>
                            {updating === item.id && (
                              <div className="text-center mt-1">
                                <Spinner animation="border" size="sm" />
                              </div>
                            )}
                          </td>
                          <td className="fw-bold">
                            {formatPrice(item.product?.price * item.quantity)}
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="remove-item-btn"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={
                                removingItem === item.id || updating === item.id
                              }
                            >
                              {removingItem === item.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <FaTrash />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <Button
                  variant="outline-primary"
                  className="continue-shopping-btn"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="me-2" />
                  Lanjutkan Belanja
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="order-summary-card">
              <Card.Header>
                <h5 className="mb-0">Ringkasan Pesanan</h5>
              </Card.Header>
              <Card.Body>
                <div className="summary-item d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-item d-flex justify-content-between mb-2">
                  <span>Pajak (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <hr />
                <div className="summary-item d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span className="total-price">{formatPrice(total)}</span>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  className="checkout-btn w-100"
                  disabled={updating || cartItems.length === 0 || checkingOut}
                  onClick={handleCheckout}
                >
                  {checkingOut ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="me-2" />
                      Lanjutkan ke Pembayaran
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;
