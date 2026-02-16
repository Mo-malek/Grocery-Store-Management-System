-- V7: Add bundle support to sale items
ALTER TABLE sale_item ADD COLUMN bundle_id BIGINT;
ALTER TABLE sale_item ADD FOREIGN KEY (bundle_id) REFERENCES bundle(id);
