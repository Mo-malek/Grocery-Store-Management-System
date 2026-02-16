-- V6: Add Bundle Builder and Customer Intelligence
CREATE TABLE bundle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(19, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bundle_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bundle_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (bundle_id) REFERENCES bundle(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Update Customer for intelligence tracking
ALTER TABLE customer ADD COLUMN last_visit_at TIMESTAMP;
ALTER TABLE customer ADD COLUMN avg_ticket_size DECIMAL(19, 2) DEFAULT 0;
ALTER TABLE customer ADD COLUMN favorite_category VARCHAR(255);
ALTER TABLE customer ADD COLUMN visit_count INTEGER DEFAULT 0;
