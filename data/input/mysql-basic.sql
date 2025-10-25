-- MySQL Basic Test Tables
-- This script creates basic test tables to validate parser functionality

USE ddl2schema_basic;

-- Test basic data types
CREATE TABLE data_types_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bigint_col BIGINT,
    decimal_col DECIMAL(10, 2),
    float_col FLOAT,
    double_col DOUBLE,
    varchar_col VARCHAR(255),
    text_col TEXT,
    char_col CHAR(10),
    date_col DATE,
    time_col TIME,
    datetime_col DATETIME,
    timestamp_col TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    boolean_col BOOLEAN
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test PRIMARY KEY variations
CREATE TABLE single_pk_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE composite_pk_test (
    category_id INT,
    item_id INT,
    name VARCHAR(100),
    PRIMARY KEY (category_id, item_id)
);

-- Test UNIQUE constraints
CREATE TABLE unique_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    UNIQUE KEY unique_name (first_name, last_name)
);

-- Test FOREIGN KEY constraints
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Test CHECK constraints (MySQL 8.0+)
CREATE TABLE check_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age INT CHECK (age >= 0 AND age <= 150),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending'
);

-- Test INDEX
CREATE TABLE index_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    UNIQUE INDEX idx_email (email)
);