ALTER TABLE sale
    ADD COLUMN IF NOT EXISTS sale_channel VARCHAR(20) NOT NULL DEFAULT 'POS',
    ADD COLUMN IF NOT EXISTS source_order_id BIGINT,
    ADD COLUMN IF NOT EXISTS external_customer_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS external_customer_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS external_customer_address TEXT;

CREATE INDEX IF NOT EXISTS idx_sale_channel ON sale(sale_channel);
CREATE INDEX IF NOT EXISTS idx_sale_source_order_id ON sale(source_order_id);
