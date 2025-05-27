// src/pages/ShopDetailPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Image,
  Spinner,
  Alert,
  Button,
  Card,
  Breadcrumb,
  Badge,
} from "react-bootstrap";
import { getShopDetailById } from "../services/ShopService";
import { getProducts } from "../services/MenuService";
import "../css/ShopDetailPage.css";
// import "../css/MenuPage.css"; // Anda mungkin tidak memerlukan ini lagi

function ShopDetailPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shopInfo, setShopInfo] = useState(null);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [errorShop, setErrorShop] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  const fetchShopDetailsAndOwner = useCallback(async () => {
    if (!shopId) {
      setErrorShop("ID Toko tidak ditemukan di URL.");
      setIsLoadingShop(false);
      return;
    }
    setIsLoadingShop(true);
    setErrorShop(null);
    try {
      const response = await getShopDetailById(shopId);
      if (response && response.success && response.data && response.data.shop) {
        setShopInfo(response.data.shop);
        setOwnerInfo(response.data.owner);
      } else {
        setShopInfo(null);
        setOwnerInfo(null);
        setErrorShop(
          response?.message ||
            "Gagal mengambil detail toko (format respons tidak sesuai)."
        );
      }
    } catch (err) {
      setErrorShop(
        err.message ||
          "Terjadi kesalahan pada server saat mengambil detail toko."
      );
      setShopInfo(null);
      setOwnerInfo(null);
    } finally {
      setIsLoadingShop(false);
    }
  }, [shopId]);

  const fetchAndFilterProductsForShop = useCallback(async () => {
    if (!shopId) {
      setErrorProducts("ID Toko tidak valid untuk mengambil produk.");
      setIsLoadingProducts(false);
      return;
    }
    setIsLoadingProducts(true);
    setErrorProducts(null);
    setShopProducts([]);

    try {
      const allProductsResponse = await getProducts();
      if (
        allProductsResponse &&
        allProductsResponse.success &&
        allProductsResponse.data &&
        allProductsResponse.data.products
      ) {
        const filteredProducts = allProductsResponse.data.products.filter(
          (product) => product.shopId === shopId
        );
        setShopProducts(filteredProducts);
      } else {
        setShopProducts([]);
        if (allProductsResponse && allProductsResponse.success === false) {
          setErrorProducts(
            allProductsResponse.message || "Gagal mengambil daftar produk."
          );
        } else {
          setErrorProducts(
            "Format data produk tidak sesuai atau daftar produk kosong."
          );
        }
      }
    } catch (err) {
      setErrorProducts(
        err.message ||
          "Terjadi kesalahan pada server saat mengambil daftar produk."
      );
      setShopProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopDetailsAndOwner();
    fetchAndFilterProductsForShop();
  }, [fetchShopDetailsAndOwner, fetchAndFilterProductsForShop]);

  const handleImageError = (e, defaultText = "Gambar Tidak Tersedia") => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/400x200/EFEFEF/AAAAAA?text=${encodeURIComponent(
      defaultText
    )}`; // Ganti layanan placeholder
  };

  if (isLoadingShop) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <p className="ms-3 mb-0">Memuat detail toko...</p>
      </Container>
    );
  }

  if (errorShop) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Oops! Terjadi Kesalahan</Alert.Heading>
          <p>{errorShop}</p>
          <Button
            onClick={() => navigate("/toko")}
            variant="secondary"
            className="me-2"
          >
            Kembali ke Daftar Toko
          </Button>
          <Button onClick={fetchShopDetailsAndOwner} variant="primary">
            Coba Lagi
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!shopInfo) {
    return (
      <Container className="text-center py-5">
        <Alert variant="warning" className="shadow-sm">
          <Alert.Heading>Toko Tidak Ditemukan</Alert.Heading>
          <p>Detail untuk toko ini tidak dapat ditemukan.</p>
          <Button as={Link} to="/toko" variant="primary">
            Kembali ke Daftar Toko
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="my-4 shop-detail-page-container">
      <Breadcrumb className="shop-breadcrumb bg-light px-3 py-2 rounded-pill shadow-sm mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/toko" }}>
          Daftar Toko
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{shopInfo.shopName}</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="shop-detail-card shadow-lg border-0 mb-5">
        {shopInfo.bannerImageURL && (
          <div className="shop-banner-img-container">
            <Image
              src={shopInfo.bannerImageURL}
              alt={`Foto Toko ${shopInfo.shopName}`} // Mengganti "Banner"
              className="shop-banner-img"
              onError={(e) => handleImageError(e, shopInfo.shopName)}
            />
          </div>
        )}
        <Card.Body className="p-md-4 p-3">
          <Row className="align-items-center">
            <Col lg={8} md={7}>
              <h1 className="shop-title display-5 mb-2">{shopInfo.shopName}</h1>
              <p className="shop-description lead text-muted mb-3">
                {shopInfo.description}
              </p>
              {shopInfo.shopAddress && (
                <p className="shop-address mb-1">
                  <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                  {shopInfo.shopAddress}
                </p>
              )}
              <p className="shop-timestamps text-muted small">
                Bergabung:{" "}
                {new Date(shopInfo.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {shopInfo.updatedAt !== shopInfo.createdAt && (
                  <span className="d-block d-md-inline ms-md-2 mt-1 mt-md-0">
                    (Diperbarui:{" "}
                    {new Date(shopInfo.updatedAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    )
                  </span>
                )}
              </p>
            </Col>
            {ownerInfo && (
              <Col lg={4} md={5} className="mt-4 mt-md-0">
                <Card className="owner-info-card border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <h5 className="owner-info-title mb-3">Pemilik Toko</h5>
                    {ownerInfo.photoURL && (
                      <Image
                        src={ownerInfo.photoURL}
                        alt={ownerInfo.displayName}
                        roundedCircle
                        className="owner-avatar mb-2"
                        onError={(e) =>
                          handleImageError(e, ownerInfo.displayName)
                        }
                      />
                    )}
                    <p className="owner-name h5 mb-0">
                      {ownerInfo.displayName}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <div className="shop-products-section mt-5 pt-3">
        <h2 className="text-center mb-4 section-title-products">
          Menu dari Toko Ini
        </h2>
        {isLoadingProducts && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" />
            <p className="mt-3 text-muted">Memuat menu toko...</p>
          </div>
        )}
        {!isLoadingProducts && errorProducts && (
          <Alert variant="danger" className="text-center shadow-sm">
            <Alert.Heading as="h5">Gagal Memuat Menu Toko</Alert.Heading>
            <p className="mb-2">{errorProducts}</p>
            <Button
              onClick={fetchAndFilterProductsForShop}
              variant="outline-danger"
              size="sm"
            >
              Coba Lagi
            </Button>
          </Alert>
        )}
        {!isLoadingProducts && !errorProducts && shopProducts.length > 0 ? (
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {shopProducts.map((product) => (
              <Col
                key={product.productId || product._id}
                className="d-flex align-items-stretch"
              >
                <Card className="h-100 product-list-card shadow-sm">
                  <Card.Img // Gunakan Card.Img untuk konsistensi dengan ShopPage jika diinginkan
                    variant="top"
                    className="product-list-card-img"
                    src={
                      product.productImageURL ||
                      `https://placehold.co/300x200/EFEFEF/AAAAAA?text=${encodeURIComponent(
                        product.name
                      )}`
                    }
                    onError={(e) => handleImageError(e, product.name)}
                    alt={product.name}
                  />
                  <Card.Body className="d-flex flex-column p-3">
                    <div className="mb-2">
                      <Badge
                        pill
                        bg="secondary" // Lebih netral untuk kategori
                        className="product-category-badge"
                      >
                        {product.category}
                      </Badge>
                    </div>
                    <Card.Title
                      as="h5" // Lebih sesuai untuk judul kartu
                      className="product-list-card-title flex-grow-1" // flex-grow-1 agar bisa mendorong konten bawah
                    >
                      {product.name}
                    </Card.Title>
                    {/* Deskripsi dapat dihilangkan atau dibuat sangat singkat di list produk toko */}
                    <div className="mt-auto">
                      {" "}
                      {/* Wrapper untuk harga, stok, tombol */}
                      <p className="product-list-card-price h5 text-primary mb-2">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-muted small mb-2">
                        Stok:{" "}
                        {product.stock > 0 ? (
                          product.stock
                        ) : (
                          <span className="text-danger fw-bold">Habis</span>
                        )}
                      </p>
                      <Button
                        variant="primary"
                        className="btn-brand w-100"
                        as={Link}
                        to={`/menu/${product.productId || product._id}`}
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? "Lihat Detail" : "Stok Habis"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          !isLoadingProducts &&
          !errorProducts && (
            <Alert variant="info" className="text-center shadow-sm">
              Toko ini belum memiliki menu yang tersedia.
            </Alert>
          )
        )}
      </div>
    </Container>
  );
}

export default ShopDetailPage;
