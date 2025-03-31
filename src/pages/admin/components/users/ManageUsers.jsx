/*
 * Component: ManageUsers
 * Deskripsi: Komponen untuk manajemen pengguna di dashboard admin
 * Digunakan di: Dashboard.jsx
 *
 * Fitur:
 * - Placeholder untuk manajemen pengguna
 * - Tombol untuk menambah pengguna
 */

import React from "react";
import { Card, Button } from "react-bootstrap";

const ManageUsers = () => {
  return (
    <>
      <h3 className="mb-4">Manage Users</h3>
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Daftar Pengguna</h5>
          <Button variant="primary" size="sm">
            Tambah Pengguna
          </Button>
        </Card.Header>
        <Card.Body>
          <p className="text-center py-5">
            Konten untuk manajemen pengguna akan ditampilkan di sini.
          </p>
        </Card.Body>
      </Card>
    </>
  );
};

export default ManageUsers;
