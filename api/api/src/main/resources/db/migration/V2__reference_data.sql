--
-- Reference/lookup data the application logic depends on.
-- This must exist in every environment (dev, test, prod, demo) -- unlike
-- sample invoices/suppliers/users, which belong to the demo seed instead.
--

INSERT INTO public.roles (role_id, name) VALUES
    (1, 'EMPLOYEE'),
    (2, 'ACCOUNTANT'),
    (3, 'MANAGER'),
    (4, 'ADMIN');

SELECT setval('public.roles_role_id_seq', (SELECT MAX(role_id) FROM public.roles));

INSERT INTO public.invoice_statuses (status_id, name) VALUES
    (1, 'PENDING_ACCOUNTANT'),
    (2, 'PENDING_MANAGER'),
    (3, 'REJECTED'),
    (4, 'BOOKED'),
    (5, 'NEW');

SELECT setval('public.invoice_statuses_status_id_seq', (SELECT MAX(status_id) FROM public.invoice_statuses));
