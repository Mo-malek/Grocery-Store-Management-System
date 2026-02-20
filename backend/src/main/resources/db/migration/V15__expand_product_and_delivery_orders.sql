-- Expand product table
ALTER TABLE product ADD COLUMN description TEXT;
ALTER TABLE product ADD COLUMN discount_percentage NUMERIC DEFAULT 0;
ALTER TABLE product ADD COLUMN image_url VARCHAR(255);
ALTER TABLE product ADD COLUMN rating_average NUMERIC DEFAULT 0;
ALTER TABLE product ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Create delivery orders table
CREATE TABLE delivery_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    total_amount NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create delivery order items table
CREATE TABLE delivery_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES delivery_orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id),
    quantity INTEGER NOT NULL,
    price_at_time_of_order NUMERIC NOT NULL
);

-- Create product reviews table
CREATE TABLE product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
