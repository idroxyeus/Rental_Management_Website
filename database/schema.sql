-- Rental Management System Database Schema

CREATE DATABASE IF NOT EXISTS rental_db;
USE rental_db;

-- Users table (for login/authentication)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'landlord', 'tenant') DEFAULT 'tenant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  property_id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  rent_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('vacant', 'occupied') DEFAULT 'vacant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants table (Aadhaar-style personal details)
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  permanent_address TEXT,
  aadhaar_number VARCHAR(12),
  pan_number VARCHAR(10),
  occupation VARCHAR(100),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  id_proof VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Family members living with the tenant
CREATE TABLE IF NOT EXISTS family_members (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  relationship ENUM('spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other') NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  aadhaar_number VARCHAR(12),
  occupation VARCHAR(100),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- Leases table
CREATE TABLE IF NOT EXISTS leases (
  lease_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  tenant_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount DECIMAL(10, 2) NOT NULL,
  deposit DECIMAL(10, 2) DEFAULT 0,
  status ENUM('active', 'expired', 'terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  lease_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  month VARCHAR(20),
  status ENUM('paid', 'pending', 'overdue') DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(lease_id) ON DELETE CASCADE
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  property_id INT NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);
