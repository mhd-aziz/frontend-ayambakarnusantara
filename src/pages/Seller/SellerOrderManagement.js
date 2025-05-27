// src/pages/Seller/SellerOrderManagement.js
import React from "react";
import { useOutletContext } from "react-router-dom";
// 👇 Impor Row dan Col di sini
import { Container, Alert, Card, Row, Col } from "react-bootstrap";
import { InfoCircleFill } from "react-bootstrap-icons";
import CreateSellerForm from "../../components/Seller/CreateSellerForm";

function SellerOrderManagement() {
  const { userRole, shopData, hasShop, handleShopCreated } = useOutletContext();

  if (userRole !== "seller" || !hasShop) {
    return (
      <Container>
        <Alert variant="warning" className="mt-3">
          <InfoCircleFill className="me-2" />
          Anda perlu memiliki toko untuk mengelola pesanan.
        </Alert>
        {/* Tawarkan untuk membuat toko jika belum punya */}
        {(userRole === "customer" || (userRole === "seller" && !hasShop)) && (
          <Row className="justify-content-center mt-4">
            <Col md={10} lg={8}>
              <CreateSellerForm onShopCreated={handleShopCreated} />
            </Col>
          </Row>
        )}
      </Container>
    );
  }

  return (
    <div>
      <h3 className="mb-4">Kelola Pesanan Toko: {shopData?.shopName}</h3>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Text>
            Di sini Anda akan dapat melihat dan mengelola pesanan yang masuk ke
            toko Anda.
          </Card.Text>
          {/* Daftar pesanan akan ditampilkan di sini */}
          <Alert variant="info" className="mt-3">
            Fitur pengelolaan pesanan sedang dalam pengembangan.
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SellerOrderManagement;
