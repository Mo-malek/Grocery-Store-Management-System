-- Add smart indexes to improve search and report performance
-- إضافة فهارس ذكية لتحسين سرعة البحث والتقارير

-- Speed up product searches by name (case-insensitive search often uses ILIKE which can benefit from indexes)
CREATE INDEX IF NOT EXISTS idx_product_name ON product(name);

-- Speed up sales reports by date and customer
CREATE INDEX IF NOT EXISTS idx_sale_created_at_customer ON sale(created_at DESC, customer_id);

-- Speed up stock log lookups
CREATE INDEX IF NOT EXISTS idx_stock_log_product_type ON stock_logs(product_id, type);
