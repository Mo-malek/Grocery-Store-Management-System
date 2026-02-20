# Customer-Facing Storefront & Delivery Plan (Phase 2)

Goal: Expose a secure, mobile-first storefront so customers can browse products/offers, build a cart, and place delivery orders that sync with the existing POS/inventory backend.

## 1) Scope & Experience
- Channels: responsive web (PWA-ready), later WhatsApp deep links to product pages/offers.
- Locales: Arabic first; keep RTL-ready.
- Entry points: Home (hero + featured offers), Catalog (search/filter), Product detail, Offers page, Cart/Checkout, Order tracking.

## 2) Data & APIs (reuse current backend where possible)
- Products: public read endpoint with pagination, category filter, search, price, stock, images, tags (e.g., “featured”, “offer”).
- Offers: new endpoint to list active promotions/bundles with validity windows and strike-through prices.
- Cart/Order: new endpoints:
  - `POST /storefront/cart/price`: validate items, prices, stock, promos.
  - `POST /storefront/orders`: create delivery order (line items, address, delivery slot, payment method, contact).
  - `GET /storefront/orders/{id}`: status tracking.
- Customers: lightweight guest checkout + optional account (email/phone OTP). Avoid POS roles exposure.
- Delivery slots: optional endpoint to expose configurable time windows and delivery fees.

## 3) Architecture
- Frontend: new standalone Angular “storefront” module (lazy-loaded, separate layout from POS/admin).
- Theme: reuse token system, but simplified palette for shoppers; add LTR toggle if needed.
- Auth: OTP by phone/email via existing SMS/WhatsApp provider; store short-lived JWT or session token scoped to storefront APIs only.
- State: client cart stored locally; server price/stock validation at checkout.

## 4) Pages & Flows
- Home: hero banner, featured offers, top categories, quick search.
- Catalog: filters (category, price, availability), search-as-you-type, sorting.
- Product detail: gallery, price, promo flags, stock, quantity stepper, “add to cart”, recommended items.
- Offers: list bundles/discounts; “add bundle” to cart.
- Cart: editable quantities, promo code box, delivery fee estimator, CTA to checkout.
- Checkout: contact info, address (with area selector), delivery slot picker, payment method (COD first; add online later), order summary/fees/taxes.
- Order success: order number, ETA, share/print.
- Order tracking: minimal status timeline (received → preparing → out for delivery → delivered/cancelled).

## 5) Promotions & Pricing Rules
- Support per-item discount, bundle price, and coupon code (percentage/flat, min basket, expiry, one-time per customer).
- On checkout, server recomputes totals and returns authoritative prices; rejects stale promos.

## 6) Inventory & Stock Integrity
- Read stock from current products table; expose only non-zero stock (or flag low stock).
- Deduct stock on order creation; release on cancellation/expiry.
- Optional reservation TTL (e.g., 20 minutes) if payments move online.

## 7) Payments (phased)
- Phase 1: Cash on delivery.
- Phase 2: Online payments via local gateway (redirect flow), with webhook to confirm and capture order; idempotent order updates.

## 8) Delivery & Addressing
- Collect address fields (area, street, building, flat, notes); optional map pin later.
- Delivery fee rules: by area or flat; free-shipping threshold; expose calculated fee in cart/checkout.
- Driver app not in scope; just status fields and manual updates from backoffice/POS UI.

## 9) Notifications
- Order placed/confirmed/out-for-delivery delivered via WhatsApp/SMS/email (reuse marketing provider).
- Web push later (requires PWA + user opt-in).

## 10) Security & Separation
- Separate storefront routes and role scopes; no admin endpoints exposed.
- Rate limit public product and order APIs; captcha/OTP on checkout abuse.
- Sanitize promo codes input; server-side validation only.

## 11) Performance & UX
- Image optimization (WebP), lazy loading, skeleton states, offline page shell.
- Search debounce and server-side filtering; caching for categories/offers.
- PWA manifest + add-to-home-screen prompt.

## 12) Delivery Order Lifecycle (MVP statuses)
- `PLACED` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED` | `CANCELLED`.
- Allow customer view-only; updates come from staff dashboard.

## 13) Backoffice Changes
- Admin UI: manage offers, promo codes, delivery areas/fees, slots.
- Orders list: filter by status, assign driver (optional text field), update status, cancel/refund.

## 14) Milestones (suggested)
- Week 1: Public product/offer APIs + storefront shell (home, catalog, product detail).
- Week 2: Cart/checkout flow with COD, promo validation, delivery fee rules.
- Week 3: Order tracking page + notifications + admin order status UI.
- Week 4: Polish (PWA, perf, a11y), payments spike, and handover docs.
