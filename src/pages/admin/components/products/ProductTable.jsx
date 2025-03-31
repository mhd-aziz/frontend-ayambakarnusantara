/*
 * Component: ProductTable
 * Deskripsi: Tabel untuk menampilkan daftar produk dengan fungsi pagination dan search
 * Digunakan di: ManageProducts.jsx
 */

import React from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

const ProductTable = ({
  products,
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  loading,
  searchTerm,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  // Generate array of pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => onPageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div>
      {/* Search Box */}
      <div className="mb-3">
        <InputGroup>
          <Form.Control
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>
      </div>

      {/* Product Table */}
      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Produk</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  {searchTerm
                    ? "Tidak ada produk yang sesuai dengan pencarian"
                    : "Belum ada produk"}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={
                        product.photoProduct ||
                        "/assets/images/product-placeholder.jpg"
                      }
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                      className="rounded"
                    />
                  </td>
                  <td>
                    <div>{product.name}</div>
                    <small className="text-muted">
                      {product.description?.substring(0, 50)}
                      {product.description?.length > 50 ? "..." : ""}
                    </small>
                  </td>
                  <td>Rp {Number(product.price).toLocaleString()}</td>
                  <td>
                    {product.stock > 10 ? (
                      <Badge bg="success">{product.stock}</Badge>
                    ) : product.stock > 0 ? (
                      <Badge bg="warning">{product.stock}</Badge>
                    ) : (
                      <Badge bg="danger">Habis</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => onEdit(product)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Menampilkan{" "}
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems}{" "}
            produk
          </div>
          <Pagination>
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {paginationItems}
            <Pagination.Next
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
