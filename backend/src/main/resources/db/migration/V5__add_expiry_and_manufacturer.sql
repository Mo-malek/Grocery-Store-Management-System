-- V5: Add expiry date and manufacturer info to Product table
ALTER TABLE product ADD COLUMN expiry_date DATE;
ALTER TABLE product ADD COLUMN manufacturer VARCHAR(255);
