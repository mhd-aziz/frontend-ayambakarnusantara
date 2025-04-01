// src/pages/user/components/ChangePassword.jsx
import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { updateUserPassword } from "../../../services/authService";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error and success messages
    setError(null);
    setSuccess(null);

    // Validate password and confirmation match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError("Password baru harus terdiri dari minimal 8 karakter");
      return;
    }

    try {
      setUpdating(true);

      const response = await updateUserPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(response.message || "Password berhasil diperbarui!");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui password");
      console.error("Error updating password:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <h3 className="mb-4">Ubah Password</h3>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="currentPassword">
          <Form.Label>Password Saat Ini</Form.Label>
          <Form.Control
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>Password Baru</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <Form.Text className="text-muted">
            Password minimal 8 karakter
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Konfirmasi Password Baru</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={updating}>
          {updating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Menyimpan...
            </>
          ) : (
            "Perbarui Password"
          )}
        </Button>
      </Form>
    </>
  );
};

export default ChangePassword;
