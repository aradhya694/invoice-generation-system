-- VKF Invoice Application - Database Schema

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_address TEXT,
    customer_gstin VARCHAR(15),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    gst_type VARCHAR(10) NOT NULL CHECK (gst_type IN ('IGST', 'CGST_SGST')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    hsn_code VARCHAR(10),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    taxable_amount NUMERIC(12, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL,
    gst_amount NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);

-- Indexes
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Seed admin user (password: admin123)
-- bcrypt hash for 'admin123' with 10 rounds
INSERT INTO users (username, password_hash, full_name)
VALUES ('admin', '$2a$10$UVAsox2G3hnYfa4.GEK8J.V0yTFKl8.5KMxkxknzT3in4Mg2EjMWK', 'Administrator');
