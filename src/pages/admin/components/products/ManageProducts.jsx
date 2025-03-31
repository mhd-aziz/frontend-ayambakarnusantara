/*
 * Component: ManageProducts
 * Deskripsi: Komponen untuk manajemen produk di dashboard admin dengan integrasi API
 * Digunakan di: Dashboard.jsx
 *
 * Fitur:
 * - Menampilkan daftar produk dari API
 * - Membuat produk baru
 * - Mengupdate produk yang sudah ada
 * - Menghapus produk
 * - Pencarian produk
 * - Pagination
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import productService from "../../../../services/productService"; // Path yang dikoreksi

// Import komponen-komponen
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import DeleteConfirmation from "./DeleteConfirmation";

const ManageProducts = () => {
  // State untuk data
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk form dan modal
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // State untuk loading
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State untuk pesan alert
  const [alert, setAlert] = useState({
    show: false,
    variant: "success",
    message: "",
  });

  // Fungsi helper untuk menampilkan alert (dengan useCallback)
  const showAlert = useCallback((variant, message) => {
    setAlert({ show: true, variant, message });

    // Hide alert after 5 seconds
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  // Load products saat komponen dimount atau ketika search/page berubah
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts(
          currentPage,
          itemsPerPage,
          searchTerm
        );

        setProducts(response.products || []);
        setTotalItems(response.totalItems || 0);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        showAlert("danger", "Gagal memuat data produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    // Gunakan debounce untuk search term
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm, showAlert]); // Tambahkan showAlert ke dependencies

  // Handler untuk membuka form tambah produk
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  // Handler untuk edit produk
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  // Handler untuk konfirmasi hapus produk
  const handleDeleteConfirm = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setShowDeleteConfirm(true);
    }
  };

  // Handler untuk submit form produk (create/update)
  const handleProductSubmit = async (productData) => {
    try {
      setFormLoading(true);

      if (selectedProduct) {
        // Update existing product
        await productService.updateProduct(selectedProduct.id, productData);
        showAlert(
          "success",
          `Produk "${productData.name}" berhasil diperbarui.`
        );
      } else {
        // Create new product
        await productService.createProduct(productData);
        showAlert(
          "success",
          `Produk "${productData.name}" berhasil ditambahkan.`
        );
      }

      // Close form and refresh product list
      setShowForm(false);
      setCurrentPage(1); // Reset to first page after adding/editing

      // Refetch products
      const response = await productService.getProducts(
        1,
        itemsPerPage,
        searchTerm
      );
      setProducts(response.products || []);
      setTotalItems(response.totalItems || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error submitting product:", error);
      showAlert(
        "danger",
        `Gagal ${selectedProduct ? "memperbarui" : "menambahkan"} produk. ${
          error.message
        }`
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Handler untuk menghapus produk
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);

      await productService.deleteProduct(productToDelete.id);
      showAlert(
        "success",
        `Produk "${productToDelete.name}" berhasil dihapus.`
      );

      // Close modal and refresh product list
      setShowDeleteConfirm(false);

      // Remove product from local state if on the same page
      setProducts(products.filter((p) => p.id !== productToDelete.id));

      // Update total items
      setTotalItems((prev) => prev - 1);

      // Recalculate total pages
      const newTotalPages = Math.ceil((totalItems - 1) / itemsPerPage);
      setTotalPages(newTotalPages);

      // If current page is now invalid, go to previous page
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("danger", `Gagal menghapus produk. ${error.message}`);
    } finally {
      setDeleteLoading(false);
      setProductToDelete(null);
    }
  };

  // Handler untuk perubahan halaman pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler untuk perubahan search term
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <>
      <h3 className="mb-4">Manajemen Produk</h3>

      {/* Alert Message */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Daftar Produk</h5>
          <Button variant="primary" size="sm" onClick={handleAddProduct}>
            <FaPlus className="me-1" /> Tambah Produk
          </Button>
        </Card.Header>
        <Card.Body>
          <ProductTable
            products={products}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            onEdit={handleEditProduct}
            onDelete={handleDeleteConfirm}
          />
        </Card.Body>
      </Card>

      {/* Product Form Modal */}
      <ProductForm
        show={showForm}
        onHide={() => setShowForm(false)}
        product={selectedProduct}
        onSubmit={handleProductSubmit}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
        productName={productToDelete?.name}
      />
    </>
  );
};

export default ManageProducts;
