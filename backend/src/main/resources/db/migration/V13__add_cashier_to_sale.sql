ALTER TABLE sale ADD COLUMN cashier_id BIGINT;
ALTER TABLE sale ADD CONSTRAINT fk_sale_cashier FOREIGN KEY (cashier_id) REFERENCES users(id);
