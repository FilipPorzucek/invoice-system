--
-- Demo/sample fixture data for invoice-system.
-- NOT run by default. Intended for a demo environment (docker compose --profile demo up),
-- e.g. to hand the running app to someone else to click through with real sample invoices.
--
-- Does NOT touch public.roles / public.invoice_statuses -- those are reference data
-- owned by the Flyway migration (V2__reference_data.sql) and exist in every environment.
--
-- Every invoice row's extracted fields match the real content of its file in
-- demo-files/ (read directly from the PDF/JPG) -- one invoice per file, one file
-- per status, so what you see in the UI matches what you see when you open the
-- attachment. Line item quantities are truncated to whole numbers the same way
-- InvoiceService.updateInvoiceFromOcrWebhook truncates real OCR output (int cast).
--
-- Safe to re-run: truncates its own tables and restarts identities before inserting.
--

BEGIN;

TRUNCATE TABLE public.invoice_items, public.approval_history, public.invoices,
    public.suppliers, public.users RESTART IDENTITY CASCADE;

--
-- Demo users: one account per role, all with the password "Demo1234!"
-- (bcrypt hash below, strength 10 -- same algorithm/strength Spring Security uses here).
--
INSERT INTO public.users (user_id, created_at, deleted_on, email, first_name, is_active, password_hash, role_id, last_name, date_of_birth) VALUES
    (1, now(), NULL, 'demo.employee@example.com',   'Demo', true, '$2b$10$bskXsO8MMbbEuVoqTl3VP.L5weWEWhgWvGnmcNFKRat8z0HF6P85O', 1, 'Employee',   NULL),
    (2, now(), NULL, 'demo.accountant@example.com', 'Demo', true, '$2b$10$bskXsO8MMbbEuVoqTl3VP.L5weWEWhgWvGnmcNFKRat8z0HF6P85O', 2, 'Accountant', NULL),
    (3, now(), NULL, 'demo.manager@example.com',    'Demo', true, '$2b$10$bskXsO8MMbbEuVoqTl3VP.L5weWEWhgWvGnmcNFKRat8z0HF6P85O', 3, 'Manager',    NULL),
    (4, now(), NULL, 'demo.admin@example.com',      'Demo', true, '$2b$10$bskXsO8MMbbEuVoqTl3VP.L5weWEWhgWvGnmcNFKRat8z0HF6P85O', 4, 'Admin',      NULL);

--
-- Suppliers: exactly the sellers printed on the 5 files in demo-files/.
--
INSERT INTO public.suppliers (supplier_id, address, bank_account_number, name, nip) VALUES
    (1, '45 Keizersgracht, 1015 CJ Amsterdam, Netherlands', NULL,                             'TechHardware B.V.',          'NL5273456782'),
    (2, '42 Domaniewska St, 02-672 Warsaw, Poland',         'PL22187675340139367107797166',   'InnoSoft Systems Sp. z o.o.', 'PL5251234560'),
    (3, '10 Wall St, EC2M 5PP London, United Kingdom',      'GB57QHJR58890002554383',         'CyberShield Security Ltd',    'GB123456789'),
    (4, '15 Alexanderplatz, 10178 Berlin, Germany',         'DE02782523132407358840',         'Nexus Cloud Data GmbH',       'DE5262345671');

--
-- Invoices: one per file in demo-files/, one per status, data matching the file exactly.
--
INSERT INTO public.invoices (invoice_id, created_at, currency, file_path, gross_amount, invoice_number, issue_date, net_amount, status_id, supplier_id, uploaded_by, rejection_reason) VALUES
    -- NEW: OCR already ran automatically on upload (it fills fields but never
    -- changes status -- see InvoiceService.updateInvoiceFromOcrWebhook), employee
    -- just hasn't reviewed/submitted it yet (submitInvoiceByEmployee moves it to
    -- PENDING_ACCOUNTANT).
    (1, now(), 'EUR', 'faktury/2026/invoice_2026-015231.pdf',      2829.72, '2026-015231',     '2026-09-01', 2829.72, 5, 1, 1, NULL),

    -- PENDING_ACCOUNTANT: employee submitted it, waiting for accountant review.
    (2, now(), 'PLN', 'faktury/2026/invoice_223_02_2026.pdf',      865.44,  '223/02/2026',     '2026-02-20', 703.61,  1, 2, 1, NULL),

    -- PENDING_MANAGER: accountant escalated it for manager sign-off.
    (3, now(), 'GBP', 'faktury/2026/invoice_CS08623.pdf',          7076.07, 'CS08623',         '2026-02-06', 7076.07, 2, 3, 1, NULL),

    -- BOOKED: fully approved.
    (4, now(), 'EUR', 'faktury/2026/invoice_NX-202512-84899.pdf',  778.66,  'NX-202512-84899', '2025-12-01', 778.66,  4, 4, 1, NULL),

    -- REJECTED.
    (5, now(), 'EUR', 'faktury/2026/invoice_2025-005994.jpg',      1931.45, '2025-005994',     '2025-10-25', 1931.45, 3, 1, 1, 'Brak zgodności z zamówieniem zakupowym');

--
-- Line items: exactly what's printed on each file.
--
INSERT INTO public.invoice_items (item_id, name, net_price, quantity, tax_rate, invoice_id, net_value) VALUES
    (1, 'Ultra-Wide Office Monitor 34"',                     558.33,  3,    0.00, 1, 1674.99),
    (2, 'Mechanical Keyboard (Wireless Pro)',                153.68,  3,    0.00, 1, 461.04),
    (3, 'USB-C Docking Station (Dual 4K)',                   231.23,  3,    0.00, 1, 693.69),

    (4, 'InnoCloud Usage Overage (Compute) (Feb 2026)',      0.5625,  1250, 0.23, 2, 703.61),

    (5, 'Web Application Penetration Test',                  1155.36, 5,    0.00, 3, 5776.80),
    (6, 'Retest / Remediation Verification',                 1299.27, 1,    0.00, 3, 1299.27),

    (7, 'Object Storage (Standard) - Data Transfer (Nov 2025)', 0.0985, 7905, 0.00, 4, 778.66),

    (8, 'Premium Business Laptop 16" (32GB RAM, 1TB SSD)',   1912.80, 1,    0.00, 5, 1912.80),
    (9, 'Shipping & Handling (DHL Express)',                 18.65,   1,    0.00, 5, 18.65);

SELECT setval('public.users_user_id_seq', (SELECT MAX(user_id) FROM public.users));
SELECT setval('public.suppliers_supplier_id_seq', (SELECT MAX(supplier_id) FROM public.suppliers));
SELECT setval('public.invoices_invoice_id_seq', (SELECT MAX(invoice_id) FROM public.invoices));
SELECT setval('public.invoice_items_item_id_seq', (SELECT MAX(item_id) FROM public.invoice_items));

COMMIT;
