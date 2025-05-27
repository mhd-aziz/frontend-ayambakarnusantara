// src/pages/Seller/SellerProductManagement.js
import React from "react";
import { useOutletContext } from "react-router-dom";
// 👇 Impor Row dan Col di sini
import { Container, Alert, Card, Button, Row, Col } from "react-bootstrap";
import { InfoCircleFill, PlusCircleFill } from "react-bootstrap-icons";
import CreateSellerForm from "../../components/Seller/CreateSellerForm";

function SellerProductManagement() {
  const { userRole, shopData, hasShop, handleShopCreated } = useOutletContext();

  if (userRole !== "seller" || !hasShop) {
    return (
      <Container>
        <Alert variant="warning" className="mt-3">
          <InfoCircleFill className="me-2" />
          Anda perlu memiliki toko untuk mengelola produk.
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Kelola Produk Toko: {shopData?.shopName}</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => alert("Navigasi ke form tambah produk")}
        >
          <PlusCircleFill className="me-2" /> Tambah Produk Baru
        </Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Text>
            Di sini Anda akan dapat melihat, menambah, mengedit, dan menghapus
            produk-produk Anda.
          </Card.Text>
          {/* Daftar produk akan ditampilkan di sini */}
          <Alert variant="info" className="mt-3">
            Fitur pengelolaan produk sedang dalam pengembangan.
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SellerProductManagement;
