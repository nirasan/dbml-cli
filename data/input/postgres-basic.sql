-- PostgreSQL Basic Test Tables
-- This script creates basic test tables to validate parser functionality

\c ddl2schema_basic;

-- Test basic data types
CREATE TABLE data_types_test (
    id SERIAL PRIMARY KEY,
    bigint_col BIGINT,
    decimal_col DECIMAL(10, 2),
    float_col REAL,
    double_col DOUBLE PRECISION,
    varchar_col VARCHAR(255),
    text_col TEXT,
    char_col CHAR(10),
    date_col DATE,
    time_col TIME,
    datetime_col TIMESTAMP,
    timestamp_col TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    boolean_col BOOLEAN,
    json_col JSON,
    jsonb_col JSONB,
    uuid_col UUID,
    array_col INTEGER[]
);

-- Test PRIMARY KEY variations
CREATE TABLE single_pk_test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE composite_pk_test (
    category_id INTEGER,
    item_id INTEGER,
    name VARCHAR(100),
    PRIMARY KEY (category_id, item_id)
);

-- Test UNIQUE constraints
CREATE TABLE unique_test (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    CONSTRAINT unique_name UNIQUE (first_name, last_name)
);

-- Test ENUM type
CREATE TYPE status_enum AS ENUM ('active', 'inactive', 'pending');

-- Test FOREIGN KEY constraints
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER,
    price DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Test CHECK constraints
CREATE TABLE check_test (
    id SERIAL PRIMARY KEY,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    status status_enum DEFAULT 'pending',
    score DECIMAL(5, 2) CHECK (score >= 0.0 AND score <= 100.0)
);

-- Test INDEX
CREATE TABLE index_test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_name ON index_test (name);
CREATE UNIQUE INDEX idx_email ON index_test (email);