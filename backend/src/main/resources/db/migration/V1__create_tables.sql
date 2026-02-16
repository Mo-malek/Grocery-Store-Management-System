-- =============================================
-- V1: Create core tables for Grocery Store System
-- نظام إدارة البقالة - إنشاء الجداول الأساسية
-- =============================================

-- المنتجات
CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50),
    category VARCHAR(100),
    purchase_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    unit VARCHAR(50) DEFAULT 'قطعة',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- العملاء
CREATE TABLE customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    total_purchases DECIMAL(12, 2) DEFAULT 0,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- فواتير البيع
CREATE TABLE sale (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- أصناف الفاتورة
CREATE TABLE sale_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_saleitem_sale FOREIGN KEY (sale_id) REFERENCES sale(id) ON DELETE CASCADE,
    CONSTRAINT fk_saleitem_product FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Indexes for performance
CREATE INDEX idx_product_barcode ON product(barcode);
CREATE INDEX idx_product_category ON product(category);
CREATE INDEX idx_product_active ON product(active);
CREATE INDEX idx_customer_phone ON customer(phone);
CREATE INDEX idx_sale_customer ON sale(customer_id);
CREATE INDEX idx_sale_created ON sale(created_at);
CREATE INDEX idx_saleitem_sale ON sale_item(sale_id);
CREATE INDEX idx_saleitem_product ON sale_item(product_id);
