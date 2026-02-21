-- Backfill online sales for existing delivery orders that were created
-- before sale linkage was introduced.

INSERT INTO sale (
    customer_id,
    subtotal,
    discount,
    total,
    payment_method,
    sale_channel,
    source_order_id,
    external_customer_name,
    external_customer_phone,
    external_customer_address,
    created_at
)
SELECT
    NULL,
    COALESCE(o.total_amount, 0) - COALESCE(o.delivery_fee, 0),
    0,
    COALESCE(o.total_amount, 0),
    'CASH',
    'ONLINE',
    o.id,
    COALESCE(u.full_name, u.username),
    o.phone,
    o.address,
    o.created_at
FROM delivery_orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE NOT EXISTS (
    SELECT 1
    FROM sale s
    WHERE s.source_order_id = o.id
);

INSERT INTO sale_item (
    sale_id,
    product_id,
    quantity,
    unit_price,
    total
)
SELECT
    s.id,
    i.product_id,
    i.quantity,
    i.price_at_time_of_order,
    i.price_at_time_of_order * i.quantity
FROM delivery_order_items i
JOIN sale s ON s.source_order_id = i.order_id AND s.sale_channel = 'ONLINE'
WHERE NOT EXISTS (
    SELECT 1
    FROM sale_item si
    WHERE si.sale_id = s.id
);
