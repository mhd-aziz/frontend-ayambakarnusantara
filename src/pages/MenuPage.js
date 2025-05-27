// src/pages/MenuPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Pagination,
  Form,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { getProducts } from "../services/MenuService";
import { addItemToCart } from "../services/CartService"; // Import CartService
import { useAuth } from "../context/AuthContext"; // Import useAuth
import "../css/MenuPage.css";

function MenuPage() {
  const [productsData, setProductsData] = useState({
    products: [],
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoadingProductId, setCartLoadingProductId] = useState(null);

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Use the hook here

  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 8,
    category: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProducts(filterParams);
      if (response && response.data) {
        setProductsData({
          products: response.data.products || [],
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalProducts: response.data.totalProducts || 0,
        });
      } else {
        setProductsData({
          products: [],
          currentPage: 1,
          totalPages: 1,
          totalProducts: 0,
        });
        console.warn(
          "Respons API tidak memiliki struktur data yang diharapkan:",
          response
        );
      }
    } catch (err) {
      setError(
        err.message || "Gagal mengambil data produk. Silakan coba lagi nanti."
      );
      console.error("Error fetching products:", err);
      setProductsData({
        products: [],
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (pageNumber) => {
    setFilterParams((prevParams) => ({ ...prevParams, page: pageNumber }));
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterParams((prevParams) => ({
      ...prevParams,
      [name]: value,
      page: 1,
    }));
  };

  const handleSortChange = (event) => {
    const { value } = event.target;
    const [sortBy, order] = value.split("_");
    setFilterParams((prevParams) => ({
      ...prevParams,
      sortBy,
      order,
      page: 1,
    }));
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://via.placeholder.com/400x300.png?text=Ayam+Nusantara`;
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      alert(
        "Anda harus login terlebih dahulu untuk menambahkan item ke keranjang."
      );
      // Use the location object from the hook
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (product.stock === 0) {
      alert("Maaf, stok produk ini habis.");
      return;
    }
    setCartLoadingProductId(product._id);
    try {
      const itemData = {
        productId: product._id,
        quantity: 1,
      };
      const response = await addItemToCart(itemData);
      if (response.status === "success" || response.success === true) {
        alert(response.message || "Produk berhasil ditambahkan ke keranjang!");
      } else {
        alert(response.message || "Gagal menambahkan produk ke keranjang.");
      }
    } catch (err) {
      alert(err.message || "Terjadi kesalahan saat menambahkan ke keranjang.");
    } finally {
      setCartLoadingProductId(null);
    }
  };

  let paginationItems = [];
  if (productsData.totalPages > 1) {
    const maxPagesToShow = 5;
    let startPage = Math.max(
      1,
      productsData.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(
      productsData.totalPages,
      startPage + maxPagesToShow - 1
    );
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    if (startPage > 1) {
      paginationItems.push(
        <Pagination.First
          key="first"
          onClick={() => handlePageChange(1)}
          disabled={productsData.currentPage === 1}
        />
      );
      paginationItems.push(
        <Pagination.Prev
          key="prev"
          onClick={() => handlePageChange(productsData.currentPage - 1)}
          disabled={productsData.currentPage === 1}
        />
      );
      if (startPage > 2) {
        paginationItems.push(
          <Pagination.Ellipsis key="ellipsis-start" disabled />
        );
      }
    }
    for (let number = startPage; number <= endPage; number++) {
      paginationItems.push(
        <Pagination.Item
          key={number}
          active={number === productsData.currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    if (endPage < productsData.totalPages) {
      if (endPage < productsData.totalPages - 1) {
        paginationItems.push(
          <Pagination.Ellipsis key="ellipsis-end" disabled />
        );
      }
      paginationItems.push(
        <Pagination.Next
          key="next"
          onClick={() => handlePageChange(productsData.currentPage + 1)}
          disabled={productsData.currentPage === productsData.totalPages}
        />
      );
      paginationItems.push(
        <Pagination.Last
          key="last"
          onClick={() => handlePageChange(productsData.totalPages)}
          disabled={productsData.currentPage === productsData.totalPages}
        />
      );
    }
  }

  return (
    <Container fluid className="py-4 px-md-4 menu-page-container-fluid">
      <Container>
        <div className="filters-section-wrapper">
          <Row className="align-items-center">
            <Col md={12} lg={5} className="mb-3 mb-lg-0">
              <h1 className="h2 mb-1" style={{ color: "#c0392b" }}>
                Menu Ayam Bakar Nusantara
              </h1>
              <p className="text-muted mb-0">
                Temukan pilihan ayam bakar dan hidangan pelengkap favorit Anda.
              </p>
            </Col>
            <Col md={12} lg={7}>
              <Row className="g-2">
                <Col xs={12} sm={6}>
                  <Form.Group controlId="categoryFilter" className="w-100">
                    <Form.Label className="small visually-hidden">
                      Filter Kategori:
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={filterParams.category}
                      onChange={handleFilterChange}
                      aria-label="Filter berdasarkan kategori"
                      className="form-select-sm"
                    >
                      <option value="">Semua Kategori</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Minuman">Minuman</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group controlId="sortFilter" className="w-100">
                    <Form.Label className="small visually-hidden">
                      Urutkan:
                    </Form.Label>
                    <Form.Select
                      name="sort"
                      value={`${filterParams.sortBy}_${filterParams.order}`}
                      onChange={handleSortChange}
                      aria-label="Urutkan produk"
                      className="form-select-sm"
                    >
                      <option value="createdAt_desc">Terbaru</option>
                      <option value="createdAt_asc">Terlama</option>
                      <option value="price_asc">Harga: Terendah</option>
                      <option value="price_desc">Harga: Tertinggi</option>
                      <option value="name_asc">Nama: A-Z</option>
                      <option value="name_desc">Nama: Z-A</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {isLoading && (
          <div className="text-center py-5 loading-spinner-container">
            <Spinner
              animation="border"
              style={{ width: "3.5rem", height: "3.5rem", color: "#c0392b" }}
            />
            <p className="mt-3 lead" style={{ color: "#c0392b" }}>
              Memuat menu pilihan Anda...
            </p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center lead py-4 shadow-sm">
            <Alert.Heading as="h3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>Oops!
              Terjadi Kesalahan
            </Alert.Heading>
            <p>{error}</p>
            <Button
              variant="outline-danger"
              onClick={fetchProducts}
              className="fw-semibold"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Coba Lagi
            </Button>
          </Alert>
        )}

        {!isLoading && !error && productsData.products.length === 0 && (
          <Alert
            variant="light"
            className="text-center lead py-5 shadow-sm border"
          >
            <Alert.Heading as="h3" className="text-muted">
              <i className="bi bi-egg-fried me-2 fs-1"></i>
            </Alert.Heading>
            <p className="text-muted mb-0">
              Maaf, menu yang Anda cari belum tersedia.
            </p>
            <p className="text-muted">
              Silakan coba filter lain atau kembali lagi nanti.
            </p>
          </Alert>
        )}

        {!isLoading && !error && productsData.products.length > 0 && (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {productsData.products.map((product) => (
                <Col key={product._id} className="d-flex align-items-stretch">
                  <Card className="w-100 product-card">
                    <Card.Img
                      variant="top"
                      src={
                        product.productImageURL ||
                        `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(
                          product.name
                        )}`
                      }
                      onError={handleImageError}
                      alt={product.name}
                    />
                    <Card.Body className="d-flex flex-column p-3">
                      <div className="mb-2">
                        <Badge
                          pill
                          bg="light"
                          text="dark"
                          className="me-2 badge-category"
                        >
                          {product.category}
                        </Badge>
                        {product.stock === 0 && (
                          <Badge pill bg="danger" className="fw-normal">
                            Habis
                          </Badge>
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <Badge
                            pill
                            bg="warning"
                            text="dark"
                            className="fw-normal"
                          >
                            Stok Terbatas
                          </Badge>
                        )}
                      </div>
                      <Card.Title as="h3" className="h6 mb-1">
                        {product.name}
                      </Card.Title>
                      {product.description && (
                        <Card.Text className="description-text mb-2 flex-grow-0">
                          {product.description}
                        </Card.Text>
                      )}
                      <div className="mt-auto pt-2">
                        <p className="price mb-2">
                          Rp {product.price.toLocaleString("id-ID")}
                        </p>
                        <div className="button-group">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="btn-detail"
                            as={Link}
                            to={`/menu/${product._id}`}
                          >
                            <i className="bi bi-eye-fill me-1"></i>Detail
                          </Button>
                          <Button
                            variant={
                              product.stock > 0 ? "primary" : "secondary"
                            }
                            size="sm"
                            className="btn-add-to-cart"
                            disabled={
                              product.stock === 0 ||
                              cartLoadingProductId === product._id
                            }
                            onClick={() => handleAddToCart(product)}
                          >
                            {cartLoadingProductId === product._id ? (
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              <>
                                <i
                                  className={`bi ${
                                    product.stock > 0
                                      ? "bi-cart-plus-fill"
                                      : "bi-slash-circle"
                                  } me-1`}
                                ></i>
                                {product.stock > 0 ? "Keranjang" : "Habis"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {productsData.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>{paginationItems}</Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </Container>
  );
}

export default MenuPage;
