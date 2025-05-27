// src/pages/SellerPage.js
import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { ExclamationCircleFill } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import { getMyShop } from "../../services/ShopService";
import { getProfile } from "../../services/ProfileService";
import SellerSidebar from "../../components/Seller/SellerSidebar";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";

function SellerPage() {
  const {
    isLoggedIn,
    isLoading: authLoading,
    login: updateUserInContext,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [hasShop, setHasShop] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  const loadInitialData = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoadingPage(false);
      return;
    }
    setIsLoadingPage(true);
    setPageError("");
    setUserRole(null); // Reset sebelum fetch
    setHasShop(false); // Reset sebelum fetch
    setShopData(null); // Reset sebelum fetch
    setCurrentUserProfile(null); // Reset sebelum fetch

    try {
      const profileResponse = await getProfile();
      if (
        profileResponse &&
        (profileResponse.success || profileResponse.status === "success") &&
        profileResponse.data
      ) {
        const fetchedProfile = profileResponse.data;
        setCurrentUserProfile(fetchedProfile);
        setUserRole(fetchedProfile.role);

        if (fetchedProfile.role === "seller") {
          try {
            const shopResponse = await getMyShop();
            if (
              shopResponse &&
              (shopResponse.success || shopResponse.status === "success") &&
              shopResponse.data
            ) {
              setShopData(shopResponse.data);
              setHasShop(true);
            } else {
              setHasShop(false);
            }
          } catch (shopError) {
            if (shopError.statusCode === 404) {
              setHasShop(false);
            } else if (
              !(shopError.statusCode === 401 || shopError.statusCode === 403)
            ) {
              setPageError(shopError.message || "Gagal memuat data toko.");
            }
          }
        } else if (fetchedProfile.role === "customer") {
          setHasShop(false);
        } else {
          setPageError("Peran pengguna tidak dikenali.");
        }
      } else {
        setPageError(
          profileResponse?.message || "Gagal mengambil data profil."
        );
      }
    } catch (profileErr) {
      if (!(profileErr.statusCode === 401 || profileErr.statusCode === 403)) {
        setPageError(
          profileErr.message || "Terjadi kesalahan saat mengambil profil."
        );
      }
    } finally {
      setIsLoadingPage(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      loadInitialData();
    } else if (!authLoading && !isLoggedIn) {
      setIsLoadingPage(false);
    }
  }, [authLoading, isLoggedIn, loadInitialData]);

  const handleShopCreated = useCallback(
    async (newShopData) => {
      setShopData(newShopData);
      setHasShop(true);
      setUserRole("seller");
      try {
        const updatedProfileResponse = await getProfile();
        if (
          updatedProfileResponse &&
          (updatedProfileResponse.success ||
            updatedProfileResponse.status === "success") &&
          updatedProfileResponse.data
        ) {
          updateUserInContext(updatedProfileResponse.data, {
            navigateAfterLogin: false,
          });
          setCurrentUserProfile(updatedProfileResponse.data);
        }
      } catch (error) {
        console.error(
          "Gagal mengupdate profil di context setelah buat toko:",
          error
        );
      }
      navigate("/toko-saya");
    },
    [updateUserInContext, navigate]
  );

  if (authLoading || isLoadingPage) {
    return (
      <Container
        fluid // Spinner bisa tetap fluid untuk mengisi layar penuh saat loading
        className="d-flex justify-content-center align-items-center vh-100"
      >
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "3rem", height: "3rem" }}
        />
      </Container>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (pageError) {
    return (
      <Container className="mt-5 text-center">
        {" "}
        {/* Container non-fluid untuk pesan error */}
        <Alert variant="danger" className="py-4">
          <Alert.Heading>
            <ExclamationCircleFill size={24} className="me-2" /> Gagal Memuat
            Data
          </Alert.Heading>
          <p>{pageError}</p>
          <Button onClick={loadInitialData} variant="danger">
            Coba Lagi
          </Button>
        </Alert>
      </Container>
    );
  }

  // Hanya render layout dashboard jika userRole sudah ditentukan
  if (userRole) {
    return (
      // 👇 Ganti Container fluid menjadi Container non-fluid
      // Tambahkan juga margin atas dan bawah (misalnya mt-4 mb-5) jika diinginkan
      <Container className="seller-page-container mt-4 mb-5">
        <Row className="g-0">
          {" "}
          {/* g-0 untuk menghilangkan gutter antar kolom sidebar dan konten */}
          <Col md={3} lg={2} className="seller-sidebar-col p-0 border-end">
            {" "}
            {/* p-0 jika sidebar mengatur padding internalnya, tambahkan border jika perlu */}
            <SellerSidebar shopName={shopData?.shopName} />
          </Col>
          <Col
            md={9}
            lg={10}
            className="seller-content-col p-4" // bg-body-tertiary bisa dihapus jika ingin default atau styling sendiri
          >
            <Outlet
              context={{
                currentUserProfile,
                userRole,
                shopData,
                hasShop,
                handleShopCreated,
                loadInitialData,
              }}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  // Fallback jika userRole belum ter-set (setelah loading utama selesai)
  return (
    <Container
      fluid // Ini bisa tetap fluid untuk loading awal peran
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <Spinner animation="border" variant="secondary" />
      <p className="ms-2">Memeriksa status penjual...</p>
    </Container>
  );
}

export default SellerPage;
