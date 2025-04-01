import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  InputGroup,
  FormControl,
  Pagination,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  FaSearch,
  FaShoppingCart,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaCheck,
  FaFilter,
} from "react-icons/fa";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import "../../assets/styles/menu.css";

const MenuPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart: contextAddToCart } = useContext(CartContext);

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});

  // Pagination and search states
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // 12 items per page for better grid layout
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // UI states
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [addedToCart, setAddedToCart] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await apiService.getProducts({
          page,
          limit,
          search: searchTerm,
          sortBy: sortBy,
          category: activeCategory !== "all" ? activeCategory : undefined,
        });

        setProducts(data.products || []);

        // Set total pages from API response if available
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
        } else {
          // Fallback calculation
          const totalProducts = data.total || data.products.length;
          setTotalPages(Math.ceil(totalProducts / limit) || 1);
        }

        // Extract unique categories
        if (data.products && data.products.length > 0) {
          const uniqueCategories = [
            ...new Set(data.products.map((p) => p.category || "Uncategorized")),
          ];
          setCategories(uniqueCategories);
        }

        // Fetch ratings for each product
        for (const product of data.products) {
          const productRatings = await apiService.getProductRatings(product.id);
          setRatings((prevRatings) => ({
            ...prevRatings,
            [product.id]: productRatings.statistics.averageRating,
          }));
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          "Terjadi kesalahan saat mengambil data menu. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, searchTerm, sortBy, activeCategory, isAuthenticated]);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAddingToCart(product.id);

    try {
      await apiService.addToCart(product.id, 1);
      contextAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        photoProduct: product.photoProduct,
        quantity: 1,
        shop: product.shop,
      });

      setToastVariant("success");
      setToastMessage(`${product.name} berhasil ditambahkan ke keranjang!`);
      setShowToast(true);

      setAddedToCart(product.id);
      setTimeout(() => {
        setAddedToCart(null);
      }, 1500);
    } catch (err) {
      setToastVariant("danger");
      setToastMessage("Gagal menambahkan ke keranjang. Silakan coba lagi.");
      setShowToast(true);
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Function to render star rating for a product
  const renderStars = (productId) => {
    const rating = ratings[productId] || 0;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
    }

    return (
      <div className="d-flex align-items-center mb-2">
        {stars}
        <small className="ms-1 text-muted">({rating.toFixed(1)})</small>
      </div>
    );
  };

  // Render Toast notification component
  const renderToastNotification = () => (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
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
            {toastVariant === "success" ? "Berhasil!" : "Gagal!"}
          </strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
  );

  // Render search and filter UI
  const renderSearchAndFilters = () => (
    <div className="search-filter-container mb-4">
      <form onSubmit={handleSearch} className="mb-3">
        <InputGroup>
          <FormControl
            placeholder="Cari menu berdasarkan nama atau toko..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <Button variant="warning" type="submit" className="search-button">
            <FaSearch /> <span className="d-none d-sm-inline">Cari</span>
          </Button>
          <Button
            variant="primary"
            className="filter-toggle-button ms-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> <span className="d-none d-sm-inline">Filter</span>
          </Button>
        </InputGroup>
      </form>

      {showFilters && (
        <div className="filter-section px-3 py-3 mb-3 border rounded bg-light shadow-sm">
          <Row>
            <Col xs={12} md={6} className="mb-2 mb-md-0">
              <label className="me-2">Urutkan:</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="name">Nama (A-Z)</option>
                <option value="nameDesc">Nama (Z-A)</option>
                <option value="priceAsc">Harga Terendah</option>
                <option value="priceDesc">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="newest">Terbaru</option>
              </select>
            </Col>
            <Col xs={12} md={6}>
              <label className="me-2">Kategori:</label>
              <div className="category-filter d-flex flex-wrap">
                <Button
                  variant={
                    activeCategory === "all" ? "warning" : "outline-warning"
                  }
                  className="category-button me-1 mb-1"
                  onClick={() => setActiveCategory("all")}
                >
                  Semua
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      activeCategory === category
                        ? "warning"
                        : "outline-warning"
                    }
                    className="category-button me-1 mb-1"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, page - halfMaxPages);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      />
    );

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
      }
    }

    // Page numbers
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      items.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      />
    );

    return (
      <Pagination className="justify-content-center mt-4 mb-5">
        {items}
      </Pagination>
    );
  };

  // Render product card
  const renderProductCard = (product) => (
    <Col key={product.id} sm={6} md={6} lg={4} xl={3} className="mb-4">
      <Card
        className={`h-100 product-card shadow-sm border-0 rounded-3 hover-effect ${
          addedToCart === product.id ? "added-animation" : ""
        }`}
      >
        <div className="product-image-container position-relative">
          <Card.Img
            variant="top"
            src={product.photoProduct}
            alt={product.name}
            className="product-image rounded-top"
            style={{ height: "180px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x180?text=No+Image";
            }}
          />
          {product.category && (
            <Badge
              bg="warning"
              text="dark"
              className="category-badge position-absolute top-0 start-0 m-2 rounded-pill"
            >
              {product.category}
            </Badge>
          )}
        </div>

        <Card.Body className="d-flex flex-column p-3">
          <Card.Title className="product-title fs-5 fw-bold text-truncate">
            {product.name}
          </Card.Title>

          <div className="mb-2 shop-info d-flex align-items-center">
            <div className="shop-img-container me-2">
              <img
                src={product.shop?.photoShop}
                alt={product.shop?.name}
                className="shop-image rounded-circle"
                width="24"
                height="24"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/24x24?text=S";
                }}
              />
            </div>
            <span className="shop-name text-truncate text-muted small">
              {product.shop?.name || "Toko tidak diketahui"}
            </span>
          </div>

          {/* Display star rating */}
          {renderStars(product.id)}

          <Card.Text className="product-description mb-3 small text-muted">
            {product.description
              ? product.description.length > 60
                ? `${product.description.substring(0, 60)}...`
                : product.description
              : "Ayam bakar dengan cita rasa istimewa"}
          </Card.Text>

          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="product-price fs-5 fw-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <Badge
                bg={
                  product.stock > 10
                    ? "success"
                    : product.stock > 0
                    ? "warning"
                    : "danger"
                }
                text={product.stock > 0 ? "dark" : "white"}
                className="stock-badge rounded-pill px-2 py-1"
              >
                {product.stock > 10
                  ? "Tersedia"
                  : product.stock > 0
                  ? `Sisa ${product.stock}`
                  : "Stok Habis"}
              </Badge>
            </div>

            <div className="d-grid gap-2">
              <Button
                variant={addedToCart === product.id ? "success" : "warning"}
                className="add-to-cart-btn rounded-pill"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0 || addingToCart === product.id}
              >
                {addingToCart === product.id ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Menambahkan...
                  </>
                ) : addedToCart === product.id ? (
                  <>
                    <FaCheck className="me-1" />
                    Ditambahkan
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="me-1" />
                    {product.stock <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                  </>
                )}
              </Button>

              <Link
                to={`/product/${product.id}`}
                className="btn btn-outline-primary detail-btn rounded-pill"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-5 empty-state">
      <div className="empty-icon mb-3">
        <span className="display-1 text-muted">🍽️</span>
      </div>
      <h3>Tidak ada menu yang ditemukan</h3>
      <p className="text-muted">
        {searchTerm
          ? `Tidak ada hasil untuk pencarian "${searchTerm}"`
          : activeCategory !== "all"
          ? `Tidak ada menu dalam kategori "${activeCategory}"`
          : "Belum ada menu yang tersedia"}
      </p>
      {(searchTerm || activeCategory !== "all") && (
        <Button
          variant="outline-warning"
          className="rounded-pill px-4"
          onClick={() => {
            setSearchTerm("");
            setSearchInput("");
            setActiveCategory("all");
          }}
        >
          Lihat Semua Menu
        </Button>
      )}
    </div>
  );

  return (
    <Container fluid="lg" className="py-5 mt-4">
      {/* Toast notification */}
      {renderToastNotification()}

      <div className="menu-header mb-4 text-center">
        <h1 className="menu-title display-5 fw-bold">
          Menu Ayam Bakar Nusantara
        </h1>
        <p className="menu-subtitle text-muted">
          Kelezatan autentik dengan bumbu rempah pilihan
        </p>
      </div>

      {/* Search Bar and Filters */}
      {renderSearchAndFilters()}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-container">
            <Spinner animation="border" variant="warning" />
          </div>
          <p className="mt-2 text-muted">Memuat menu lezat untuk Anda...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger shadow-sm rounded-3">{error}</div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && renderEmptyState()}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <p className="results-count mb-0">
              Menampilkan{" "}
              <span className="text-primary fw-bold">{products.length}</span>{" "}
              menu
              {activeCategory !== "all" &&
                ` dalam kategori "${activeCategory}"`}
              {searchTerm && ` untuk pencarian "${searchTerm}"`}
            </p>

            <div className="quick-sort-mobile d-md-none mt-2 w-100">
              <select
                className="form-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="" disabled>
                  Urutkan berdasarkan
                </option>
                <option value="name">Nama (A-Z)</option>
                <option value="nameDesc">Nama (Z-A)</option>
                <option value="priceAsc">Harga Terendah</option>
                <option value="priceDesc">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="newest">Terbaru</option>
              </select>
            </div>
          </div>

          <Row className="product-grid">
            {products.map((product) => renderProductCard(product))}
          </Row>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default MenuPage;
