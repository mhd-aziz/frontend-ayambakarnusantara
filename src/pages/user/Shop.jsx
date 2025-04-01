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
  FaStore,
  FaShoppingBag,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaMapMarkerAlt,
  FaFilter,
} from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import apiService from "../../services/api";
import "../../assets/styles/shop.css";

const ShopPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // State for shops and loading
  const [shops, setShops] = useState([]);
  const [shopRatings, setShopRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and search states
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Increased from 10 to 12 for better grid layout
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // New filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [minRating, setMinRating] = useState(0);

  // UI states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage] = useState("");
  const [toastVariant] = useState("success");

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const data = await apiService.getShops({
          page,
          limit,
          search: searchTerm,
          sortBy: sortBy,
          // Add minRating to the API call if your backend supports it
          // minRating: minRating
        });

        let shopsData = data.data || [];

        // If sorting by ratings and backend doesn't support it, we'll handle it after getting ratings
        setShops(shopsData);
        setTotalPages(data.pagination?.pages || 1);

        // Fetch ratings for each shop
        if (shopsData.length > 0) {
          const ratingsPromises = shopsData.map((shop) =>
            apiService
              .getShopRatings(shop.id)
              .then((ratingData) => ({ shopId: shop.id, ...ratingData }))
              .catch((err) => {
                console.error(
                  `Error fetching ratings for shop ${shop.id}:`,
                  err
                );
                return { shopId: shop.id, averageRating: 0, totalRatings: 0 };
              })
          );

          const ratingsResults = await Promise.all(ratingsPromises);
          const ratingsMap = {};

          ratingsResults.forEach((rating) => {
            ratingsMap[rating.shopId] = rating;
          });

          setShopRatings(ratingsMap);

          // If we need to filter by rating (and backend doesn't support it)
          if (minRating > 0) {
            const filteredShops = shopsData.filter((shop) => {
              const rating = ratingsMap[shop.id]?.averageRating || 0;
              return rating >= minRating;
            });
            setShops(filteredShops);
          }

          // If we need to sort by rating (and backend doesn't support it)
          if (sortBy === "rating") {
            const sortedShops = [...shopsData].sort((a, b) => {
              const ratingA = ratingsMap[a.id]?.averageRating || 0;
              const ratingB = ratingsMap[b.id]?.averageRating || 0;
              return ratingB - ratingA; // Descending order
            });
            setShops(sortedShops);
          }
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError(
          "Terjadi kesalahan saat mengambil data toko. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [page, limit, searchTerm, sortBy, minRating, isAuthenticated]);

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

  // Handle rating filter
  const handleRatingFilter = (rating) => {
    setMinRating(rating);
    setPage(1);
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
            {toastVariant === "success" ? "Berhasil!" : "Pemberitahuan"}
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
            placeholder="Cari toko berdasarkan nama atau alamat..."
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
                <option value="rating">Rating Tertinggi</option>
                <option value="products">Jumlah Produk Terbanyak</option>
                <option value="newest">Terbaru</option>
              </select>
            </Col>
            <Col xs={12} md={6}>
              <label className="me-2">Rating Minimal:</label>
              <div className="rating-filter d-flex align-items-center">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={
                      minRating === rating ? "warning" : "outline-warning"
                    }
                    className="rating-button me-1"
                    onClick={() => handleRatingFilter(rating)}
                  >
                    {rating === 0 ? "Semua" : `${rating}+`}
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

  // Function to render star rating for a shop
  const renderStars = (shopId) => {
    const ratingData = shopRatings[shopId];
    if (!ratingData) return null;

    const averageRating = ratingData.averageRating || 0;
    const totalRatings = ratingData.totalRatings || 0;

    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

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
        <div className="me-2">{stars}</div>
        <small className="text-muted">({totalRatings} ulasan)</small>
      </div>
    );
  };

  // Render shop card
  const renderShopCard = (shop) => (
    <Col key={shop.id} sm={6} md={6} lg={4} xl={3} className="mb-4">
      <Card className="h-100 shop-card shadow-sm border-0 rounded-3 hover-effect">
        <div className="product-image-container position-relative">
          <Card.Img
            variant="top"
            src={shop.photoShop}
            alt={shop.name}
            className="product-image rounded-top"
            style={{ height: "180px", objectFit: "contain", width: "100%" }}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x180?text=No+Image";
            }}
          />
          <Badge
            bg="primary"
            className="category-badge position-absolute top-0 end-0 m-2"
          >
            <FaStore className="me-1" /> Toko
          </Badge>
        </div>

        <Card.Body className="d-flex flex-column p-3">
          <Card.Title className="shop-title fs-5 fw-bold text-truncate">
            {shop.name}
          </Card.Title>

          <div className="mb-2 d-flex align-items-start">
            <FaMapMarkerAlt className="text-danger mt-1 me-1 flex-shrink-0" />
            <small className="text-muted text-truncate">{shop.address}</small>
          </div>

          {/* Display star rating */}
          {renderStars(shop.id)}

          <div className="mb-3">
            <Badge bg="info" className="me-2 rounded-pill">
              <FaShoppingBag className="me-1" /> {shop._count?.products || 0}{" "}
              Produk
            </Badge>
          </div>

          <div className="mt-auto">
            <div className="d-grid">
              <Link
                to={`/shop/${shop.id}`}
                className="btn btn-warning rounded-pill"
              >
                Lihat Toko
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
        <span className="display-1 text-muted">🏪</span>
      </div>
      <h3>Tidak ada toko yang ditemukan</h3>
      <p className="text-muted">
        {searchTerm
          ? `Tidak ada hasil untuk pencarian "${searchTerm}"`
          : "Belum ada toko yang terdaftar"}
      </p>
      {searchTerm && (
        <Button
          variant="outline-warning"
          className="rounded-pill px-4"
          onClick={() => {
            setSearchTerm("");
            setSearchInput("");
            setMinRating(0);
          }}
        >
          Lihat Semua Toko
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
          Toko Ayam Bakar Nusantara
        </h1>
        <p className="menu-subtitle text-muted">
          Temukan berbagai toko dengan produk unggulan
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
          <p className="mt-2 text-muted">Memuat daftar toko...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger shadow-sm rounded-3">{error}</div>
      )}

      {/* Empty State */}
      {!loading && !error && shops.length === 0 && renderEmptyState()}

      {/* Shops Grid */}
      {!loading && shops.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <p className="results-count mb-0">
              Menampilkan{" "}
              <span className="text-primary fw-bold">{shops.length}</span> toko
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
                <option value="rating">Rating Tertinggi</option>
                <option value="products">Jumlah Produk Terbanyak</option>
                <option value="newest">Terbaru</option>
              </select>
            </div>
          </div>

          <Row className="shop-grid">
            {shops.map((shop) => renderShopCard(shop))}
          </Row>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default ShopPage;
